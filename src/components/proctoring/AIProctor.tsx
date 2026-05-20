"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadVideoRecording } from "@/lib/firebase";
import { AIProctoringSystem } from "@/lib/aiProctoring/monitoring_v2";
import { useProctorStore } from "@/lib/aiProctoring/proctorStore";
import { 
  Shield, 
  Eye, 
  Volume2, 
  Maximize, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Camera as CameraIcon, 
  Smartphone, 
  Users, 
  Monitor, 
  Terminal,
  Minimize2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ProctorProps {
  onViolation: (type: string, message: string) => void;
  isExamActive: boolean;
  observationLevel?: number;
  observationTimer?: number | null;
}

export default function AIProctor({ onViolation, isExamActive }: ProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // AI Models
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [statusText, setStatusText] = useState("Initializing Neural Vision Hub...");
  const cocoModelRef = useRef<any>(null);
  const blazeModelRef = useRef<any>(null);

  // Proctor Engine
  const proctorEngineRef = useRef<AIProctoringSystem | null>(null);

  // Warning & Cooldown State (mirrored for UI)
  const warningCountRef = useRef(0);
  const [proctorLevel, setProctorLevel] = useState(0);
  const cooldownUntilRef = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [activeWarningModal, setActiveWarningModal] = useState<{ number: number, message: string } | null>(null);

  // UI State
  const [isMinimized, setIsMinimized] = useState(false);
  const [healthStatus, setHealthStatus] = useState({
    face: "🟢 100% Locked",
    eyeHead: "🟢 Centered",
    phone: "🟢 Clear",
    multiPerson: "🟢 Single Entity",
    audio: "🟢 Quiet (<45dB)",
    integrity: "🟢 Fullscreen"
  });

  // Continuous Accumulator Refs (for display only)
  const missingFaceSecRef = useRef(0);
  const headTurnSecRef = useRef(0);
  const multiPersonSecRef = useRef(0);
  const phoneSecRef = useRef(0);
  const noiseSecRef = useRef(0);

  // System & Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMounted = useRef(true);
  const isExamActiveRef = useRef(isExamActive);
  const isFullscreenInitialized = useRef(false);
  const hasTerminatedRef = useRef(false);

  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  useEffect(() => {
    if (isExamActive) {
      const timer = setTimeout(() => {
        isFullscreenInitialized.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      isFullscreenInitialized.current = false;
    }
  }, [isExamActive]);

  // Cooldown countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (cooldownUntilRef.current > now) {
        setCooldownRemaining(Math.ceil((cooldownUntilRef.current - now) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // INSTANT TERMINATION HANDLER
  const handleInstantTermination = (code: string, message: string) => {
    if (!isExamActiveRef.current || hasTerminatedRef.current) return;
    hasTerminatedRef.current = true;
    setHealthStatus(prev => ({ ...prev, integrity: "🔴 Breach Detected" }));
    setStatusText(`CRITICAL BREACH: ${code}`);
    onViolation(code, message);
  };

  useEffect(() => {
    isMounted.current = true;
    let checkAudioTimer: NodeJS.Timeout;
    let visualInterval: NodeJS.Timeout;
    let devToolsInterval: NodeJS.Timeout;

    // Window & Environment Security Listeners
    const handleVisibility = () => {
      if (document.hidden && isExamActiveRef.current) {
        handleInstantTermination("TAB_SWITCH", "Unauthorized tab switching or backgrounding detected.");
      }
    };

    const handleBlur = () => {
      if (isExamActiveRef.current) {
        handleInstantTermination("TAB_SWITCH", "Window focus lost. Unauthorized switching detected.");
      }
    };

    const handleFullScreenExit = () => {
      if (!document.fullscreenElement && isExamActiveRef.current && isFullscreenInitialized.current) {
        handleInstantTermination("FULLSCREEN_EXIT", "Exit from full-screen mode prohibited during assessment.");
      }
    };

    const handleKeys = (e: KeyboardEvent) => {
      if (!isExamActiveRef.current) return;
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) || (e.ctrlKey && (e.key === 'p' || e.key === 'P'))) {
        handleInstantTermination("SCREENSHOT", "Unauthorized screenshot or printing attempt detected.");
      }
    };

    const checkDevToolsAndScreens = () => {
      if (!isMounted.current || !isExamActiveRef.current) return;
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > 180 || hDiff > 180) {
        handleInstantTermination("DEVTOOLS", "Unauthorized Developer Tools inspection detected.");
      }
      if (window.screen && (window.screen as any).isExtended) {
        handleInstantTermination("EXTENSION_CHEAT", "Unauthorized external display detected.");
      }
    };

    window.addEventListener('keyup', handleKeys);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullScreenExit);
    devToolsInterval = setInterval(checkDevToolsAndScreens, 3000);

    const initProctoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Video Recording Service
        const options = { mimeType: 'video/webm' };
        if (MediaRecorder.isTypeSupported(options.mimeType)) {
          mediaRecorderRef.current = new MediaRecorder(stream, options);
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };
          mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const email = localStorage.getItem("geonixa_current_user") || "anonymous";
            await uploadVideoRecording(email, blob);
          };
          mediaRecorderRef.current.start(5000);
        }

        // Audio Acoustic Level Detection
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLoop = () => {
          if (!isMounted.current || !isExamActiveRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

          // Record audio RMS to proctor engine for multi-frame validation
          const rms = avg / 255;
          if (proctorEngineRef.current) {
            proctorEngineRef.current.recordDetection({ type: 'loud_noise', confidence: rms, payload: { avg } });
          }

          if (avg > 75) {
            noiseSecRef.current += 1;
            setHealthStatus(prev => ({ ...prev, audio: `🟡 Loud (${Math.round(avg)}dB)` }));
          } else {
            noiseSecRef.current = Math.max(0, noiseSecRef.current - 2);
            setHealthStatus(prev => ({ ...prev, audio: "🟢 Quiet (<45dB)" }));
          }
          checkAudioTimer = setTimeout(checkAudioLoop, 1000);
        };
        checkAudioLoop();

        // Load AI Models
        const loadModels = async () => {
          try {
            setStatusText("Loading BlazeFace & CocoSSD Neural Nets...");
            let coco = (window as any).cocoSsd ? await (window as any).cocoSsd.load() : null;
            let blazeface = (window as any).blazeface ? await (window as any).blazeface.load() : null;

            if (!coco || !blazeface) {
              // Wait for CDN scripts if not ready
              await new Promise(resolve => setTimeout(resolve, 2000));
              if ((window as any).cocoSsd) coco = await (window as any).cocoSsd.load();
              if ((window as any).blazeface) blazeface = await (window as any).blazeface.load();
            }

            if (coco && blazeface) {
              cocoModelRef.current = coco;
              blazeModelRef.current = blazeface;
              setIsModelsLoaded(true);

              // instantiate proctor engine once models loaded
              proctorEngineRef.current = new AIProctoringSystem({
                devMode: true,
                onWarning: (level, label) => {
                  warningCountRef.current = level;
                  setProctorLevel(level);
                  const msg = label.replace(/_/g, ' ').toUpperCase();
                  if (level === 1) {
                    cooldownUntilRef.current = Date.now() + 2 * 60 * 1000;
                    setActiveWarningModal({ number: 1, message: `Observed: ${msg}` });
                    onViolation("WARNING_1", `Observed: ${msg}`);
                  } else if (level === 2) {
                    cooldownUntilRef.current = Date.now() + 5 * 60 * 1000;
                    setActiveWarningModal({ number: 2, message: `Repeated: ${msg}` });
                    onViolation("WARNING_2", `Repeated: ${msg}`);
                  } else if (level >= 3) {
                    setActiveWarningModal({ number: 3, message: `Final: ${msg}` });
                    onViolation("WARNING_3", `Final: ${msg}`);
                    handleInstantTermination('FINAL_VIOLATION', `Repeated violations: ${msg}`);
                  }
                },
                onTerminate: (reason) => {
                  handleInstantTermination('TERMINATED', `Auto-termination: ${reason}`);
                }
              });

              setStatusText("AI PROCTOR: TRACKING ACTIVE");
              startRealtimeVision();
            } else {
              setStatusText("AI Initialization Deferred. Retrying...");
            }
          } catch (e) {
            console.error("Model load error:", e);
            setStatusText("AI Vision Engine Backup Active");
          }
        };

        const startRealtimeVision = () => {
          let lastFrameUpload = Date.now();

          visualInterval = setInterval(async () => {
            if (!isMounted.current || !isExamActiveRef.current || hasTerminatedRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || video.readyState !== 4 || !cocoModelRef.current || !blazeModelRef.current) return;

            // 1. CocoSSD Object & Entity Detection
            const predictions = await cocoModelRef.current.detect(video);
            const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.65);
            const phone = predictions.find((p: any) => (p.class === 'cell phone' || p.class === 'remote') && p.score > 0.65);

            // 2. BlazeFace Landmark & Orientation Detection
            const faces = await blazeModelRef.current.estimateFaces(video, false);

            // Bounding box / Canvas Drawing
            if (canvas && !isMinimized) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faces.forEach((f: any) => {
                  const [startPt, endPt] = [f.topLeft as [number, number], f.bottomRight as [number, number]];
                  ctx.strokeStyle = "#F97316";
                  ctx.lineWidth = 2;
                  ctx.strokeRect(startPt[0], startPt[1], endPt[0] - startPt[0], endPt[1] - startPt[1]);

                  // Draw Landmarks
                  ctx.fillStyle = "#10B981";
                  (f.landmarks as [number, number][]).forEach(pt => {
                    ctx.beginPath();
                    ctx.arc(pt[0], pt[1], 3, 0, 2 * Math.PI);
                    ctx.fill();
                  });
                });
              }
            }

            // A. Face Absence Check - record to proctor engine
            if (faces.length === 0) {
              missingFaceSecRef.current += 1;
              setHealthStatus(prev => ({ ...prev, face: "🟡 Face Missing" }));
              proctorEngineRef.current?.recordDetection({ type: 'face_missing', confidence: 0.95 });
            } else {
              missingFaceSecRef.current = Math.max(0, missingFaceSecRef.current - 2);
              setHealthStatus(prev => ({ ...prev, face: "🟢 100% Locked" }));
            }

            // B. Multiple Persons Check
            if (persons.length > 1) {
              multiPersonSecRef.current += 1;
              setHealthStatus(prev => ({ ...prev, multiPerson: "🔴 Multi-Entity Detected" }));
              // confidence: average person score
              const avgScore = persons.reduce((s: number, p: any) => s + p.score, 0) / persons.length;
              proctorEngineRef.current?.recordDetection({ type: 'multiple_faces', confidence: Math.min(1, Math.max(0, avgScore)) });
            } else {
              multiPersonSecRef.current = Math.max(0, multiPersonSecRef.current - 2);
              setHealthStatus(prev => ({ ...prev, multiPerson: "🟢 Single Entity" }));
            }

            // C. Phone Detection Check
            if (phone) {
              phoneSecRef.current += 1;
              setHealthStatus(prev => ({ ...prev, phone: "🔴 Mobile Device Visible" }));
              proctorEngineRef.current?.recordDetection({ type: 'phone', confidence: phone.score || 0.9, payload: phone });
            } else {
              phoneSecRef.current = Math.max(0, phoneSecRef.current - 2);
              setHealthStatus(prev => ({ ...prev, phone: "🟢 Clear" }));
            }

            // D. Head Pose & Eye Diversion Check
            if (faces.length === 1) {
              const f = faces[0];
              const rightEye = f.landmarks[0] as [number, number];
              const leftEye = f.landmarks[1] as [number, number];
              const nose = f.landmarks[2] as [number, number];
              
              const eyeCenterX = (rightEye[0] + leftEye[0]) / 2;
              const eyeDist = Math.abs(leftEye[0] - rightEye[0]);
              const yawRatio = (nose[0] - eyeCenterX) / (eyeDist + 0.0001);

              // map yawRatio magnitude to a confidence between 0 and 1
              const yawConfidence = Math.min(1, Math.abs(yawRatio) / 1.2);

              if (Math.abs(yawRatio) > 0.45) {
                headTurnSecRef.current += 1;
                setHealthStatus(prev => ({ ...prev, eyeHead: "🟡 Eyes/Head Diverted" }));
                proctorEngineRef.current?.recordDetection({ type: 'head_turned', confidence: yawConfidence, payload: { yawRatio } });
              } else {
                headTurnSecRef.current = Math.max(0, headTurnSecRef.current - 2);
                setHealthStatus(prev => ({ ...prev, eyeHead: "🟢 Centered" }));
              }
            }

            // Live snapshot upload every 30s
            if (Date.now() - lastFrameUpload > 30000) {
              lastFrameUpload = Date.now();
              const snapCanvas = document.createElement("canvas");
              snapCanvas.width = video.videoWidth / 2;
              snapCanvas.height = video.videoHeight / 2;
              const ctx = snapCanvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
                snapCanvas.toBlob(async (blob) => {
                  if (blob) {
                    const { uploadLiveFrame } = await import("@/lib/firebase");
                    const email = localStorage.getItem("geonixa_current_user") || "anonymous";
                    await uploadLiveFrame(email, blob).catch(() => {});
                  }
                }, "image/jpeg", 0.5);
              }
            }
          }, 1000);
        };

        // Inject Script Tags if not present
        if (!(window as any).tf) {
          const tfScript = document.createElement("script");
          tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
          tfScript.async = true;
          document.body.appendChild(tfScript);
          tfScript.onload = () => {
            const cocoScript = document.createElement("script");
            cocoScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd";
            cocoScript.async = true;
            document.body.appendChild(cocoScript);
            
            const blazeScript = document.createElement("script");
            blazeScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface";
            blazeScript.async = true;
            document.body.appendChild(blazeScript);
            
            blazeScript.onload = loadModels;
          };
        } else {
          loadModels();
        }

      } catch (err) {
        setStatusText("Hardware Error: Camera/Mic Access Denied");
        setHealthStatus(prev => ({ ...prev, face: "🔴 Camera Inaccessible" }));
      }
    };

    initProctoring();

    return () => {
      isMounted.current = false;
      clearTimeout(checkAudioTimer);
      clearInterval(visualInterval);
      clearInterval(devToolsInterval);
      window.removeEventListener('keyup', handleKeys);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullScreenExit);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  return (
    <>
      {/* Professional HUD Floating Panel */}
      <div className={`fixed bottom-6 right-6 z-9999 transition-all duration-500 font-sans ${
        isMinimized ? "w-16 h-16 rounded-full overflow-hidden shadow-2xl border-2 border-emerald-500 cursor-pointer hover:scale-105" : "w-80 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.9)]"
      }`} onClick={() => isMinimized && setIsMinimized(false)}>
        
        {/* Minimized View */}
        {isMinimized ? (
          <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
          </div>
        ) : (
          /* Expanded Enterprise HUD */
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF5A1F]" />
                <span className="text-xs font-black text-white uppercase tracking-wider">AI Guard v5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  proctorLevel === 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                  proctorLevel === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  proctorLevel === 2 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                  "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                }`}>
                  {proctorLevel === 0 ? "NOMINAL" : `WARNING ${proctorLevel}/3`}
                </span>
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Camera & Overlay Canvas Container */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
              
              {/* Cooldown Badge Overlay */}
              {cooldownRemaining > 0 && (
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-orange-500/50 flex items-center gap-1.5 text-[9px] font-black text-orange-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                  QUIET OBSERVATION: {Math.floor(cooldownRemaining/60)}m {cooldownRemaining%60}s
                </div>
              )}
              
              <div className="absolute bottom-2 right-2 text-[8px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-emerald-400 tracking-tighter">
                60 FPS | SECURE
              </div>
            </div>

            {/* Granular Health Indicators */}
            <div className="space-y-2 pt-1 border-t border-slate-900/80">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><CameraIcon className="w-3 h-3 text-slate-500" /> Face</span>
                  <span className="font-mono text-xs">{healthStatus.face}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><Eye className="w-3 h-3 text-slate-500" /> Focus</span>
                  <span className="font-mono text-xs">{healthStatus.eyeHead}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-500" /> Phone</span>
                  <span className="font-mono text-xs">{healthStatus.phone}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><Users className="w-3 h-3 text-slate-500" /> Entities</span>
                  <span className="font-mono text-xs">{healthStatus.multiPerson}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><Volume2 className="w-3 h-3 text-slate-500" /> Mic</span>
                  <span className="font-mono text-xs">{healthStatus.audio}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 font-bold flex items-center gap-1"><Monitor className="w-3 h-3 text-slate-500" /> Integrity</span>
                  <span className="font-mono text-xs">{healthStatus.integrity}</span>
                </div>
              </div>
            </div>

            <div className="text-[9px] font-mono text-center text-slate-500 pt-1 tracking-wider uppercase">
              {statusText}
            </div>
          </div>
        )}
      </div>

      {/* Professional Warning Modal Overlay */}
      <AnimatePresence>
        {activeWarningModal && activeWarningModal.number < 3 && (
          <div className="fixed inset-0 z-99999 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-950 border border-orange-500/50 rounded-3xl p-8 max-w-xl w-full shadow-[0_0_80px_rgba(249,115,22,0.3)] text-center space-y-6"
            >
              <div className="w-16 h-16 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-[0_0_30px_#F97316]">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                  AI Proctoring Integrity Notice (Warning {activeWarningModal.number} of 3)
                </h2>
                <p className="text-sm font-bold text-slate-300">
                  {activeWarningModal.message}
                </p>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-2xl text-left space-y-2 border border-slate-800">
                <div className="text-xs font-black text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Neural Observation Protocol Engaged
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeWarningModal.number === 1 
                    ? "Our neural vision engine will conduct quiet observation for the next 2 minutes. Please keep your eyes centered on the test interface and maintain a professional posture."
                    : "Strict critical observation protocol is active for the next 5 minutes. Any further focus loss, device detection, or acoustic abnormality will initiate an automatic final session termination."}
                </p>
              </div>
              <button 
                onClick={() => setActiveWarningModal(null)}
                className="px-8 py-3.5 bg-linear-to-r from-orange-500 to-[#FF5A1F] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg cursor-pointer w-full"
              >
                I Acknowledge and Will Focus on Exam Screen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
