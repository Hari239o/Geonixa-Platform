'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const MockInstagramLogin = () => {
 const router = useRouter();

  const handleAuthorize = () => {
    // Simulate setting verification status
    const saved = localStorage.getItem("kaling_brand_profile");
    if (saved) {
      const data = JSON.parse(saved);
      data.isVerified = true;
      localStorage.setItem("kaling_brand_profile", JSON.stringify(data));
    }
    router.push('/brand/profile');
  };

  const handleCancel = () => {
    router.back();
  };

 return (
 <div className="min-h-screen flex items-center justify-center bg-[#fafafa] font-sans p-4">
 <div className="bg-white p-10 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] text-center w-full max-w-[350px]">
 <h1 className="text-2xl font-bold mb-2">Instagram</h1>
 <p className="text-gray-500 text-sm mb-6">
 <strong>Kaling Connect</strong> is requesting access to your Instagram profile.
 </p>
 
 <div className="flex flex-col gap-3">
 <button 
 onClick={handleAuthorize}
 className="w-full p-3 bg-[#0095f6] text-white font-bold rounded-lg transition-colors hover:bg-[#0081d6]"
 >
 Allow
 </button>
 <button 
 onClick={handleCancel}
 className="w-full p-3 bg-red-500 text-white font-bold rounded-lg transition-colors hover:bg-red-600"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 );
};

export default MockInstagramLogin;
