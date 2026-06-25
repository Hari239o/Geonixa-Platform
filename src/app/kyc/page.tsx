'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Upload, Camera, CheckCircle } from 'lucide-react';

const KycVerificationPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  
  // Camera references
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleNextStep = () => {
    if (step === 2) {
      // Start camera when moving to step 3
      startCamera();
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step === 3) {
      stopCamera();
    }
    setStep((prev) => prev - 1);
  };

  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to complete verification.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelfieImage(imageDataUrl);
      }
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setSelfieImage(null);
    startCamera();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          aadharImage,
          selfieImage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local storage to reflect verified status
        const profile = JSON.parse(localStorage.getItem('kaling_user_profile') || '{}');
        profile.isVerified = true;
        localStorage.setItem('kaling_user_profile', JSON.stringify(profile));
        
        router.push('/creators');
      } else {
        setErrorMessage("Verification failed: " + data.error + ". Please try again.");
      }
    } catch (error) {
      console.error("KYC Error:", error);
      setErrorMessage("An error occurred during verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col p-4">
      <div className="mt-8 mb-8 text-center max-w-md w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Identity Verification</h2>
        <p className="text-gray-500 text-sm">Complete KYC to unlock full access. Powered by High-Security AI.</p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <div className={`w-8 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-[#EF4823]' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-[#EF4823]' : 'bg-gray-200'}`}></div>
        <div className={`w-8 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-[#EF4823]' : 'bg-gray-200'}`}></div>
      </div>

      {step === 1 && (
        <div className="bg-white max-w-md w-full mx-auto rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[400px]">
          <div className="text-center mb-8">
            <ShieldCheck size={48} color="#EF4823" className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Legal Identity</h3>
            <p className="text-[13px] text-gray-500 mt-2">
              Please enter your name exactly as it appears on your Aadhar card.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 mb-auto">
            <label htmlFor="fullName" className="text-sm font-bold text-gray-700">Full Name (Exact as per Aadhar)</label>
            <input 
              type="text" 
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
            />
          </div>

          <button 
            className="mt-6 w-full p-4 bg-[#EF4823] text-white text-base font-bold rounded-2xl cursor-pointer transition-all hover:bg-[#d63d1c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,72,35,0.2)]" 
            onClick={handleNextStep}
            disabled={fullName.trim().length < 3}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white max-w-md w-full mx-auto rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[400px]">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upload Aadhar Card</h3>
            <p className="text-[13px] text-gray-500 mt-2">
              High-Security AI scan is active to catch false or tampered documents.
            </p>
          </div>

          <div className="flex-1 flex flex-col mb-6">
            {aadharImage ? (
              <>
                <div className="relative w-full aspect-[1.58] rounded-2xl border border-gray-200 mb-4 shadow-sm overflow-hidden">
                  <Image src={aadharImage as string} alt="Aadhar Preview" fill className="object-cover" />
                </div>
                <button className="w-full p-4 bg-orange-50 text-[#EF4823] text-base font-bold rounded-2xl cursor-pointer transition-colors hover:bg-orange-100" onClick={() => setAadharImage(null)}>
                  Upload Different Image
                </button>
              </>
            ) : (
              <label className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer transition-all hover:bg-orange-50 hover:border-orange-200 group p-6 text-center">
                <Upload size={32} color="#EF4823" className="mb-3 transition-transform group-hover:-translate-y-1" />
                <span className="font-bold text-gray-700 text-sm mb-1">Click to Upload Aadhar Front</span>
                <p className="text-xs text-gray-400">JPEG or PNG only</p>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png" 
                  onChange={handleAadharUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-[0.4] p-4 bg-orange-50 text-[#EF4823] text-base font-bold rounded-2xl cursor-pointer transition-colors hover:bg-orange-100" onClick={handlePrevStep}>Back</button>
            <button 
              className="flex-1 p-4 bg-[#EF4823] text-white text-base font-bold rounded-2xl cursor-pointer transition-all hover:bg-[#d63d1c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,72,35,0.2)]" 
              onClick={handleNextStep}
              disabled={!aadharImage}
            >
              Verify Aadhar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white max-w-md w-full mx-auto rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col min-h-[400px]">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Liveness Check</h3>
            <p className="text-[13px] text-gray-500 mt-2">
              We need a real-time photo to match with your Aadhar.
            </p>
          </div>

          <div className="flex-1 flex flex-col mb-6">
            {selfieImage ? (
              <>
                <div className="relative w-full aspect-[3/4] rounded-2xl border border-gray-200 mb-4 shadow-sm overflow-hidden">
                  <Image src={selfieImage as string} alt="Selfie" fill className="object-cover" />
                </div>
                <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold mb-4 bg-emerald-50 py-2 rounded-lg">
                  <CheckCircle size={20} /> Face Captured
                </div>
                <button className="w-full p-4 bg-orange-50 text-[#EF4823] text-base font-bold rounded-2xl cursor-pointer transition-colors hover:bg-orange-100" onClick={retakePhoto}>Retake Photo</button>
              </>
            ) : (
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-inner">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-[6px] border-[#EF4823]/30 rounded-2xl pointer-events-none z-10 m-4"></div>
              </div>
            )}
          </div>

          {/* Hidden canvas to process the image */}
          <canvas ref={canvasRef} className="hidden" />

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[13px] text-center mb-4 font-medium border border-red-100">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <button className="flex-[0.4] p-4 bg-orange-50 text-[#EF4823] text-base font-bold rounded-2xl cursor-pointer transition-colors hover:bg-orange-100" onClick={handlePrevStep}>Back</button>
            {!selfieImage ? (
              <button 
                className="flex-1 p-4 bg-[#EF4823] text-white text-base font-bold rounded-2xl cursor-pointer transition-all hover:bg-[#d63d1c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,72,35,0.2)] flex items-center justify-center gap-2" 
                onClick={capturePhoto}
                disabled={!cameraActive}
              >
                <Camera size={18} />
                Capture Photo
              </button>
            ) : (
              <button 
                className="flex-1 p-4 bg-[#EF4823] text-white text-base font-bold rounded-2xl cursor-pointer transition-all hover:bg-[#d63d1c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,72,35,0.2)]" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KycVerificationPage;
