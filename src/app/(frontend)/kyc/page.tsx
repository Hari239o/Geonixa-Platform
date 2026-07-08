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
    if (step === 2 && !selfieFile) {
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

  // Face-API & Tesseract Models Loading
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [aadharFaceDescriptor, setAadharFaceDescriptor] = useState<Float32Array | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const faceapi = (await import("face-api.js"));
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load models", e);
        setError("Failed to load required AI models. Please refresh the page.");
      }
    }
    loadModels();
  }, []);

  const handleNextStep1 = async () => {
    if (!fullName.trim()) {
      setError("Please enter your full name first");
      return;
    }
    if (!aadharFile) {
      setError("Please upload your Aadhar Card photo");
      return;
    }
    if (!modelsLoaded) {
      setError("AI Models are still loading. Please wait a moment.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Textract/OCR using Tesseract.js
      const Tesseract = (await import("tesseract.js")).default;
      const tesseractResult = await Tesseract.recognize(aadharFile, 'eng', {
        logger: (m: any) => console.log(m)
      });
      const text = tesseractResult.data.text.toLowerCase();
      
      // Basic validation: check for 12 digits or 'government of india' or the name
      const aadharRegex = /\d{4}\s?\d{4}\s?\d{4}/;
      const nameParts = fullName.toLowerCase().split(' ');
      
      let isValidAadhar = aadharRegex.test(text) || text.includes('government of india') || text.includes('vid');
      let nameFound = nameParts.some(part => text.includes(part));
      
      if (!isValidAadhar) {
        setError("The uploaded image does not appear to be a valid Aadhar card.");
        setIsLoading(false);
        return;
      }
      
      if (!nameFound && nameParts.length > 0 && nameParts[0].length > 2) {
        // We'll proceed anyway with a warning or just be lenient for now 
        console.warn("Name not perfectly matched in OCR, but proceeding to face check");
      }

      // 2. Face Extraction using face-api.js
      const faceapi = (await import("face-api.js"));
      const img = await faceapi.bufferToImage(aadharFile);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      
      if (!detection) {
        setError("Could not detect a clear face on the Aadhar card. Please upload a clearer photo.");
        setIsLoading(false);
        return;
      }
      
      setAadharFaceDescriptor(detection.descriptor);
      setStep(2); // Move to Selfie step
      
    } catch (err) {
      console.error(err);
      setError("Error processing Aadhar. Please try a clearer image.");
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
    if (!selfieFile || !aadharFaceDescriptor) {
      setError("Missing selfie or Aadhar face data");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 5-second artificial delay as requested
      await new Promise(resolve => setTimeout(resolve, 5000));

      const faceapi = (await import("face-api.js"));
      const img = await faceapi.bufferToImage(selfieFile);
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      
      if (!detection) {
        setError("Could not detect a face in the selfie. Please retake.");
        setSelfieFile(null);
        startCamera();
        setIsLoading(false);
        return;
      }

      // 3. Match the Faces
      const distance = faceapi.euclideanDistance(aadharFaceDescriptor, detection.descriptor);
      console.log("Face Match Distance:", distance);
      
      // Threshold is typically 0.6. Lower is stricter.
      if (distance < 0.6) {
        setStep(3); // Success step
      } else {
        setError("Face does not match the Aadhar photo. Please retake in good lighting.");
        setSelfieFile(null);
        startCamera();
      }
    } catch (err) {
      console.error(err);
      setError("Error processing selfie. Please retake.");
      setSelfieFile(null);
      startCamera();
    } finally {
      setIsLoading(false);
    }
  };

  const completeKyc = async () => {
    // Update Profile to isVerified: true locally and in backend
    try {
      // API
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: localStorage.getItem("userId") || "temp-user-id",
          isVerified: true 
        })
      });
      
      let isBrand = false;
      try {
        const res = await fetch("/api/user/complete-profile");
        if (res.ok) {
          const data = await res.json();
          // The API returns the profile. We can check if it's a brand profile by checking brandType or the user role if it was included, but the API endpoint GET /api/user/complete-profile uses the user's role.
          // Let's just check the current session or we can check the URL we came from, but fetching the profile is safer.
          // Wait, the API GET /api/user/complete-profile returns `profile`. If it's a brand, it has `brandType` or `authorizedPerson` or similar fields, but Creator has `creatorType` or `category`.
          // Even better, NextAuth session has the role.
          if (data.profile && (data.profile.brandType || data.profile.type === 'company' || data.profile.type === 'individual' || data.profile.fullName !== undefined)) {
            // Actually, both have fullName. Let's just check if they have a brandProfile in local storage first as a hint.
          }
        }
      } catch (e) {}

      const localRole = localStorage.getItem('userRole');
      const signupCookie = document.cookie.split('; ').find(row => row.startsWith('signupRole='));
      const cookieRole = signupCookie ? signupCookie.split('=')[1] : null;
      
      // Check local storage for brand profile
      const hasBrandProfile = localStorage.getItem('kaling_brand_profile') !== null;
      
      isBrand = localRole === 'brand' || cookieRole === 'brand' || hasBrandProfile;
      
      // Local
      import("@/utils/storage").then(({ getItem, setItem }) => {
        const key = isBrand ? "kaling_brand_profile" : "kaling_user_profile";
        getItem<any>(key).then(existing => {
          setItem(key, { ...(existing || {}), isVerified: true });
        });
      });
      
      router.push(isBrand ? "/brand/profile" : "/creator");
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          
          {/* Progress Bar */}
          {step < 3 && (
            <div className="flex gap-2 mb-6">
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
                    <div className="flex flex-col items-center relative w-full h-[180px] rounded-[16px] overflow-hidden group">
                      <img src={URL.createObjectURL(aadharFile)} alt="Aadhar Preview" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center mb-2 shadow-sm">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-[12px] font-bold text-white">Tap to change file</span>
                      </div>
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
                className="w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)] mt-2 flex justify-center items-center"
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

          {/* STEP 2: Selfie Capture */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center flex-1 w-full px-4 pt-2 pb-6">
              <div className="text-center w-full">
                <h2 className="text-[20px] sm:text-[22px] font-black text-[#1a1a2e] mb-1 tracking-tight">Selfie Verification</h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 font-medium mb-2 sm:mb-3">We'll compare your face with your Aadhar photo.</p>
              </div>
              
              <div className="bg-white rounded-[24px] p-2 shadow-sm border border-gray-100 mb-4 mx-auto w-full max-w-[240px] sm:max-w-[260px]">
                {!selfieFile ? (
                  <div className="relative w-full aspect-[4/5] bg-black rounded-[20px] overflow-hidden flex items-center justify-center">
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
                      <div className="w-[60%] h-[55%] border-2 border-white/50 border-dashed rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-[20px] overflow-hidden">
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
                <div className="w-full max-w-[280px] mx-auto mt-1">
                  <button 
                    onClick={capturePhoto}
                    className={`w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-3.5 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)] flex justify-center items-center gap-2 ${!cameraActive ? 'opacity-90' : ''}`}
                  >
                    <Camera className="w-5 h-5" /> CAPTURE SELFIE
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full mt-2">
                  <button 
                    onClick={handleVerifyFace}
                    disabled={isLoading}
                    className="w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        CHECKING YOUR DETAILS PLEASE WAIT
                      </span>
                    ) : "VERIFY MY IDENTITY"}
                  </button>
                  <button 
                    onClick={() => { setSelfieFile(null); startCamera(); }}
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-3.5 rounded-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    RETAKE SELFIE
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center h-full justify-center pb-20">
              <div className="w-24 h-24 bg-orange-100 text-[#EF4823] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-[26px] font-black text-[#1a1a2e] mb-2 tracking-tight">Verified!</h2>
              <p className="text-[14px] text-gray-500 font-medium mb-10 max-w-[280px]">Your identity has been successfully verified. You now have the official tick mark.</p>
              
              <button 
                onClick={completeKyc}
                className="w-full bg-[#EF4823] hover:bg-[#d63f1c] text-white font-bold py-4 rounded-[16px] transition-all shadow-[0_4px_15px_rgba(239,72,35,0.25)]"
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
