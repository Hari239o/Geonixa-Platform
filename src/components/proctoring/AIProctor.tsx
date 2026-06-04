"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
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
  isRound4?: boolean;
}

export default function AIProctor({ onViolation, isExamActive, isRound4 = false }: ProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // AI Models
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [statusText, setStatusText] = useState("Initializing Neural Vision Hub...");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
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

  // System Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMounted = useRef(true);
  const isExamActiveRef = useRef(isExamActive);
  const isFullscreenInitialized = useRef(false);
  const hasTerminatedRef = useRef(false);

  const reconnectTimerRef = useRef<number | null>(null);
  const checkAudioTimerRef = useRef<number | null>(null);
  const visualFrameRef = useRef<number | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  useEffect(() => {
    const updateSize = () => {
      setCameraSize(window.innerWidth <= 640 ? 220 : 320);
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


  const attachStreamToVideo = async (video: HTMLVideoElement, stream: MediaStream) => {
    if (video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('error', handleError);
      };
      const handleLoaded = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error('Video element failed to attach media stream.'));
      };
      video.addEventListener('loadedmetadata', handleLoaded);
      video.addEventListener('error', handleError);
      if (video.readyState >= 2) {
        cleanup();
        resolve();
      }
    }).catch((attachErr) => {
      console.warn('Video stream attach warning:', attachErr);
    });

    try {
      await video.play();
    } catch (playErr) {
      console.warn('Video playback prevented or interrupted:', playErr);
    }
  };

  const setupStreamDependentServices = async (stream: MediaStream) => {
    if (!detectionEngineRef.current) {
      detectionEngineRef.current = new EnhancedDetectionEngine();
    }

    // Audio Acoustic Level Detection
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const checkAudioLoop = () => {
        if (!isMounted.current) return;
        if (!isExamActiveRef.current || hasTerminatedRef.current) {
          checkAudioTimerRef.current = window.setTimeout(checkAudioLoop, 500);
          return;
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = Math.min(100, (avg / 255) * 100);
        const rms = avg / 255;
        const audioAnalysis = detectionEngineRef.current?.analyzeAudioLevel(dataArray, rms);

        const isLoudNoise = audioAnalysis?.isLoudNoise ?? normalizedLevel > 60;
        const isSpeech = audioAnalysis?.isSpeech ?? false;

        if (isLoudNoise) {
          noiseSecRef.current += 0.5;
          setHealthStatus(prev => ({ ...prev, audio: `🔴 Loud noise detected (${Math.round(normalizedLevel)}%)` }));
          if (proctorEngineRef.current) {
            proctorEngineRef.current.recordDetection({
              type: 'loud_noise',
              confidence: Math.min(1, 0.7 + normalizedLevel / 150),
              payload: { avg, normalizedLevel, isSpeech }
            });
          }
        } else if (normalizedLevel > 40 && isSpeech) {
          noiseSecRef.current += 0.25;
          setHealthStatus(prev => ({ ...prev, audio: `🟡 Moderate speech (${Math.round(normalizedLevel)}%)` }));
        } else {
          noiseSecRef.current = Math.max(0, noiseSecRef.current - 0.75);
          setHealthStatus(prev => ({ ...prev, audio: "🟢 Quiet (<40%)" }));
        }

        checkAudioTimerRef.current = window.setTimeout(checkAudioLoop, 500);
      };
      checkAudioLoop();
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
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }, 
          audio: true 
        });
      } catch (combinedErr) {
        console.warn("Failed to get both video and audio, falling back to video only...", combinedErr);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });
      }
      
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        setStatusText('Attaching camera feed...');
        // Clear any previous camera error when a new stream arrives
        setCameraError(null);
        await attachStreamToVideo(videoRef.current, stream);
        const track = stream.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            markCameraState('warning');
            setStatusText('Camera disconnected, reconnecting...');
            scheduleReconnect();
          };
        }
      }
      
      setupStreamDependentServices(stream);
      
      markCameraState('safe');
      setStatusText('Camera feed stable. Neural tracking ready.');
      return stream;
    } catch (err) {
      console.error("Camera/Mic initialization failed:", err);
      // Provide clearer guidance depending on error type
      const name = (err && (err as any).name) || '';
      const message = (err && (err as any).message) || String(err);
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('Camera or microphone permission denied. Please allow access in your browser settings and retry.');
        setStatusText('Camera permission denied. Awaiting user action.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('No camera device found. Please connect a webcam and retry.');
        setStatusText('No camera detected. Check device connection.');
      } else {
        setCameraError(`Camera initialization failed: ${message}`);
        setStatusText('Camera initialization failed. Retrying...');
      }
      markCameraState('warning');
      setHealthStatus(prev => ({ ...prev, face: "🔴 Camera Inaccessible" }));
      // Increase retry count (visible in state) and schedule reconnect
      setCameraRetryCount(c => c + 1);
      scheduleReconnect();
      // Throw so upstream logic can still react if needed
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
    let devToolsInterval: NodeJS.Timeout;

    // Window & Environment Security Listeners
    const handleVisibility = () => {
      if (document.hidden && isExamActiveRef.current && !hasTerminatedRef.current) {
        if (proctorEngineRef.current) {
          proctorEngineRef.current.forceWarning('tab_switch');
        } else {
          onViolation("TAB_SWITCH_WARNING", "Unauthorized tab switching or backgrounding detected.");
        }
      }
    };

    const handleBlur = () => {
      if (isExamActiveRef.current && !hasTerminatedRef.current) {
        if (proctorEngineRef.current) {
          proctorEngineRef.current.forceWarning('tab_switch');
        } else {
          onViolation("TAB_SWITCH_WARNING", "Window focus lost. Unauthorized switching detected.");
        }
      }
    };

    const handleFullScreenExit = () => {
      if (isExamActiveRef.current && !document.fullscreenElement && isFullscreenInitialized.current && !hasTerminatedRef.current) {
        if (proctorEngineRef.current) {
          proctorEngineRef.current.forceWarning('tab_switch');
        } else {
          onViolation("FULLSCREEN_EXIT_WARNING", "Fullscreen mode exited.");
        }
      }
    };

    const handleKeys = (e: KeyboardEvent) => {
      if (isExamActiveRef.current && (e.key === "PrintScreen" || e.key === "F12" || (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) || (e.ctrlKey && (e.key === 'p' || e.key === 'P'))) && !hasTerminatedRef.current) {
        if (proctorEngineRef.current) {
          proctorEngineRef.current.forceWarning('devtools_screenshot');
        } else {
          onViolation("SCREENSHOT_WARNING", "PrintScreen, F12, or screenshot attempt detected.");
        }
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

    const loadModels = async () => {
        // TensorFlow.js is already exposed globally in ensureScripts()
        setStatusText("TensorFlow.js ready via ES module import");
        let coco = null;
        let blazeface = null;
        let FaceMeshClass = null;
        
        // Load CocoSSD
        try {
          setStatusText("Loading CocoSSD object detection...");
          coco = await cocoSsd.load();
          console.debug("[MODELS] CocoSSD loaded successfully");
        } catch (err) {
          console.error("[MODELS] CocoSSD load failed:", err);
          setModelError("Failed to load object detection AI model.");
        }
        
        // Load BlazeFace
        try {
          setStatusText("Loading BlazeFace face detection...");
          blazeface = (window as any).blazeface ? await (window as any).blazeface.load() : null;
          if (blazeface) console.debug("[MODELS] BlazeFace loaded successfully");
        } catch (err) {
          console.error("[MODELS] BlazeFace load failed:", err);
          setModelError("Failed to load face detection AI model.");
        }
        
        FaceMeshClass = (window as any).FaceMesh || null;

        if (!coco || (!blazeface && !FaceMeshClass)) {
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
          FaceMeshClass = (window as any).FaceMesh || FaceMeshClass;
        }

        if (FaceMeshClass) {
          setStatusText("Initializing MediaPipe FaceMesh...");
          const faceMesh = new FaceMeshClass({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.65,
            minTrackingConfidence: 0.65
          });
          faceMesh.onResults((results: any) => {
            faceMeshResultsRef.current = results;
          });
          faceMeshRef.current = faceMesh;
        }

        if (coco && (blazeface || FaceMeshClass)) {
          cocoModelRef.current = coco;
          blazeModelRef.current = blazeface;
          if (!detectionEngineRef.current) {
            detectionEngineRef.current = new EnhancedDetectionEngine();
          }
          setIsModelsLoaded(true);

          // instantiate proctor engine once models loaded
          proctorEngineRef.current = new AIProctoringSystem({
            devMode: true,
            minSecondsForViolation: 15,
            multipleFaceSeconds: 5,
            phoneSeconds: 5,
            noiseSeconds: 5,
            evaluateIntervalMs: 500,
            onWarning: (level, label) => {
              warningCountRef.current = level;
              setProctorLevel(level);
              setCameraHealthState(level >= 3 ? 'violation' : 'warning');
              const msg = label.replace(/_/g, ' ').toUpperCase();
              
              // Audio Beep
              try {
                const audioCtx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.3);
              } catch(e) {}

              let uiMsg = "Please stay focused on the screen.";
              if (label === 'face_missing') uiMsg = "Face not detected. Please stay visible.";
              else if (label === 'eyes_off') uiMsg = "Please focus on the examination screen.";
              else if (label === 'head_turned') uiMsg = "Suspicious head movement detected.";
              else if (label === 'multiple_faces') uiMsg = "Multiple persons detected.";
              else if (label === 'phone') uiMsg = "Mobile device detected.";
              else if (label === 'loud_noise') uiMsg = "Background noise detected.";
              else if (label === 'tab_switch') uiMsg = "Tab switching is prohibited.";
              else if (label === 'devtools_screenshot') uiMsg = "Unauthorized key combination detected.";
              
              if (level === 1) {
                cooldownUntilRef.current = Date.now() + 2 * 60 * 1000;
                setActiveWarningModal({ number: 1, message: uiMsg });
                onViolation("WARNING_1", `Observed: ${msg}`);
              } else if (level === 2) {
                cooldownUntilRef.current = Date.now() + 5 * 60 * 1000;
                setActiveWarningModal({ number: 2, message: `Suspicious activity detected. ${uiMsg}` });
                onViolation("WARNING_2", `Repeated: ${msg}`);
              } else if (level >= 3) {
                setActiveWarningModal({ number: 3, message: `Exam auto-submitted due to repeated violations.` });
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
          setStatusText("AI Initialization Failed. Please reload.");
          if (!modelError) setModelError("Essential AI models failed to load correctly.");
        }
    };

    const startRealtimeVision = () => {
      let lastFrameUpload = Date.now();
      let frameCount = 0;
      let detectionDebugMode = false; // Disable verbose debug logging in production load mode
      let isProcessingFrame = false;
      let lastProcessTime = 0;
      const snapshotIntervalMs = 60000;

      const processFrame = async (timestamp: number) => {
        if (!isMounted.current) return;
        if (!isExamActiveRef.current || hasTerminatedRef.current) {
          visualFrameRef.current = window.requestAnimationFrame(processFrame);
          return;
        }
        
        if (isProcessingFrame) {
          visualFrameRef.current = window.requestAnimationFrame(processFrame);
          return;
        }
        if (timestamp - lastProcessTime < 500) {
          visualFrameRef.current = window.requestAnimationFrame(processFrame);
          return;
        }
        lastProcessTime = timestamp;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || video.readyState < 2 || !cocoModelRef.current || (!blazeModelRef.current && !faceMeshRef.current)) {
          if (frameCount % 30 === 0 && detectionDebugMode) {
            console.debug(`[VISION] Waiting for video/models ready. State: ${video?.readyState ?? 'no-video'}, Coco:${!!cocoModelRef.current}, Blaze:${!!blazeModelRef.current}, FaceMesh:${!!faceMeshRef.current}`);
          }
          frameCount++;
          visualFrameRef.current = window.requestAnimationFrame(processFrame);
          return;
        }

        frameCount++;
        isProcessingFrame = true;

        try {
          let predictions: any[] = [];
          try {
            predictions = await cocoModelRef.current.detect(video);
          } catch (detectionErr) {
            if (frameCount % 60 === 0) console.error("[VISION] CocoSSD detection error:", detectionErr);
            return;
          }

          const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.50);
          const mobileItems = ['cell phone', 'mobile phone', 'phone', 'smartphone', 'iphone', 'tablet', 'ipad', 'laptop', 'monitor', 'tv'];
          const phone = predictions.find((p: any) => mobileItems.some(item => p.class.toLowerCase().includes(item)) && p.score > 0.65);

          if (frameCount % 30 === 0 && detectionDebugMode) {
            const allClasses = predictions.map(p => `${p.class}(${(p.score * 100).toFixed(0)}%)`).join(', ');
            console.debug(`[FRAME ${frameCount}] Detections: ${allClasses || 'none'}`);
            console.debug(`[DETECTION] Persons: ${persons.length}, Phone: ${phone ? phone.class : 'none'}`);
          }

          if (faceMeshRef.current) {
            try {
              await faceMeshRef.current.send({ image: video });
            } catch (err) {
              // occasional face mesh send failures can be ignored
            }
          }
          const faceMeshResult = faceMeshResultsRef.current?.multiFaceLandmarks?.[0] ?? null;

          let faces: any[] = [];
          if (blazeModelRef.current) {
            try {
              faces = await blazeModelRef.current.estimateFaces(video, false);
            } catch (faceErr) {
              console.warn("[VISION] BlazeFace estimateFaces failed:", faceErr);
            }
          } else if (faceMeshResult) {
            faces = [{ topLeft: [0, 0], bottomRight: [video.videoWidth, video.videoHeight], landmarks: [] }];
          }

          if (canvas && faces.length > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              faces.forEach((f: any) => {
                const [startPt, endPt] = [f.topLeft as [number, number], f.bottomRight as [number, number]];
                ctx.strokeStyle = "#F97316";
                ctx.lineWidth = 1;
                ctx.strokeRect(startPt[0], startPt[1], endPt[0] - startPt[0], endPt[1] - startPt[1]);

                ctx.fillStyle = "#10B981";
                (f.landmarks as [number, number][]).forEach(pt => {
                  ctx.beginPath();
                  ctx.arc(pt[0], pt[1], 2, 0, 2 * Math.PI);
                  ctx.fill();
                });
              });
            }
          }

          if (faces.length === 0) {
            console.log("No face detected");
            missingFaceSecRef.current += 1;
            setHealthStatus(prev => ({ ...prev, face: "🔴 Face Missing" }));
            proctorEngineRef.current?.recordDetection({ type: 'face_missing', confidence: 0.95 });
          } else {
            if (frameCount % 60 === 0) console.log("Face detected");
            missingFaceSecRef.current = Math.max(0, missingFaceSecRef.current - 1);
            const faceData = detectionEngineRef.current?.analyzeFacePosition(faces, video.videoWidth, video.videoHeight);
            if (faceData) {
              if (faceData.isCentered) {
                setHealthStatus(prev => ({ ...prev, face: "✅ CENTERED - 100% Locked" }));
              } else {
                const guidance = detectionEngineRef.current?.getFaceCenteringGuidance(faceData) || "🟡 Recenter face";
                setHealthStatus(prev => ({ ...prev, face: guidance }));
              }
            } else {
              setHealthStatus(prev => ({ ...prev, face: "🟢 Face Detected" }));
            }
          }

          if (persons.length > 1) {
            multiPersonSecRef.current += 0.5;
            setHealthStatus(prev => ({ ...prev, multiPerson: `🔴 ${persons.length} People Detected` }));
            const avgScore = persons.reduce((s: number, p: any) => s + p.score, 0) / persons.length;
            proctorEngineRef.current?.recordDetection({ 
              type: 'multiple_faces', 
              confidence: Math.min(1, Math.max(0.95, avgScore + 0.10)), 
              payload: { personCount: persons.length, avgScore, scores: persons.map(p => p.score), frameNum: frameCount }
            });
            if (frameCount % 30 === 0) {
              console.warn(`[MULTI-PERSON] ${persons.length} persons detected at confidence ${avgScore.toFixed(2)}`);
            }
          } else {
            multiPersonSecRef.current = Math.max(0, multiPersonSecRef.current - 1);
            setHealthStatus(prev => ({ ...prev, multiPerson: "🟢 Single Entity" }));
          }

          const phoneAnalysis = detectionEngineRef.current?.analyzePhonePresence(predictions, 0.70);
          const secondaryScreenCandidates = predictions.filter((p: any) => {
            const cls = p.class.toLowerCase();
            const areaRatio = (p.bbox?.[2] * p.bbox?.[3]) / (video.videoWidth * video.videoHeight || 1);
            return (
              ["cell phone", "mobile phone", "phone", "smartphone", "iphone", "tablet", "ipad"].includes(cls) && p.score > 0.65
            ) || (
              ["laptop", "monitor", "tv", "screen"].includes(cls) && p.score > 0.80 && areaRatio > 0.07
            );
          });
          const phoneDetected = Boolean(
            phoneAnalysis?.detected && phoneAnalysis.confidence >= 0.78 && phoneAnalysis.type !== 'none'
          ) || secondaryScreenCandidates.length > 0;
          if (phoneDetected) {
            console.log("Phone detected");
            phoneSecRef.current += 0.5;
            const phoneType = phoneAnalysis?.type || secondaryScreenCandidates[0]?.class || 'Handheld Device';
            const confidence = Math.max(phoneAnalysis?.confidence || 0, secondaryScreenCandidates[0]?.score || 0.72);
            setHealthStatus(prev => ({ ...prev, phone: `🔴 ${phoneType} Detected (${Math.round(confidence * 100)}%)` }));
            proctorEngineRef.current?.recordDetection({
              type: 'phone',
              confidence: Math.min(0.98, Math.max(0.80, confidence)),
              payload: {
                type: phoneType,
                analysis: phoneAnalysis,
                detections: secondaryScreenCandidates.map((p: any) => ({ cls: p.class, score: p.score, bbox: p.bbox })),
                frameNum: frameCount,
              }
            });
            if (frameCount % 30 === 0) {
              console.warn(`[PHONE] ${phoneType} detected at confidence ${Math.round(confidence * 100)}%`);
            }
          } else {
            phoneSecRef.current = Math.max(0, phoneSecRef.current - 1);
            setHealthStatus(prev => ({ ...prev, phone: "🟢 Clear" }));
          }

          let headTurnDetected = false;
          let orientationConfidence = 0;
          let gazeWarning = false;
          const recordHeadWarning = (confidence: number, payload: any) => {
            headTurnSecRef.current += 1;
            setHealthStatus(prev => ({ ...prev, eyeHead: "🟡 Eyes/Head Diverted" }));
            proctorEngineRef.current?.recordDetection({ type: 'head_turned', confidence, payload });
          };

          if (faceMeshResult) {
            const leftEyePoint = faceMeshResult[33];
            const rightEyePoint = faceMeshResult[263];
            const noseTip = faceMeshResult[1];
            if (leftEyePoint && rightEyePoint && noseTip) {
              const eyeCenterX = (leftEyePoint.x + rightEyePoint.x) / 2;
              const faceWidth = Math.abs(rightEyePoint.x - leftEyePoint.x);
              const yawRatio = (noseTip.x - eyeCenterX) / (faceWidth + 0.0001);
              const pitchRatio = (noseTip.y - (leftEyePoint.y + rightEyePoint.y) / 2) / (faceWidth + 0.0001);
              orientationConfidence = Math.max(orientationConfidence, Math.min(1, Math.sqrt(yawRatio * yawRatio + pitchRatio * pitchRatio) * 1.2));

              if (Math.abs(yawRatio) > 0.48 || Math.abs(pitchRatio) > 0.42) {
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
                if ((leftGaze < 0.12 || leftGaze > 0.88) && (rightGaze < 0.12 || rightGaze > 0.88)) {
                  gazeWarning = true;
                }
              }
            }
          }

          if (headTurnDetected || gazeWarning) {
            setHealthStatus(prev => ({ ...prev, eyeHead: gazeWarning ? "🟡 Eyes Away" : "🟡 Head Diverted" }));
            if (!headTurnDetected) {
              proctorEngineRef.current?.recordDetection({ type: 'eyes_off', confidence: 0.88, payload: { gazeWarning } });
            }
          } else {
            headTurnSecRef.current = Math.max(0, headTurnSecRef.current - 1.5);
            setHealthStatus(prev => ({ ...prev, eyeHead: "🟢 Centered" }));
          }

          if (Date.now() - lastFrameUpload > snapshotIntervalMs) {
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
        } finally {
          isProcessingFrame = false;
          visualFrameRef.current = window.requestAnimationFrame(processFrame);
        }
      };

      visualFrameRef.current = window.requestAnimationFrame(processFrame);
    };

    const isWebGLSanityCheck = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as any;
        if (!gl) return false;
        
        const vs = gl.createShader(gl.VERTEX_SHADER);
        if (!vs) return false;
        gl.shaderSource(vs, "void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }");
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) return false;
        
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fs) return false;
        gl.shaderSource(fs, "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }");
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return false;
        
        const program = gl.createProgram();
        if (!program) return false;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
        
        return true;
      } catch (e) {
        return false;
      }
    };

    const ensureScripts = async () => {
      setStatusText("Loading AI proctoring libraries...");
      try {
        // TensorFlow.js is already imported as an ES module (line 5).
        // Expose it globally so CDN model scripts (coco-ssd, blazeface) can find it.
        if (typeof window !== 'undefined') {
          (window as any).tf = tf;
        }

        // Check WebGL compile and link sanity, fallback to CPU backend if broken
        if (!isWebGLSanityCheck()) {
          console.warn("WebGL unsupported or broken (shader compile/link failed). Forcing CPU backend in TFJS.");
          await tf.setBackend('cpu');
        } else {
          console.log("WebGL sanity check passed. Attempting WebGL backend.");
          try {
            await tf.setBackend('webgl');
          } catch (e) {
            console.warn("Failed to set webgl backend, falling back to CPU", e);
            await tf.setBackend('cpu');
          }
        }
        // Ensure the backend is fully initialized before loading model scripts
        await tf.ready();
        console.log(`[TFJS] Backend ready: ${tf.getBackend()}`);

        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
        loadModels();
      } catch (scriptErr) {
        console.error("Failed to load AI scripts, attempting graceful fallback", scriptErr);
        loadModels();
      }
    };

    const initProctoring = async () => {
      try {
        await ensureScripts();
        await initCameraStream();
      } catch (err) {
        console.warn("Failed to initialize camera stream, reconnect timer will handle it:", err);
      }
    };

    const shouldContinueProctoring = () => isMounted.current && isExamActiveRef.current && !hasTerminatedRef.current;

    // Begin proctoring initialization
    initProctoring();

    // Cleanup on unmount
    return () => {
      isMounted.current = false;
      if (checkAudioTimerRef.current) {
        window.clearTimeout(checkAudioTimerRef.current);
      }
      if (visualFrameRef.current) {
        window.cancelAnimationFrame(visualFrameRef.current);
      }
      try { clearInterval(devToolsInterval); } catch (err) {};
      window.removeEventListener('keyup', handleKeys);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullScreenExit);
      if (navigator.mediaDevices && typeof navigator.mediaDevices.removeEventListener === 'function') {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (cameraStreamRef.current) {
        try { cameraStreamRef.current.getTracks().forEach(track => track.stop()); } catch (err) {}
      }
    };
  }, [onViolation]);

  return (
    <>
      {cameraError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-slate-950/95 text-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Camera Error</h3>
            <p className="mb-4 text-sm text-slate-200">{cameraError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setCameraError(null); setCameraRetryCount(c => c + 1); initCameraStream().catch(() => {}); }}
                className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg"
              >
                Retry
              </button>
              <button
                onClick={() => { setCameraError(null); }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {modelError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-red-950 border border-red-500 text-white p-6 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.3)] max-w-md w-full text-center">
            <h3 className="text-xl font-bold mb-3 uppercase tracking-wider text-red-400">System Failure</h3>
            <p className="mb-6 text-sm text-slate-200">{modelError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-lg uppercase tracking-wider text-sm transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Real-time AI Debug Panel (Temporary) */}
      <div className="fixed bottom-4 right-4 z-[99999] bg-black/80 backdrop-blur border border-green-500/30 p-4 rounded-xl text-green-400 font-mono text-xs shadow-2xl pointer-events-none min-w-[200px]">
        <h4 className="text-white font-bold mb-2 uppercase tracking-widest text-[10px] border-b border-green-500/30 pb-1">AI Debug Panel</h4>
        <div className="space-y-1">
          <div className="flex justify-between"><span>Face Detected:</span> <span className={healthStatus.face === "🟢 Centered" ? "text-green-400" : "text-red-400"}>{healthStatus.face === "🟢 Centered" ? "TRUE" : "FALSE"}</span></div>
          <div className="flex justify-between"><span>Eye Tracking:</span> <span className={healthStatus.eyeHead === "🟢 Centered" ? "text-green-400" : "text-yellow-400"}>{healthStatus.eyeHead === "🟢 Centered" ? "TRUE" : "FALSE"}</span></div>
          <div className="flex justify-between"><span>Phone Detected:</span> <span className={healthStatus.phone === "🟢 Clear" ? "text-green-400" : "text-red-400"}>{healthStatus.phone !== "🟢 Clear" ? "TRUE" : "FALSE"}</span></div>
          <div className="flex justify-between"><span>Multiple Persons:</span> <span className={healthStatus.face === "🔴 Multiple Faces" ? "text-red-400" : "text-green-400"}>{healthStatus.face === "🔴 Multiple Faces" ? "TRUE" : "FALSE"}</span></div>
          <div className="flex justify-between"><span>Noise Level:</span> <span>{healthStatus.audio.match(/\d+/) ? healthStatus.audio.match(/\d+/)?.[0] : "0"}</span></div>
          <div className="flex justify-between mt-2 pt-1 border-t border-green-500/30"><span>Warning Count:</span> <span className="text-white font-bold">{warningCountRef.current}</span></div>
        </div>
      </div>
      {/* Professional HUD Circular Panel */}
      <div style={{
        position: 'relative',
        width: isRound4 ? '100%' : cameraSize,
        height: isRound4 ? '100%' : cameraSize,
        maxWidth: '100%',
        borderRadius: isRound4 ? '50%' : '28px',
        border: `4px solid ${proctorLevel >= 3 ? '#dc2626' : proctorLevel === 2 ? '#f59e0b' : proctorLevel === 1 ? '#facc15' : '#22c55e'}`,
        backgroundColor: '#020617',
        boxShadow: `0 24px 60px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        flexShrink: 0
      }} key="proctor-camera-wrapper">
        <video ref={videoRef} autoPlay muted playsInline style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }} />
        {!isRound4 && (
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: proctorLevel >= 3 ? 'rgba(220,38,38,0.92)' : proctorLevel === 2 ? 'rgba(245,158,11,0.92)' : proctorLevel === 1 ? 'rgba(250,204,21,0.92)' : 'rgba(34,197,94,0.92)',
            color: proctorLevel >= 3 ? '#fff' : '#020617',
            fontSize: '0.72rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 20px rgba(0,0,0,0.24)'
          }}>
            {proctorLevel === 0 ? 'SAFE' : proctorLevel === 1 ? 'WARNING 1' : proctorLevel === 2 ? 'WARNING 2' : 'VIOLATION'}
          </div>
        )}
        <canvas ref={canvasRef} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }} />
        
        {/* Secure/Warning Overlay Badge */}
        {!isRound4 && (
          <div style={{
            position: 'absolute',
            bottom: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: proctorLevel >= 3 ? '#ef4444' : proctorLevel === 2 ? '#fb923c' : proctorLevel === 1 ? '#facc15' : '#4ade80',
            fontSize: '8px',
            fontWeight: '900',
            padding: '2px 8px',
            borderRadius: '12px',
            border: `1px solid ${proctorLevel >= 3 ? '#dc2626' : proctorLevel === 2 ? '#f97316' : proctorLevel === 1 ? '#fbbf24' : '#22c55e'}`,
            letterSpacing: '0.5px',
            pointerEvents: 'none',
            fontFamily: 'monospace'
          }}>
            {proctorLevel === 0 ? "SECURE" : `WARN ${proctorLevel}`}
          </div>
        )}
      </div>

      {/* Professional Warning Modal Overlay */}
      <AnimatePresence>
        {activeWarningModal && (
          <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 font-sans">
            <div className="absolute top-0 left-0 w-full p-4 flex justify-center">
              <div className="bg-red-600 text-white px-6 py-2 rounded-b-xl font-bold uppercase tracking-widest text-sm shadow-lg animate-pulse">
                Proctoring Alert
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`border rounded-3xl p-8 max-w-xl w-full text-center space-y-6 shadow-2xl relative ${
                activeWarningModal.number >= 3 ? 'bg-red-950 border-red-500 shadow-[0_0_80px_rgba(220,38,38,0.5)]' :
                activeWarningModal.number === 2 ? 'bg-orange-950 border-orange-500 shadow-[0_0_80px_rgba(249,115,22,0.4)]' :
                'bg-yellow-950 border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.3)]'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl font-black ${
                activeWarningModal.number >= 3 ? 'bg-red-500/20 text-red-500 shadow-[0_0_30px_#ef4444]' :
                activeWarningModal.number === 2 ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_30px_#f97316]' :
                'bg-yellow-500/20 text-yellow-500 shadow-[0_0_30px_#eab308]'
              }`}>
                <AlertTriangle className="w-8 h-8 animate-ping" />
              </div>
              <div>
                <h2 className={`text-xl font-black uppercase tracking-widest mb-2 ${
                  activeWarningModal.number >= 3 ? 'text-red-400' :
                  activeWarningModal.number === 2 ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  AI Proctoring Integrity Notice (Warning {activeWarningModal.number} of 3)
                </h2>
                <p className="text-lg font-bold text-white">
                  {activeWarningModal.message}
                </p>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-2xl text-left space-y-2 border border-slate-800">
                <div className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Neural Observation Protocol Engaged
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeWarningModal.number === 1 
                    ? "Our neural vision engine will conduct quiet observation for the next 2 minutes. Please keep your eyes centered on the test interface and maintain a professional posture."
                    : activeWarningModal.number === 2
                    ? "Strict critical observation protocol is active. Any further focus loss, device detection, or acoustic abnormality will initiate an automatic final session termination."
                    : "The exam is being auto-submitted as you have reached the maximum number of allowed violations."}
                </p>
              </div>
              {activeWarningModal.number < 3 && (
                <button 
                  onClick={() => setActiveWarningModal(null)}
                  className={`px-8 py-3.5 font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg cursor-pointer w-full text-black ${
                    activeWarningModal.number === 2 ? 'bg-linear-to-r from-orange-500 to-[#FF5A1F]' :
                    'bg-linear-to-r from-yellow-400 to-yellow-500'
                  }`}
                >
                  I Acknowledge and Will Focus on Exam Screen
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
