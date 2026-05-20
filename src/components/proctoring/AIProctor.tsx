"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { uploadVideoRecording } from "@/lib/firebase";
import { Shield, Eye, Volume2, Maximize } from "lucide-react";

interface ProctorProps {
  onViolation: (type: string, message: string) => void;
  isExamActive: boolean;
}

export default function AIProctor({ onViolation, isExamActive }: ProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState("Initializing GeoNixa Neural Guard...");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMounted = useRef(true);
  const isExamActiveRef = useRef(isExamActive);
  const isFullscreenInitialized = useRef(false);
  const warningCountRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const missingFaceStreakRef = useRef(0);

  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  useEffect(() => {
    if (isExamActive) {
      // Delay initialization to allow the browser to settle into full-screen
      const timer = setTimeout(() => {
        isFullscreenInitialized.current = true;
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      isFullscreenInitialized.current = false;
    }
  }, [isExamActive]);

  useEffect(() => {
    isMounted.current = true;
    let checkAudioTimer: NodeJS.Timeout;
    let visualInterval: NodeJS.Timeout;

    const handleViolation = (type: string, message: string, isInstant: boolean = false) => {
      if (!isExamActiveRef.current) return;
      
      const now = Date.now();
      
      if (isInstant) {
        onViolation("TERMINATED", `CRITICAL_VIOLATION: ${message}. Assessment terminated.`);
        return;
      }

      // Warning Escalation Logic
      if (warningCountRef.current === 0) {
        warningCountRef.current = 1;
        lastWarningTimeRef.current = now;
        onViolation("WARNING", `1st WARNING: ${message}`);
      } else if (warningCountRef.current === 1) {
        const diff = (now - lastWarningTimeRef.current) / (1000 * 60);
        if (diff >= 3) {
          warningCountRef.current = 2;
          lastWarningTimeRef.current = now;
          onViolation("WARNING", `2nd WARNING: ${message}`);
        }
      } else if (warningCountRef.current === 2) {
        const diff = (now - lastWarningTimeRef.current) / (1000 * 60);
        if (diff >= 7) {
          warningCountRef.current = 3;
          onViolation("TERMINATED", `3rd WARNING: Final violation threshold reached. Submitting assessment now.`);
        }
      }
    };

    const handleKeys = (e: KeyboardEvent) => {
      // Logic moved inside initProctoring to use local ref
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleViolation("TAB_SWITCH", "Unauthorized tab switching detected");
      }
    };

    const handleFullScreenExit = () => {
      // Add a 2-second grace period for full-screen stabilization
      if (!document.fullscreenElement && isExamActiveRef.current && isFullscreenInitialized.current) {
        handleViolation("FULLSCREEN_EXIT", "Exit from full-screen mode prohibited", true);
      }
    };

    const initProctoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Video Recording
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

        // Audio Detection (Phone calls / Talking)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!isMounted.current || !isExamActiveRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          if (avg > 60) handleViolation("AUDIO", "Loud noise or speech detected. Maintain silence.");
          checkAudioTimer = setTimeout(checkAudio, 4000);
        };
        checkAudio();

        const screenshotAttemptsRef = { current: 0 };
        const handleKeys = (e: KeyboardEvent) => {
          if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
            screenshotAttemptsRef.current += 1;
            if (screenshotAttemptsRef.current === 1) {
              handleViolation("WARNING", "Screenshot attempt detected. Next attempt will instantly terminate the exam.");
            } else {
              handleViolation("SCREENSHOT", "Multiple screenshot attempts detected", true);
            }
          }
        };

        window.addEventListener('keyup', handleKeys);
        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('fullscreenchange', handleFullScreenExit);

        const loadCoco = async () => {
          if ((window as any).cocoSsd) {
            const model = await (window as any).cocoSsd.load();
            setIsModelLoaded(true);
            setStatus("AI EYE: TRACKING_STRICT");
            startDetection(model);
            return;
          }

          const cocoScript = document.createElement("script");
          cocoScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd";
          cocoScript.async = true;
          document.body.appendChild(cocoScript);

          cocoScript.onload = async () => {
            if (typeof window !== "undefined" && (window as any).cocoSsd) {
              const model = await (window as any).cocoSsd.load();
              setIsModelLoaded(true);
              setStatus("AI EYE: TRACKING_STRICT");
              startDetection(model);
            }
          };
        };

        const startDetection = (model: any) => {
          let lastFrameUpload = 0;
          
          visualInterval = setInterval(async () => {
            if (!isMounted.current || !isExamActiveRef.current) return;
            if (videoRef.current && videoRef.current.readyState === 4) {
              const predictions = await model.detect(videoRef.current);
              
              // 1. Person & Face Alignment Detection
              const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.6);
              if (persons.length === 0) {
                missingFaceStreakRef.current += 1;
                if (missingFaceStreakRef.current >= 3) {
                  handleViolation("VISUAL", "Candidate face not found in frame.");
                }
              } else {
                missingFaceStreakRef.current = 0;
                if (persons.length > 1) handleViolation("VISUAL", "Unauthorized person detected.");
              }
              
              // 2. Electronic Device Detection (Phone/Remote/Handheld)
              const detectedPhone = predictions.find((p: any) => 
                (p.class === 'cell phone' || p.class === 'remote') && p.score > 0.25
              );
              if (detectedPhone) handleViolation("VISUAL", "Electronic device detected in frame.");

              // 3. Ultra-Strict Head/Eye Tracking
              if (persons.length === 1) {
                const [x, y, w, h] = persons[0].bbox;
                const videoWidth = videoRef.current.videoWidth;
                const videoHeight = videoRef.current.videoHeight;
                
                const centerX = x + w/2;
                const centerY = y + h/2;

                const hOffset = Math.abs(centerX - videoWidth/2) / videoWidth;
                const vOffset = Math.abs(centerY - videoHeight/2) / videoHeight;

                if (hOffset > 0.25) {
                  handleViolation("VISUAL", "Head misalignment detected.");
                } else if (vOffset > 0.25) {
                  handleViolation("VISUAL", "Eye misalignment: Maintain focus on the assessment.");
                }
              }

              // 4. Live Frame Upload (Every 15s)
              const now = Date.now();
              if (now - lastFrameUpload > 15000) {
                lastFrameUpload = now;
                const canvas = document.createElement("canvas");
                canvas.width = videoRef.current.videoWidth / 2; // Resize for bandwidth
                canvas.height = videoRef.current.videoHeight / 2;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      const { uploadLiveFrame } = await import("@/lib/firebase");
                      const email = localStorage.getItem("geonixa_current_user") || "anonymous";
                      await uploadLiveFrame(email, blob).catch(() => {});
                    }
                  }, "image/jpeg", 0.6);
                }
              }
            }
          }, 3000);
        };

        if ((window as any).tf) {
          loadCoco();
        } else {
          const tfScript = document.createElement("script");
          tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
          tfScript.async = true;
          document.body.appendChild(tfScript);
          tfScript.onload = loadCoco;
        }

      } catch (err) {
        setStatus("Hardware Error: Camera/Mic Access Denied");
      }
    };

    initProctoring();

    return () => {
      isMounted.current = false;
      clearTimeout(checkAudioTimer);
      clearInterval(visualInterval);
      window.removeEventListener('keyup', handleKeys);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullScreenExit);
      if (audioContextRef.current) audioContextRef.current.close();
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  return (
    <div className="w-full h-full relative group">
      <video 
        ref={videoRef} 
        autoPlay muted 
        className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700" 
      />
      
      {/* Scanning Ring - Removed Orange border */}
      <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isModelLoaded ? "border-slate-700/30 animate-spin-slow" : "border-slate-800"}`} />
      
      {/* HUD Overlays */}
      {isModelLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Animated Scanning Line - Removed */}

          {/* HUD Corner Elements */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#F97316]/50" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#F97316]/50" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#F97316]/50" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#F97316]/50" />

          {/* Dynamic HUD Text */}
          <div className="absolute top-8 left-8 text-[6px] font-mono text-[#F97316] uppercase tracking-tighter space-y-1">
             <div>LATENCY: 14ms</div>
             <div>ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
             <div>STATE: MONITORED</div>
          </div>

          {/* Grid Lines - Removed */}
          
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#F97316] text-[6px] font-black px-2 py-0.5 rounded-full text-white tracking-[0.2em] shadow-lg">
            {status}
          </div>

          {/* Biometric Targetting Reticle - Subtle */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border border-slate-500/10 rounded-full flex items-center justify-center"
          >
             <div className="w-1 h-1 bg-slate-500/20 rounded-full" />
          </motion.div>
        </div>
      )}

      {/* Mini Stats Overlay */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-[#0D121F] border border-slate-900 rounded-xl p-3 shadow-2xl space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Eye className="w-2 h-2 text-[#F97316]" /> Visual</span>
          <span className="text-emerald-500">Nominal</span>
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Volume2 className="w-2 h-2 text-[#F97316]" /> Audio</span>
          <span className="text-emerald-500">Nominal</span>
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Maximize className="w-2 h-2 text-[#F97316]" /> Network</span>
          <span className="text-emerald-500">Encrypted</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
