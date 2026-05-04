"use client";

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    isExamActiveRef.current = isExamActive;
  }, [isExamActive]);

  useEffect(() => {
    isMounted.current = true;
    let checkAudioTimer: NodeJS.Timeout;
    let visualInterval: NodeJS.Timeout;

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

        // Audio Detection
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
          if (avg > 45) onViolation("AUDIO", "High ambient noise or speech detected.");
          checkAudioTimer = setTimeout(checkAudio, 3000);
        };
        checkAudio();

        // Visual AI (TensorFlow)
        const tfScript = document.createElement("script");
        tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
        tfScript.async = true;
        document.body.appendChild(tfScript);

        tfScript.onload = () => {
          const cocoScript = document.createElement("script");
          cocoScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd";
          cocoScript.async = true;
          document.body.appendChild(cocoScript);

          cocoScript.onload = async () => {
            if (typeof window !== "undefined" && (window as any).cocoSsd) {
              const model = await (window as any).cocoSsd.load();
              setIsModelLoaded(true);
              setStatus("Neural Guard Active: SECURE_ENVIRONMENT");

              visualInterval = setInterval(async () => {
                if (!isMounted.current || !isExamActiveRef.current) return;
                if (videoRef.current && videoRef.current.readyState === 4) {
                  const predictions = await model.detect(videoRef.current);
                  
                  // 1. Person Detection
                  const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.5);
                  if (persons.length === 0) onViolation("VISUAL", "Candidate face not found in frame.");
                  else if (persons.length > 1) onViolation("VISUAL", "Multiple persons detected in frame.");
                  
                  // 2. Object Detection
                  const forbidden = ['cell phone', 'book', 'laptop', 'remote'];
                  const detectedForbidden = predictions.find((p: any) => forbidden.includes(p.class) && p.score > 0.3);
                  if (detectedForbidden) onViolation("VISUAL", `Unauthorized object detected: ${detectedForbidden.class.toUpperCase()}`);

                  // 3. Mock Eye/Head Tracking (Simulated by analyzing bounding box stability)
                  if (persons.length === 1) {
                    const [x, y, w, h] = persons[0].bbox;
                    const centerX = x + w/2;
                    const videoWidth = videoRef.current.videoWidth;
                    // If head is too far left or right
                    if (centerX < videoWidth * 0.2 || centerX > videoWidth * 0.8) {
                      onViolation("VISUAL", "Head movement detected: Candidate looking away from screen.");
                    }
                  }
                }
              }, 2000);
            }
          };
        };

      } catch (err) {
        setStatus("Hardware Error: Camera/Mic Access Denied");
      }
    };

    initProctoring();

    return () => {
      isMounted.current = false;
      clearTimeout(checkAudioTimer);
      clearInterval(visualInterval);
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
      
      {/* Scanning Ring */}
      <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isModelLoaded ? "border-[#FF5A1F] animate-spin-slow" : "border-slate-800"}`} />
      
      {/* HUD Overlays */}
      {isModelLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-[#FF5A1F]/30 absolute top-1/2 animate-pulse" />
          <div className="h-full w-[1px] bg-[#FF5A1F]/30 absolute left-1/2 animate-pulse" />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#FF5A1F] text-[6px] font-black px-1 rounded text-white tracking-widest">
            {status}
          </div>
        </div>
      )}

      {/* Mini Stats Overlay */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-[#0D121F] border border-slate-900 rounded-xl p-3 shadow-2xl space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Eye className="w-2 h-2 text-[#FF5A1F]" /> Visual</span>
          <span className="text-emerald-500">Nominal</span>
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Volume2 className="w-2 h-2 text-[#FF5A1F]" /> Audio</span>
          <span className="text-emerald-500">Nominal</span>
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Maximize className="w-2 h-2 text-[#FF5A1F]" /> Network</span>
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
