import { useProctorStore } from './proctorStore';

export type DetectionRecord = {
  type: string;
  confidence: number;
  payload?: any;
  timestamp?: number;
};

export type ProctorOptions = {
  minConfidence?: number;
  minSecondsForViolation?: number;
  multipleFaceSeconds?: number;
  evaluateIntervalMs?: number;
  onWarning?: (level: number, type: string) => void;
  onTerminate?: (reason: string) => void;
  devMode?: boolean;
};

export class AIProctoringSystem {
  private frameBuffer: DetectionRecord[] = [];
  private opts: Required<ProctorOptions>;
  private evalTimer?: number | null = null;
  private lastWarningAt: Record<string, number> = {};
  private consecutiveWindowMs: number;

  constructor(opts?: ProctorOptions) {
    this.opts = {
      minConfidence: opts?.minConfidence ?? 0.85,
      minSecondsForViolation: opts?.minSecondsForViolation ?? 15,
      multipleFaceSeconds: opts?.multipleFaceSeconds ?? 15,
      evaluateIntervalMs: opts?.evaluateIntervalMs ?? 900,
      onWarning: opts?.onWarning ?? (() => {}),
      onTerminate: opts?.onTerminate ?? (() => {}),
      devMode: opts?.devMode ?? false,
    };

    this.consecutiveWindowMs = this.opts.minSecondsForViolation * 1000;

    if (this.opts.devMode && typeof window !== 'undefined') {
      (window as any).__PROCTOR_LOGS__ = (window as any).__PROCTOR_LOGS__ || [];
    }

    this.attachVisibilityHandlers();
    this.startEvaluationLoop();
  }

  recordDetection(d: DetectionRecord) {
    const rec: DetectionRecord = {
      ...d,
      timestamp: d.timestamp ?? Date.now(),
    };
    this.frameBuffer.push(rec);
    const cutoff = Date.now() - Math.max(this.consecutiveWindowMs * 2, 60_000);
    this.frameBuffer = this.frameBuffer.filter((r) => r.timestamp! >= cutoff);

    if (this.opts.devMode) this.devLog('recordDetection', rec);
  }

  private startEvaluationLoop() {
    if (this.evalTimer) return;
    this.evalTimer = window.setInterval(() => this.evaluate(), this.opts.evaluateIntervalMs);
  }

  stopEvaluationLoop() {
    if (this.evalTimer) {
      clearInterval(this.evalTimer);
      this.evalTimer = null;
    }
  }

  private evaluate() {
    const now = Date.now();
    this.evaluatePersistentViolation('face_missing', (r) => r.type === 'face_missing', this.consecutiveWindowMs, this.opts.minConfidence, now);
    this.evaluatePersistentViolation('head_turned', (r) => r.type === 'head_turned', this.consecutiveWindowMs, this.opts.minConfidence, now);
    this.evaluatePersistentViolation('eyes_off', (r) => r.type === 'eyes_off', this.consecutiveWindowMs, this.opts.minConfidence, now);
    this.evaluatePersistentViolation('multiple_faces', (r) => r.type === 'multiple_faces', this.opts.multipleFaceSeconds * 1000, this.opts.minConfidence, now);
    this.evaluatePersistentViolation('phone', (r) => r.type === 'phone', this.consecutiveWindowMs, 0.90, now);
    this.evaluatePersistentViolation('loud_noise', (r) => r.type === 'loud_noise', this.consecutiveWindowMs, this.opts.minConfidence, now);
  }

  private evaluatePersistentViolation(
    label: string,
    predicate: (rec: DetectionRecord) => boolean,
    requiredMs: number,
    confidenceThreshold: number,
    now: number
  ) {
    const relevant = this.frameBuffer.filter((r) => predicate(r) && (r.confidence ?? 0) >= confidenceThreshold);
    if (this.opts.devMode) this.devLog('evaluate', { label, count: relevant.length, requiredMs, confidenceThreshold });
    if (relevant.length === 0) return;
    const streak = this.computeLongestStreak(relevant);
    if (streak >= requiredMs) {
      const lastIssued = this.lastWarningAt[label] ?? 0;
      const cooldown = this.getCooldownMsForLabel(label);
      if (now - lastIssued > cooldown) {
        this.issueWarning(label);
        this.lastWarningAt[label] = now;
      } else if (this.opts.devMode) {
        this.devLog('cooldown-blocked', { label, lastIssued, cooldown });
      }
    }
  }

  private computeLongestStreak(records: DetectionRecord[]) {
    if (records.length === 0) return 0;
    const times = records.map((r) => r.timestamp!).sort((a, b) => a - b);
    let longest = 0;
    let seqStart = times[0];
    let last = times[0];
    const gapThreshold = 1200;
    for (let i = 1; i < times.length; i++) {
      const t = times[i];
      if (t - last <= gapThreshold) {
        last = t;
      } else {
        longest = Math.max(longest, last - seqStart);
        seqStart = t;
        last = t;
      }
    }
    longest = Math.max(longest, last - seqStart);
    return longest;
  }

  private getCooldownMsForLabel(label: string) {
    switch (label) {
      case 'face_missing':
        return 2 * 60 * 1000;
      case 'head_turned':
      case 'eyes_off':
        return 5 * 60 * 1000;
      case 'multiple_faces':
        return 2 * 60 * 1000;
      case 'phone':
        return 5 * 60 * 1000;
      case 'loud_noise':
        return 2 * 60 * 1000;
      default:
        return 2 * 60 * 1000;
    }
  }

  private issueWarning(label: string) {
    const store = useProctorStore.getState();
    const count = (store.warnings[label] || 0) + 1;
    useProctorStore.getState().setWarning(label);
    const level = count;
    try {
      this.opts.onWarning(level, label);
    } catch (e) {
      this.devLog('onWarning-error', { e });
    }
    if (level === 1) {
      this.devLog('warning-1', { label });
    } else if (level === 2) {
      this.devLog('warning-2', { label });
    } else if (level >= 3) {
      this.devLog('warning-3', { label });
      useProctorStore.getState().setTermination(`violation:${label}`);
      try {
        this.opts.onTerminate(`violation:${label}`);
      } catch (e) {
        this.devLog('onTerminate-error', { e });
      }
    }
  }

  private attachVisibilityHandlers() {
    if (typeof document === 'undefined') return;
    const onVisibility = () => {
      if (document.hidden) {
        useProctorStore.getState().setTermination('tab_switch_or_hidden');
        try {
          this.opts.onTerminate('tab_switch_or_hidden');
        } catch (e) {
          this.devLog('onTerminate-error', { e });
        }
      }
    };
    const onBlur = () => {
      useProctorStore.getState().setTermination('window_blur');
      try {
        this.opts.onTerminate('window_blur');
      } catch (e) {
        this.devLog('onTerminate-error', { e });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        useProctorStore.getState().setTermination('fullscreen_exit');
        try {
          this.opts.onTerminate('fullscreen_exit');
        } catch (e) {
          this.devLog('onTerminate-error', { e });
        }
      }
    });
  }

  private devLog(tag: string, payload?: any) {
    if (!this.opts.devMode) return;
    const entry = { tag, payload, t: Date.now() };
    try {
      (window as any).__PROCTOR_LOGS__.push(entry);
    } catch (e) {
    }
    console.debug('[AIProctoring]', tag, payload);
  }
}
