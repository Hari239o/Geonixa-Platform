'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Trash2, Plus, LogOut } from 'lucide-react';
import { getItem, setItem } from '@/utils/storage';
import { signOut } from 'next-auth/react';
import { uploadFileToR2 } from '@/utils/upload';

interface Budget {
  name: string;
  price: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string>('/profile_pic.png');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  
  const [budgets, setBudgets] = useState<Budget[]>([
    { name: '1 Reel', price: '₹ xxx' },
  ]);

  const [socials, setSocials] = useState({
    facebook: '',
    instagram: '',
    x: ''
  });
  
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadSettings() {
      if (typeof window !== 'undefined') {
        try {
          const parsed = await getItem<any>('kaling_user_profile');
          if (parsed) {
            if (parsed.profilePic) setProfilePic(parsed.profilePic);
            if (parsed.fullName) setFullName(parsed.fullName);
            if (parsed.bio) setBio(parsed.bio);
            if (parsed.socials) setSocials(parsed.socials);
            if (parsed.budgets && parsed.budgets.length > 0) setBudgets(parsed.budgets);
            if (parsed.portfolioImages) setPortfolioImages(parsed.portfolioImages);
          }
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      }
    }
    loadSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFileToR2(file, 'public');
        setProfilePic(url);
      } catch (err: any) {
        console.error("Upload failed", err);
        alert("Upload failed: " + (err.message || String(err)));
      }
    }
  };

  const removeProfilePic = () => {
    setProfilePic('/profile_pic.png');
  };

  const handleBudgetChange = (index: number, field: 'name' | 'price', value: string) => {
    const newBudgets = [...budgets];
    newBudgets[index][field] = value;
    setBudgets(newBudgets);
  };

  const addBudget = () => {
    setBudgets([...budgets, { name: '', price: '' }]);
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPortfolioMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Upload all files in parallel
    try {
      const uploadPromises = files.map(file => uploadFileToR2(file, 'public'));
      const urls = await Promise.all(uploadPromises);
      setPortfolioImages(prev => [...prev, ...urls]);
    } catch (err: any) {
      console.error("Portfolio upload failed", err);
      alert("Upload failed: " + (err.message || String(err)));
    }
  };

  const handleSave = async () => {
    if (typeof window !== 'undefined') {
      try {
        const parsed = await getItem<any>('kaling_user_profile') || {};
        const updatedProfile = {
          ...parsed,
          profilePic,
          fullName,
          bio,
          budgets,
          socials,
          portfolioImages
        };
        await setItem('kaling_user_profile', updatedProfile);
        
        // Sync to database if userRole is creator
        const role = localStorage.getItem('userRole');
        if (!role || role === 'creator') {
          await fetch('/api/user/complete-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: localStorage.getItem('userId') || 'temp-user-id', // Assuming temp-user-id for now
              fullName,
              bio,
              profilePic,
              category: 'Creator',
              followers: updatedProfile.followers || '0',
              viewership: updatedProfile.viewership || '0',
              engagement: updatedProfile.engagement || '0',
              projects: updatedProfile.projects || '0',
              successRate: updatedProfile.successRate || '0%',
              isVerified: updatedProfile.isVerified || false
            })
          });
        }
        
        router.back();
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      try {
        await setItem('kaling_user_profile', null);
        await setItem('kaling_brand_profile', null);
      } catch (e) {
        console.error("Failed to clear IndexedDB", e);
      }
      localStorage.removeItem('kaling_user_profile');
      localStorage.removeItem('kaling_brand_profile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      await signOut({ redirect: false });
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-white relative flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
      {/* Header */}
      <div className="px-6 pt-4 pb-6 flex items-center relative">
        <button 
          onClick={() => router.back()}
          className="w-11 h-11 bg-[#fff0e5] text-[#EF4823] rounded-[16px] flex items-center justify-center transition-transform active:scale-95 absolute left-6"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight w-full text-center">Settings</h1>
      </div>

      <div className="px-8 pb-32 pt-4">
        {/* Profile Picture Section */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-[100px] h-[100px] rounded-[30px] overflow-hidden shadow-sm shrink-0 border border-gray-100 relative">
              <Image 
                src={profilePic} 
                alt="Profile" 
                width={100} height={100} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                </svg>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-gray-500 font-medium">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-600 font-medium placeholder-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] text-gray-500 font-medium">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <label className="text-[13px] text-gray-500 font-medium">Budgets</label>
            {budgets.map((budget, index) => (
              <div key={index} className="flex gap-4">
                <input 
                  type="text" 
                  value={budget.name}
                  onChange={(e) => handleBudgetChange(index, 'name', e.target.value)}
                  placeholder="1 Reel"
                  className="flex-1 bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400"
                />
                <input 
                  type="text" 
                  value={budget.price}
                  onChange={(e) => handleBudgetChange(index, 'price', e.target.value)}
                  placeholder="₹ xxx"
                  className="w-32 bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400 text-center"
                />
              </div>
            ))}
            <div>
              <button 
                onClick={addBudget}
                className="w-8 h-8 bg-[#EF4823] text-white rounded-xl flex items-center justify-center shadow-sm"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <label className="text-[13px] text-gray-500 font-medium">Portfolio Media</label>
            <div className="grid grid-cols-2 gap-4">
              {portfolioImages.map((img, index) => (
                <div key={index} className="aspect-square rounded-[24px] overflow-hidden relative group border border-gray-100 shadow-sm">
                  {img.startsWith('data:video/') ? (
                    <video src={img} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={img} alt="Portfolio item" className="w-full h-full object-cover" />
                  )}
                  <button 
                    onClick={() => removePortfolioImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary-red shadow-sm hover:bg-primary-red hover:text-white transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-[24px] overflow-hidden relative border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <Plus size={24} className="text-gray-400 mb-2" />
                <span className="text-[11px] text-gray-400 font-medium">Add Media</span>
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleAddPortfolioMedia} />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-gray-500 font-medium">Facebook</label>
              <input 
                type="text" 
                value={socials.facebook}
                onChange={(e) => setSocials({...socials, facebook: e.target.value})}
                placeholder="https://"
                className="w-full bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-gray-500 font-medium">Instagram</label>
              <input 
                type="text" 
                value={socials.instagram}
                onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                placeholder="https://"
                className="w-full bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-gray-500 font-medium">X</label>
              <input 
                type="text" 
                value={socials.x}
                onChange={(e) => setSocials({...socials, x: e.target.value})}
                placeholder="https://"
                className="w-full bg-[#fcfcfd] border border-gray-100 rounded-2xl px-5 py-4 outline-none text-[13px] text-gray-500 font-medium placeholder-gray-400"
              />
            </div>
            </div>
          </div>

          <div className="mt-12 mb-20 flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="w-full text-red-500 font-bold py-4 flex items-center justify-center gap-2 hover:bg-red-50 rounded-[20px] transition-colors"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Logout
            </button>
          </div>
      </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-white via-white to-transparent z-20">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-[#EF4823] text-white rounded-[20px] font-bold shadow-lg hover:-translate-y-1 transition-transform"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
