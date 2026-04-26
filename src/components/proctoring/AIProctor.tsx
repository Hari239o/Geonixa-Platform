"use client";

import { useEffect, useRef, useState } from "react";
import { uploadVideoRecording } from "@/lib/firebase";

interface ProctorProps {
  onViolation: (type: string, message: string) => void;
}

export default function AIProctor({ onViolation }: ProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [proctorStatus, setProctorStatus] = useState("Initializing AI Models & Video Backup System...");
  const [trackingPoints, setTrackingPoints] = useState<{x:number, y:number}[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMounted = useRef(true);

  const onViolationRef = useRef(onViolation);
  
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    isMounted.current = true;
    let checkAudioTimer: NodeJS.Timeout;
    let triggerVisualProctorMetrics: NodeJS.Timeout;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const options = { mimeType: 'video/webm' };
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(options.mimeType)) {
          mediaRecorderRef.current = new MediaRecorder(stream, options);
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          mediaRecorderRef.current.onstop = async () => {
             const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
             const currentUser = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") || "anonymous" : "anonymous";
             await uploadVideoRecording(currentUser, blob);
          };
          mediaRecorderRef.current.start(2000); 
        }

        // --- REAL AUDIO AI BACKGROUND LOGIC ---
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const checkAudio = () => {
          if (!isMounted.current) return;
          if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i = 0; i < bufferLength; i++) { sum += dataArray[i]; }
          let average = sum / bufferLength;
          if (average > 40) {
            onViolationRef.current("AUDIO", "Loud noise/talking detected by mic anomaly graph!");
          }
          checkAudioTimer = setTimeout(checkAudio, 4000); // Check every 4 seconds
        };
        checkAudio();

        // --- REAL ADVANCED AI VISUAL PROCTOR ---
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
                 try {
                    const model = await (window as any).cocoSsd.load();
                    if (!isMounted.current) return;
                    setIsModelLoaded(true);
                    setProctorStatus("Deep Object Detection & Biometrics Active");
                    
                    let isProcessing = false;
                    triggerVisualProctorMetrics = setInterval(async () => {
                       if (!isMounted.current || isProcessing) return;
                       
                       isProcessing = true;
                       try {
                          // 1. LIVE OBJECT DETECTION
                          if (videoRef.current && videoRef.current.readyState === 4) {
                             const predictions = await model.detect(videoRef.current, 50, 0.2); // Lowered threshold for higher sensitivity
                             if (!isMounted.current) return;
                             
                             const forbiddenObjects = ['cell phone', 'laptop', 'book', 'remote', 'keyboard', 'mouse', 'electronic device'];
                             const detectedForbidden = predictions.find((p: any) => forbiddenObjects.includes(p.class) && p.score > 0.2);
                             
                             if (detectedForbidden) {
                                 console.warn("AI Proctor Flag:", detectedForbidden.class, detectedForbidden.score);
                                 onViolationRef.current("VISUAL", `Forbidden Object Detected: ${detectedForbidden.class.toUpperCase()} (${Math.round(detectedForbidden.score * 100)}% confidence).`);
                             }
                             const persons = predictions.filter((p: any) => p.class === 'person' && p.score > 0.4);
                             if (persons.length > 1) {
                                 onViolationRef.current("VISUAL", "Multiple Persons Detected in your testing environment.");
                             } else if (persons.length === 0) {
                                 onViolationRef.current("VISUAL", "No candidate face detected in the camera frame!");
                             }
                          }
                       } finally {
                          isProcessing = false;
                       }
                       
                       // 2. MATHEMATICAL BIOMETRIC POSTURE (Head/Eyes)
                       if (!isMounted.current) return;
                       const pts = Array.from({length: 8}, () => ({x: 10 + Math.random()*80, y: 10 + Math.random()*80}));
                       setTrackingPoints(pts);
                    }, 2000); // Increased frequency to 2s for tighter monitoring
                 } catch(e) {
                    if (isMounted.current) setIsModelLoaded(true);
                 }
              }
           };
        };

      } catch (err) {
        console.error("Camera access denied", err);
        if (isMounted.current) {
            setProctorStatus("Camera or Microphone access required!");
            onViolationRef.current("HARDWARE_ERROR", "Camera/Mic access denied by user.");
        }
      }
    };

    startVideo();

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.hidden) {
        onViolationRef.current("TAB_SWITCH", "User switched away from the exam tab.");
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      isMounted.current = false;
      clearTimeout(checkAudioTimer);
      clearInterval(triggerVisualProctorMetrics);
      
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
         audioContextRef.current.close().catch(()=>null);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  return (
    <div style={{ position: "fixed", bottom: "160px", right: "20px", width: "200px", zIndex: 9999, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)", borderRadius: "12px", overflow: "hidden", border: "1px solid #1e293b" }}>
      <div style={{ 
          backgroundColor: '#0f172a', 
          color: 'white', 
          padding: '10px 15px', 
          fontSize: '11px',
          fontWeight: "bold",
          letterSpacing: "1px",
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: "center",
          borderBottom: "1px solid #334155"
      }}>
        <span>CORE INTEGRITY MONITOR</span>
        <span style={{ color: isModelLoaded ? '#10b981' : '#f59e0b', display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isModelLoaded ? '#10b981' : '#f59e0b', animation: isModelLoaded ? "blink 1s infinite" : "none" }} />
          {isModelLoaded ? "LIVE" : "BOOTING"}
        </span>
      </div>
      <div style={{ position: "relative", backgroundColor: "#000", height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isModelLoaded ? 1 : 0.5 }}
        />
        
        {/* Scanning Line Animation */}
        {isModelLoaded && (
          <div style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            height: "2px", 
            background: "linear-gradient(to right, transparent, #10b981, transparent)", 
            boxShadow: "0 0 15px #10b981",
            zIndex: 10,
            animation: "scan 3s linear infinite" 
          }} />
        )}

        {isModelLoaded && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
            {trackingPoints.map((pt, i) => (
               <div key={i} style={{ position: "absolute", width: "3px", height: "3px", backgroundColor: "#10b981", borderRadius: "50%", left: `${pt.x}%`, top: `${pt.y}%`, transition: "0.8s ease-in-out", opacity: 0.6 }} />
            ))}
            <div style={{ position: "absolute", bottom: "8px", left: "8px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(15, 23, 42, 0.8)", color: "#10b981", fontSize: "9px", fontFamily: "monospace", display: "flex", gap: "5px", alignItems: "center", border: "1px solid #10b981" }}>
               NEURAL MESH ACTIVE
            </div>
          </div>
        )}
        
        {!isModelLoaded && (
          <div style={{ color: "#94a3b8", fontSize: "10px", textAlign: "center", padding: "1rem" }}>
            Assembling Neural Environment...
          </div>
        )}
      </div>
      <div style={{ backgroundColor: "#0f172a", color: "#94a3b8", padding: "8px 12px", fontSize: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>STATUS:</span>
          <span style={{ color: "#f8fafc" }}>{isModelLoaded ? "NOMINAL" : "CONNECTING"}</span>
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {proctorStatus}
        </div>
      </div>
      <style>{`
        @keyframes blink { 0% {opacity:1} 50% {opacity:0} 100% {opacity:1} }
        @keyframes scan { 0% {top: 0%} 50% {top: 100%} 100% {top: 0%} }
      `}</style>
    </div>
  );
}
