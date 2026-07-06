"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export default function KycPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (step === 3 && !selfieFile) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, selfieFile]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            setSelfieFile(file);
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const handleNextStep1 = async () => {
    if (!fullName.trim()) {
      setError("Please enter your full name first");
      return;
    }
    if (!aadharFile) {
      setError("Please upload your Aadhar Card photo");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", aadharFile);
    formData.append("name", fullName);

    try {
      const res = await fetch("/api/kyc/verify-aadhar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2); // Move to Selfie step
      } else {
        setError(data.error || "Not a valid Aadhar");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadharFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleVerifyFace = async () => {
    if (!selfieFile || !aadharFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("selfieFile", selfieFile);
    formData.append("aadharFile", aadharFile);

    try {
      // Added a small UI delay to make the verification feel more robust (5 seconds as requested)
      const startTime = Date.now();
      const res = await fetch("/api/kyc/verify-face", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise(r => setTimeout(r, 5000 - elapsed));
      }

      if (data.success) {
        setStep(3); // Success step
      } else {
        setError(data.error || "Verification failed");
        setSelfieFile(null);
        startCamera();
      }
    } catch (err) {
      setError("Network error occurred");
      setSelfieFile(null);
      startCamera();
    } finally {
      setIsLoading(false);
    }
  };

  const completeKyc = async () => {
    // Update Profile to isVerified: true locally and in backend
    try {
      const role = localStorage.getItem('userRole');
      const isBrand = role === 'brand';
      
      // Local
      import("@/utils/storage").then(({ getItem, setItem }) => {
        const key = isBrand ? "kaling_brand_profile" : "kaling_user_profile";
        getItem<any>(key).then(existing => {
          setItem(key, { ...(existing || {}), isVerified: true });
        });
      });

      // API
      await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: localStorage.getItem("userId") || "temp-user-id",
          isVerified: true 
        })
      });
      
      router.push(isBrand ? "/brand" : "/creator");
    } catch (e) {
      console.error(e);
      router.push("/creator");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center">
      <div className="w-full max-w-md h-screen flex flex-col relative overflow-hidden bg-[#FAFAFA]">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-4 bg-white shadow-sm z-10 flex items-center justify-between sticky top-0">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-black transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-black text-[#1a1a2e] tracking-tight">KYC VERIFICATION</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          
          {/* Progress Bar */}
          {step < 3 && (
            <div className="flex gap-2 mb-8">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#EF4823]" : "bg-gray-200"}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#EF4823]" : "bg-gray-200"}`} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] mb-6 flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* STEP 1: Name Input & Aadhar Upload */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[22px] font-black text-[#1a1a2e] mb-2 tracking-tight">Identity Details</h2>
              <p className="text-[13px] text-gray-500 font-medium mb-6">Please enter your name and upload your Aadhar Card photo for verification.</p>
              
              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Full Name (As per Aadhar)</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border-2 border-gray-100 rounded-[16px] px-5 py-4 text-[15px] font-bold text-[#1a1a2e] outline-none focus:border-[#EF4823] transition-colors shadow-sm"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Aadhar Card Photo</label>
                <label className="border-2 border-dashed border-gray-200 bg-white hover:border-[#EF4823] hover:bg-orange-50 transition-colors rounded-[24px] p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAadharUpload}
                    disabled={isLoading}
                  />
                  
                  {aadharFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="text-[13px] font-bold text-[#1a1a2e]">{aadharFile.name}</span>
                      <span className="text-[11px] text-gray-400 mt-1">Tap to change file</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 text-[#EF4823]">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-[14px] font-bold text-[#1a1a2e] mb-1">Tap to Upload Aadhar</span>
                      <span className="text-[11px] text-gray-400 font-medium">JPEG, PNG up to 5MB</span>
                    </>
                  )}
                </label>
              </div>

              <button 
                onClick={handleNextStep1}
                disabled={isLoading}
                className="w-full bg-[#1a1a2e] hover:bg-black text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(26,26,46,0.15)] mt-2 flex justify-center items-center"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    VERIFYING...
                  </span>
                ) : "CONTINUE TO SELFIE"}
              </button>
            </div>
          )}

          {/* STEP 3: Selfie Capture */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[22px] font-black text-[#1a1a2e] mb-2 tracking-tight">Selfie Verification</h2>
              <p className="text-[13px] text-gray-500 font-medium mb-6">We'll compare your face with your Aadhar photo to verify your identity.</p>
              
              <div className="bg-white rounded-[24px] p-2 shadow-sm border border-gray-100 mb-6">
                {!selfieFile ? (
                  <div className="relative w-full aspect-[3/4] bg-black rounded-[20px] overflow-hidden flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                    />
                    
                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 border-[6px] border-black/30 rounded-[20px] pointer-events-none"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[60%] h-[50%] border-2 border-white/50 border-dashed rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-[20px] overflow-hidden">
                    <img 
                      src={URL.createObjectURL(selfieFile)} 
                      alt="Selfie" 
                      className="w-full h-full object-cover transform -scale-x-100" 
                    />
                  </div>
                )}
              </div>
              
              {/* Hidden Canvas for capturing */}
              <canvas ref={canvasRef} className="hidden" />

              {!selfieFile ? (
                <button 
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className="w-full bg-[#1a1a2e] hover:bg-black text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(26,26,46,0.15)] flex justify-center items-center gap-2"
                >
                  <Camera className="w-5 h-5" /> CAPTURE SELFIE
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleVerifyFace}
                    disabled={isLoading}
                    className="w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)] flex justify-center items-center disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ANALYZING...
                      </span>
                    ) : "VERIFY MY IDENTITY"}
                  </button>
                  <button 
                    onClick={() => { setSelfieFile(null); startCamera(); }}
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-3.5 rounded-[16px] transition-all disabled:opacity-50"
                  >
                    RETAKE SELFIE
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center h-full justify-center pb-20">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-[26px] font-black text-[#1a1a2e] mb-2 tracking-tight">Verified!</h2>
              <p className="text-[14px] text-gray-500 font-medium mb-10 max-w-[280px]">Your identity has been successfully verified. You now have the official tick mark.</p>
              
              <button 
                onClick={completeKyc}
                className="w-full bg-[#1a1a2e] hover:bg-black text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(26,26,46,0.15)]"
              >
                GO TO DASHBOARD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
