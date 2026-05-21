"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadVideoRecording } from "@/lib/firebase";
import { AIProctoringSystem } from "@/lib/aiProctoring/monitoring_v2";
import { useProctorStore } from "@/lib/aiProctoring/proctorStore";
import { EnhancedDetectionEngine } from "@/lib/aiProctoring/enhanced_detection";
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
  const faceApiModelRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const faceMeshResultsRef = useRef<any>(null);

  // Proctor Engine
  const proctorEngineRef = useRef<AIProctoringSystem | null>(null);
  const detectionEngineRef = useRef<EnhancedDetectionEngine | null>(null);

  // Warning & Cooldown State (mirrored for UI)
  const warningCountRef = useRef(0);
  const [proctorLevel, setProctorLevel] = useState(0);
  const cooldownUntilRef = useRef<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [activeWarningModal, setActiveWarningModal] = useState<{ number: number, message: string } | null>(null);

  // UI State
  const [isMinimized, setIsMinimized] = useState(false);
  const [cameraSize, setCameraSize] = useState(320);
  const [cameraHealthState, setCameraHealthState] = useState<'safe' | 'warning' | 'violation'>('safe');
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

  const reconnectTimerRef = useRef<number | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  useEffect(() => {
    const updateSize = () => {
      setCameraSize(window.innerWidth <= 480 ? 220 : 320);
    };
    if (typeof window !== 'undefined') {
      updateSize();
      window.addEventListener('resize', updateSize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateSize);
      }
    };
  }, []);

  const markCameraState = (state: 'safe' | 'warning' | 'violation') => {
    setCameraHealthState(state);
  };

  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${src}`));
      document.body.appendChild(script);
    });
  };

  const detectFaceApiLandmarks = async (video: HTMLVideoElement) => {
    if (!faceApiModelRef.current) return null;
    try {
      const options = new faceApiModelRef.current.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.55 });
      return await faceApiModelRef.current.detectSingleFace(video, options).withFaceLandmarks(true);
    } catch (e) {
      return null;
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimerRef.current) return;
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      initCameraStream().catch(() => {});
    }, 2500);
  };

  const initCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const track = stream.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            markCameraState('warning');
            setStatusText('Camera disconnected, reconnecting...');
            scheduleReconnect();
          };
        }
      }
      markCameraState('safe');
      setStatusText('Camera feed stable. Neural tracking ready.');
      return stream;
    } catch (err) {
      setStatusText('Camera initialization failed. Retrying...');
      markCameraState('warning');
      scheduleReconnect();
      throw err;
    }
  };

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
    setCameraHealthState('violation');
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

    const handleDeviceChange = async () => {
      if (!isExamActiveRef.current) return;
      setStatusText('Camera devices changed; verifying feed...');
      markCameraState('warning');
      await initCameraStream().catch(() => {});
    };

    window.addEventListener('keyup', handleKeys);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullScreenExit);
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    devToolsInterval = setInterval(checkDevToolsAndScreens, 3000);

    const initProctoring = async () => {
      try {
        const stream = await initCameraStream();
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
          
          // Normalize to 0-100 scale for better readability
          const normalizedLevel = (avg / 255) * 100;
          
          // Record audio level to proctor engine for multi-frame validation
          const rms = avg / 255;
          if (proctorEngineRef.current) {
            proctorEngineRef.current.recordDetection({ 
              type: 'loud_noise', 
              confidence: rms, 
              payload: { avg, normalizedLevel } 
            });
          }

          // ENHANCED: Much more sensitive thresholds
          // 45% = suspicious/loud, 30% = moderate
          if (normalizedLevel > 45) {
            noiseSecRef.current += 1.5; // Faster accumulation
            setHealthStatus(prev => ({ ...prev, audio: `🔴 LOUD (${Math.round(normalizedLevel)}%)` }));
            if (noiseSecRef.current % 3 === 0) {
              console.debug(`[AUDIO] Loud noise detected: ${Math.round(normalizedLevel)}% (avg: ${Math.round(avg)})`);
            }
          } else if (normalizedLevel > 30) {
            noiseSecRef.current += 0.8;
            setHealthStatus(prev => ({ ...prev, audio: `🟡 Moderate (${Math.round(normalizedLevel)}%)` }));
          } else {
            noiseSecRef.current = Math.max(0, noiseSecRef.current - 1.5);
            setHealthStatus(prev => ({ ...prev, audio: "🟢 Quiet (<30%)" }));
          }
          checkAudioTimer = setTimeout(checkAudioLoop, 1000);
        };
        checkAudioLoop();

        // Load AI Models
        const loadModels = async () => {
          try {
            setStatusText("Loading BlazeFace, CocoSSD, FaceAPI & FaceMesh...");
            let coco = null;
            let blazeface = null;
            let faceapi = null;
            let FaceMeshClass = null;
            
            // Load CocoSSD
            try {
              setStatusText("Loading CocoSSD object detection...");
              coco = (window as any).cocoSsd ? await (window as any).cocoSsd.load() : null;
              if (coco) console.debug("[MODELS] CocoSSD loaded successfully");
            } catch (err) {
              console.error("[MODELS] CocoSSD load failed:", err);
            }
            
            // Load BlazeFace
            try {
              setStatusText("Loading BlazeFace face detection...");
              blazeface = (window as any).blazeface ? await (window as any).blazeface.load() : null;
              if (blazeface) console.debug("[MODELS] BlazeFace loaded successfully");
            } catch (err) {
              console.error("[MODELS] BlazeFace load failed:", err);
            }
            
            faceapi = (window as any).faceapi || null;
            FaceMeshClass = (window as any).FaceMesh || null;

            if (!coco || !blazeface || !faceapi || !FaceMeshClass) {
              // Wait for CDN scripts if not ready
              console.debug("[MODELS] Waiting for scripts to load from CDN...");
              await new Promise(resolve => setTimeout(resolve, 3000));
              if ((window as any).cocoSsd && !coco) {
                coco = await (window as any).cocoSsd.load();
                console.debug("[MODELS] CocoSSD loaded after CDN wait");
              }
              if ((window as any).blazeface && !blazeface) {
                blazeface = await (window as any).blazeface.load();
                console.debug("[MODELS] BlazeFace loaded after CDN wait");
              }
              faceapi = (window as any).faceapi || faceapi;
              FaceMeshClass = (window as any).FaceMesh || FaceMeshClass;
            }

            if (faceapi) {
              setStatusText("Loading FaceAPI models...");
              faceApiModelRef.current = faceapi;
              try {
                // Try new path structure first (0.22.2+)
                const weightPath = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/weights';
                await Promise.all([
                  faceapi.nets.tinyFaceDetector.loadFromUri(weightPath).catch(() => null),
                  faceapi.nets.faceLandmark68TinyNet.loadFromUri(weightPath).catch(() => null),
                  faceapi.nets.faceExpressionNet.loadFromUri(weightPath).catch(() => null)
                ]);
                console.debug("[MODELS] FaceAPI weights loaded successfully");
              } catch (faceErr) {
                console.warn("FaceAPI model loading failed, continuing with backup detection", faceErr);
              }
            }

            if (FaceMeshClass) {
              setStatusText("Initializing MediaPipe FaceMesh...");
              const faceMesh = new FaceMeshClass({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
              });
              faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,  // More lenient
                minTrackingConfidence: 0.5    // More lenient
              });
              faceMesh.onResults((results: any) => {
                faceMeshResultsRef.current = results;
              });
              faceMeshRef.current = faceMesh;
            }

            if (coco && blazeface) {
              cocoModelRef.current = coco;
              blazeModelRef.current = blazeface;
              detectionEngineRef.current = new EnhancedDetectionEngine();
              setIsModelsLoaded(true);

              // instantiate proctor engine once models loaded
              proctorEngineRef.current = new AIProctoringSystem({
                devMode: true,
                minSecondsForViolation: 12, // ENHANCED: Reduced from 15 to 12 seconds
                multipleFaceSeconds: 10, // ENHANCED: Reduced from 15 to 10 seconds
                evaluateIntervalMs: 800, // ENHANCED: Faster evaluation (was 900ms)
                onWarning: (level, label) => {
                  warningCountRef.current = level;
                  setProctorLevel(level);
                  setCameraHealthState(level >= 3 ? 'violation' : 'warning');
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
          let frameCount = 0;
          let detectionDebugMode = true; // Enable detailed logging for debugging

          visualInterval = setInterval(async () => {
            if (!isMounted.current || !isExamActiveRef.current || hasTerminatedRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Check if video is ready (readyState >= 2 means HAVE_CURRENT_DATA or better)
            if (!video || video.readyState < 2 || !cocoModelRef.current || !blazeModelRef.current) {
              if (frameCount % 30 === 0 && detectionDebugMode) {
                console.debug(`[VISION] Waiting for video ready. State: ${video?.readyState ?? 'no-video'}, Models: ${!!cocoModelRef.current && !!blazeModelRef.current}`);
              }
              frameCount++;
              return;
            }

            frameCount++;

            // 1. CocoSSD Object & Entity Detection
            let predictions: any[] = [];
            try {
              predictions = await cocoModelRef.current.detect(video);
            } catch (detectionErr) {
              if (frameCount % 60 === 0) console.error("[VISION] CocoSSD detection error:", detectionErr);
              return;
            }

            // ENHANCED: More lenient detection thresholds
            // Accept 0.30+ confidence for better multi-person detection
            const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.30);
            
            // Check for phones, remotes, laptops, etc. - ENHANCED with lower threshold
            const mobileItems = ['cell phone', 'mobile phone', 'phone', 'remote', 'laptop', 'keyboard', 'monitor', 'screen'];
            const phone = predictions.find((p: any) => mobileItems.some(item => p.class.toLowerCase().includes(item)) && p.score > 0.30);
            
            // DEBUG LOGGING every 30 frames
            if (frameCount % 30 === 0 && detectionDebugMode) {
              const allClasses = predictions.map(p => `${p.class}(${(p.score * 100).toFixed(0)}%)`).join(', ');
              console.debug(`[FRAME ${frameCount}] Detections: ${allClasses || 'none'}`);
              console.debug(`[DETECTION] Persons: ${persons.length}, Phone: ${phone ? phone.class : 'none'}`);
            }

            // 1.5 FaceAPI + MediaPipe FaceMesh detection
            const faceApiResult = video && await detectFaceApiLandmarks(video);
            if (faceMeshRef.current && video) {
              try {
                await faceMeshRef.current.send({ image: video });
              } catch {
                // ignore occasional frame send errors
              }
            }
            const faceMeshResult = faceMeshResultsRef.current?.multiFaceLandmarks?.[0] ?? null;

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
              missingFaceSecRef.current = Math.max(0, missingFaceSecRef.current - 1);
              
              // ENHANCED: Use face positioning analysis
              const faceData = detectionEngineRef.current?.analyzeFacePosition(faces, video.videoWidth, video.videoHeight);
              if (faceData) {
                if (faceData.isCentered) {
                  setHealthStatus(prev => ({ ...prev, face: "✅ CENTERED - 100% Locked" }));
                } else {
                  // Face is not centered - provide guidance
                  const guidance = detectionEngineRef.current?.getFaceCenteringGuidance(faceData) || "🟡 Recenter face";
                  setHealthStatus(prev => ({ ...prev, face: guidance }));
                  
                  // Record off-center issue if significant
                  if (faceData.offsetX > 0.20 || faceData.offsetY > 0.20) {
                    proctorEngineRef.current?.recordDetection({ 
                      type: 'face_missing', 
                      confidence: 0.50, 
                      payload: { reason: 'poor_positioning', offsetX: faceData.offsetX, offsetY: faceData.offsetY } 
                    });
                  }
                }
              } else {
                setHealthStatus(prev => ({ ...prev, face: "🟢 Face Detected" }));
              }
            }

            // B. Multiple Persons Check - ENHANCED
            if (persons.length > 1) {
              multiPersonSecRef.current += 1.5; // ENHANCED: Faster accumulation
              setHealthStatus(prev => ({ ...prev, multiPerson: `🔴 ${persons.length} People Detected` }));
              // confidence: average person score
              const avgScore = persons.reduce((s: number, p: any) => s + p.score, 0) / persons.length;
              proctorEngineRef.current?.recordDetection({ 
                type: 'multiple_faces', 
                confidence: Math.min(1, Math.max(0.90, avgScore)), // Higher confidence when multiple detected
                payload: { personCount: persons.length, avgScore, scores: persons.map(p => p.score) }
              });
            } else {
              multiPersonSecRef.current = Math.max(0, multiPersonSecRef.current - 1);
              setHealthStatus(prev => ({ ...prev, multiPerson: "🟢 Single Entity" }));
            }

            // C. Phone Detection Check - ENHANCED
            let phoneAnalysis = null;
            if (detectionEngineRef.current) {
              phoneAnalysis = detectionEngineRef.current.analyzePhonePresence(predictions, 0.30);
            }
            
            const phoneDetected = phone || phoneAnalysis?.detected;
            if (phoneDetected) {
              phoneSecRef.current += 1.5; // ENHANCED: Faster accumulation
              const phoneType = phoneAnalysis?.type || phone?.class || 'Mobile Device';
              const confidence = Math.max(phone?.score || 0, phoneAnalysis?.confidence || 0.80);
              setHealthStatus(prev => ({ ...prev, phone: `🔴 ${phoneType} Detected (${Math.round(confidence * 100)}%)` }));
              proctorEngineRef.current?.recordDetection({ 
                type: 'phone', 
                confidence: Math.min(0.99, Math.max(0.85, confidence)), // Boost to ensure detection
                payload: { 
                  type: phoneType,
                  analysis: phoneAnalysis, 
                  directDetection: phone?.class,
                  confidence: confidence
                } 
              });
            } else {
              phoneSecRef.current = Math.max(0, phoneSecRef.current - 1);
              setHealthStatus(prev => ({ ...prev, phone: "🟢 Clear" }));
            }

            // D. Head Pose & Eye Diversion Check
            let headTurnDetected = false;
            let orientationConfidence = 0;
            let gazeWarning = false;

            const recordHeadWarning = (confidence: number, payload: any) => {
              headTurnSecRef.current += 1;
              setHealthStatus(prev => ({ ...prev, eyeHead: "🟡 Eyes/Head Diverted" }));
              proctorEngineRef.current?.recordDetection({ type: 'head_turned', confidence, payload });
            };

            if (faceApiResult?.landmarks) {
              const leftEye = faceApiResult.landmarks.getLeftEye();
              const rightEye = faceApiResult.landmarks.getRightEye();
              const nose = faceApiResult.landmarks.getNose()[0];
              const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
              const faceWidth = Math.abs(rightEye[3].x - leftEye[0].x);
              const yawRatio = (nose.x - eyeCenterX) / (faceWidth + 0.0001);
              orientationConfidence = Math.max(orientationConfidence, Math.min(1, Math.abs(yawRatio) / 1.2));

              if (Math.abs(yawRatio) > 0.28) {
                headTurnDetected = true;
                recordHeadWarning(orientationConfidence, { source: 'faceapi', yawRatio });
              }

              const leftIris = leftEye[4];
              const rightIris = rightEye[4];
              const leftRatio = (leftIris.x - leftEye[0].x) / Math.max(0.001, leftEye[3].x - leftEye[0].x);
              const rightRatio = (rightIris.x - rightEye[0].x) / Math.max(0.001, rightEye[3].x - rightEye[0].x);
              if (leftRatio < 0.22 || leftRatio > 0.78 || rightRatio < 0.22 || rightRatio > 0.78) {
                gazeWarning = true;
              }
            }

            if (faceMeshResult) {
              const leftEyePoint = faceMeshResult[33];
              const rightEyePoint = faceMeshResult[263];
              const noseTip = faceMeshResult[1];
              const eyeCenterX = (leftEyePoint.x + rightEyePoint.x) / 2;
              const faceWidth = Math.abs(rightEyePoint.x - leftEyePoint.x);
              const yawRatio = (noseTip.x - eyeCenterX) / (faceWidth + 0.0001);
              const pitchRatio = (noseTip.y - (leftEyePoint.y + rightEyePoint.y) / 2) / (faceWidth + 0.0001);
              orientationConfidence = Math.max(orientationConfidence, Math.min(1, Math.sqrt(yawRatio * yawRatio + pitchRatio * pitchRatio) * 1.3));

              if (Math.abs(yawRatio) > 0.25 || Math.abs(pitchRatio) > 0.28) {
                headTurnDetected = true;
                recordHeadWarning(orientationConfidence, { source: 'facemesh', yawRatio, pitchRatio });
              }

              const leftIris = faceMeshResult[468];
              const rightIris = faceMeshResult[473];
              if (leftIris && rightIris) {
                const leftEyeWidth = Math.abs(faceMeshResult[133].x - faceMeshResult[33].x);
                const rightEyeWidth = Math.abs(faceMeshResult[362].x - faceMeshResult[263].x);
                const leftGaze = (leftIris.x - faceMeshResult[33].x) / Math.max(0.01, leftEyeWidth);
                const rightGaze = (rightIris.x - faceMeshResult[263].x) / Math.max(0.01, rightEyeWidth);
                if (leftGaze < 0.18 || leftGaze > 0.82 || rightGaze < 0.18 || rightGaze > 0.82) {
                  gazeWarning = true;
                }
              }
            }

            if (headTurnDetected || gazeWarning) {
              headTurnSecRef.current += gazeWarning ? 1 : 0;
              setHealthStatus(prev => ({ ...prev, eyeHead: gazeWarning ? "🟡 Eyes Away" : "🟡 Head Diverted" }));
              if (!headTurnDetected) {
                proctorEngineRef.current?.recordDetection({ type: 'eyes_off', confidence: 0.88, payload: { gazeWarning } });
              }
            } else {
              headTurnSecRef.current = Math.max(0, headTurnSecRef.current - 2);
              setHealthStatus(prev => ({ ...prev, eyeHead: "🟢 Centered" }));
            }

            if (!headTurnDetected && !gazeWarning) {
              headTurnSecRef.current = Math.max(0, headTurnSecRef.current - 2);
            }

            if (headTurnSecRef.current > 0 && !headTurnDetected && !gazeWarning) {
              headTurnSecRef.current = Math.max(0, headTurnSecRef.current - 2);
            }

            if (faces.length === 1 && !headTurnDetected && !gazeWarning) {
              setHealthStatus(prev => ({ ...prev, eyeHead: "🟢 Centered" }));
            }

            if (headTurnDetected || gazeWarning) {
              proctorEngineRef.current?.recordDetection({ type: 'head_turned', confidence: orientationConfidence || 0.75, payload: { headTurnDetected, gazeWarning } });
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
          }, 900);
        };

        const ensureScripts = async () => {
          setStatusText("Loading AI proctoring libraries...");
          try {
            // Suppress TensorFlow backend warnings
            if (typeof window !== 'undefined' && (window as any).tf) {
              (window as any).tf.ENV.set('IS_BROWSER', true);
            }
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface");
            await loadScript("https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
            loadModels();
          } catch (scriptErr) {
            console.error("Failed to load AI scripts, attempting graceful fallback", scriptErr);
            loadModels();
          }
        };

        ensureScripts();

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
      if (navigator.mediaDevices && typeof navigator.mediaDevices.removeEventListener === 'function') {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  return (
    <>
      {/* Professional HUD Floating Panel */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        width: isMinimized ? 88 : cameraSize,
        minWidth: isMinimized ? 88 : cameraSize,
        height: isMinimized ? 88 : cameraSize,
        minHeight: isMinimized ? 88 : cameraSize,
        borderRadius: isMinimized ? 999 : 28,
        border: `3px solid ${proctorLevel >= 3 ? '#dc2626' : proctorLevel === 2 ? '#f97316' : proctorLevel === 1 ? '#fbbf24' : '#22c55e'}`,
        backgroundColor: isMinimized ? '#0f172a' : 'rgba(15, 23, 42, 0.92)',
        boxShadow: '0 35px 80px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        cursor: isMinimized ? 'pointer' : 'default',
        transition: 'all 0.25s ease'
      }} onClick={() => isMinimized && setIsMinimized(false)}>
        
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
            <div style={{
              position: 'relative',
              width: '100%',
              height: '0',
              paddingBottom: '100%',
              backgroundColor: '#000',
              borderRadius: 24,
              overflow: 'hidden',
              border: `2px solid ${cameraHealthState === 'violation' ? '#dc2626' : cameraHealthState === 'warning' ? '#f97316' : '#22c55e'}`,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)'
            }}>
              <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
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
