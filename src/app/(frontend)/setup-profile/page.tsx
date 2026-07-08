'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, ImagePlus, X } from 'lucide-react';
import { setItem } from '@/utils/storage';
import { uploadFileToR2 } from '@/utils/upload';

const SetupProfilePage = () => {
 const router = useRouter();
 const [profilePic, setProfilePic] = useState<string | null>(null);
 const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
 const [formData, setFormData] = useState(() => {
 if (typeof window !== 'undefined') {
 const saved = localStorage.getItem('kaling_temp_form');
 if (saved) return JSON.parse(saved);
 }
    return {
      fullName: '',
      category: '',
      customCategory: '',
      portfolioLink: '',
      instagramLink: '',
      facebookLink: '',
      twitterLink: '',
      linkedinLink: '',
      followers: '',
      viewership: '',
      engagement: '',
      pricePerReel: '',
      bio: '',
      creatorType: 'Influencer'
    };
  });

  React.useEffect(() => {
    const savedSignupData = sessionStorage.getItem("creatorSignupData");
    if (savedSignupData) {
      try {
        const parsed = JSON.parse(savedSignupData);
        if (parsed.creatorType) {
          // Normalize to match tabs: 'UGC', 'Influencer', 'Partners'
          let mappedType = 'Influencer';
          
          setFormData((prev: any) => ({ ...prev, creatorType: mappedType }));
        }
      } catch (e) {}
    }
  }, []);

  // Check if profile was already completed
  React.useEffect(() => {
    import('@/utils/storage').then(({ getItem }) => {
      getItem('kaling_user_profile').then(profile => {
        if (profile) {
          router.replace('/creator');
        }
      }).catch(e => console.error(e));
    });
  }, [router]);

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


  const handlePortfolioImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    // Strict limits: total size max 399MB
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const maxSizeBytes = 399 * 1024 * 1024;
    
    if (totalSize > maxSizeBytes) {
      alert("Total storage limit is 399 MB. Please select fewer or smaller files.");
      return;
    }
    
    try {
      const uploadPromises = files.map(file => uploadFileToR2(file, 'public'));
      const urls = await Promise.all(uploadPromises);
      setPortfolioImages((prev: string[]) => [...prev, ...urls]); 
    } catch (err: any) {
      console.error("Portfolio upload failed", err);
      alert("Upload failed: " + (err.message || String(err)));
    }
  };

 const removePortfolioImage = (indexToRemove: number) => {
 setPortfolioImages(prev => prev.filter((_, index) => index !== indexToRemove));
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 setFormData((prev: Record<string, string>) => ({
 ...prev,
 [name]: value
 }));
 };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const basePrice = parseInt(formData.pricePerReel) || 0;
  // Apply bulk discount: 10% off for 5 reels, 15% off for 10 reels
  const price5Reels = Math.round((basePrice * 5) * 0.9);
  const price10Reels = Math.round((basePrice * 10) * 0.85);

  const initialBudgets = [
    { name: '1 Reel', price: `₹ ${basePrice || 'xxx'}` },
    { name: '5 Reels', price: `₹ ${price5Reels || 'xxx'}` },
    { name: '10 Reels', price: `₹ ${price10Reels || 'xxx'}` },
    { name: 'Custom', price: '₹ xxx' },
  ];

  // Create profile object with initial stats
  const userProfile = {
  ...formData,
  category: formData.category === 'Others' ? formData.customCategory : formData.category,
  profilePic: profilePic, // data URL
  portfolioImages: portfolioImages,
  followers: formData.followers || '0',
  viewership: formData.viewership || '0',
  engagement: formData.engagement || '0',
  projects: '0',
  successRate: '0%',
  budgets: initialBudgets,
  socials: {
    instagram: formData.instagramLink || '',
    facebook: formData.facebookLink || '',
    x: formData.twitterLink || '',
    linkedin: formData.linkedinLink || ''
  }
  };

 // Clean up temp storage
 localStorage.removeItem('kaling_temp_form');

    // Save to indexedDB for persistence
    try {
      await setItem('kaling_user_profile', userProfile);
      
      // We keep portfolioImages since they are now URLs, not base64 strings
      const serverPayload: any = { ...userProfile };
      if (serverPayload.profilePic && serverPayload.profilePic.startsWith('data:image/')) {
        delete serverPayload.profilePic;
      }

      // Mark profile as completed in the database and save the data
      const res = await fetch("/api/user/complete-profile", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(serverPayload)
      });
      
      if (!res.ok) {
        console.error("Failed to save profile to server:", await res.text());
        // We still continue to local dashboard if server fails, as they can retry later
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }

  // Redirect to creators dashboard
  router.replace('/creator');
 };

 const isFormValid = () => {
 if (!formData.fullName || !formData.category) return false;
 if (formData.category === 'Others' && !formData.customCategory) return false;
 return true;
 };

 return (
  <div className="w-full max-w-md mx-auto h-full flex flex-col bg-[#f9fafb] font-sans overflow-hidden">
  <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative">
  <div className="bg-white w-full rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8">
 <div className="mb-8 text-center">
 <h2 className="text-2xl font-bold text-primary-red tracking-tight mb-2">Complete Your Profile</h2>
 <p className="text-primary-red/80 text-sm">Add your details to stand out to brands and partners.</p>
 </div>

 <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
 {/* Profile Picture Upload */}
 <div className="flex flex-col items-center justify-center mb-2">
 <label htmlFor="profile-upload" className="cursor-pointer relative group">
 {profilePic ? (
 <Image src={profilePic as string} alt="Profile Preview" width={112} height={112} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" />
 ) : (
 <div className="w-28 h-28 rounded-full bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-[#EF4823] transition-colors group-hover:bg-orange-100 group-hover:border-[#EF4823]">
 <Camera size={32} />
 <span className="text-xs font-semibold mt-2">Upload</span>
 </div>
 )}
 </label>
 <input 
 id="profile-upload" 
 type="file" 
 accept="image/*" 
 onChange={handleImageUpload} 
 className="hidden"
 />
 </div>

 {/* Form Fields */}
 <div className="flex flex-col gap-2">
 <label htmlFor="fullName" className="text-sm font-bold text-primary-red">Full Name</label>
 <input 
 type="text" 
 id="fullName"
 name="fullName" 
 placeholder="e.g. Jane Doe"
 value={formData.fullName}
 onChange={handleInputChange}
 required 
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
 />
 </div>



 <div className="flex flex-col gap-2">
 <label htmlFor="category" className="text-sm font-bold text-primary-red">Category</label>
 <select 
 id="category"
 name="category" 
 value={formData.category}
 onChange={handleInputChange}
 required
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 appearance-none text-gray-900 custom-select"
 >
 <option value="" disabled>Select your category</option>
 <option value="Content Creator">Content Creator</option>
 <option value="Video Editors">Video Editors</option>
 <option value="Photographer">Photographer</option>
 <option value="Cinematographer">Cinematographer</option>
 <option value="Drone Operator">Drone Operator</option>
 <option value="Film Directors">Film Directors</option>
 <option value="Assistant Directors">Assistant Directors</option>
 <option value="Actor">Actor</option>
 <option value="Writer">Writer</option>
 <option value="Production">Production</option>
 <option value="Music & Sound">Music & Sound</option>
 <option value="Makeup Artists">Makeup Artists</option>
 <option value="Hair Stylists">Hair Stylists</option>
 <option value="Costume Designers">Costume Designers</option>
 <option value="Others">Others</option>
 </select>
 </div>

  {formData.category === 'Others' && (
    <div className="flex flex-col gap-2">
      <label htmlFor="customCategory" className="text-sm font-bold text-primary-red">Specify Your Role</label>
      <input 
        type="text" 
        id="customCategory"
        name="customCategory" 
        placeholder="e.g. 3D Animator"
        value={formData.customCategory}
        onChange={handleInputChange}
        required 
        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
      />
    </div>
  )}

  <div className="flex flex-col gap-2">
    <label htmlFor="instagramLink" className="text-sm font-bold text-primary-red">Instagram Profile Link (Optional)</label>
    <input 
      type="url" 
      id="instagramLink"
      name="instagramLink" 
      placeholder="https://instagram.com/yourhandle"
      value={formData.instagramLink}
      onChange={handleInputChange}
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="facebookLink" className="text-sm font-bold text-primary-red">Facebook Profile Link (Optional)</label>
    <input 
      type="url" 
      id="facebookLink"
      name="facebookLink" 
      placeholder="https://facebook.com/yourhandle"
      value={formData.facebookLink}
      onChange={handleInputChange}
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="twitterLink" className="text-sm font-bold text-primary-red">X (Twitter) Profile Link (Optional)</label>
    <input 
      type="url" 
      id="twitterLink"
      name="twitterLink" 
      placeholder="https://x.com/yourhandle"
      value={formData.twitterLink}
      onChange={handleInputChange}
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="linkedinLink" className="text-sm font-bold text-primary-red">LinkedIn Profile Link (Optional)</label>
    <input 
      type="url" 
      id="linkedinLink"
      name="linkedinLink" 
      placeholder="https://linkedin.com/in/yourhandle"
      value={formData.linkedinLink}
      onChange={handleInputChange}
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="followers" className="text-sm font-bold text-primary-red">Number of Followers</label>
    <input 
      type="text" 
      id="followers"
      name="followers" 
      placeholder="e.g. 10.5k"
      value={formData.followers}
      onChange={handleInputChange}
      required
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="viewership" className="text-sm font-bold text-primary-red">Avg Viewership</label>
    <input 
      type="text" 
      id="viewership"
      name="viewership" 
      placeholder="e.g. 50k"
      value={formData.viewership}
      onChange={handleInputChange}
      required
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="engagement" className="text-sm font-bold text-primary-red">Avg Engagement</label>
    <input 
      type="text" 
      id="engagement"
      name="engagement" 
      placeholder="e.g. 12%"
      value={formData.engagement}
      onChange={handleInputChange}
      required
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>

  <div className="flex flex-col gap-2">
    <label htmlFor="pricePerReel" className="text-sm font-bold text-primary-red">Base Price Per Reel (₹)</label>
    <input 
      type="number" 
      id="pricePerReel"
      name="pricePerReel" 
      placeholder="e.g. 2000"
      value={formData.pricePerReel}
      onChange={handleInputChange}
      required
      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
    />
  </div>
 
 <div className="flex flex-col gap-2">
 <label htmlFor="portfolioLink" className="text-sm font-bold text-primary-red">Portfolio / Website Link</label>
 <input 
 type="url" 
 id="portfolioLink"
 name="portfolioLink" 
 placeholder="https://yourwebsite.com"
 value={formData.portfolioLink}
 onChange={handleInputChange}
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400"
 />
 </div>

 <div className="flex flex-col gap-2">
 <label htmlFor="bio" className="text-sm font-bold text-primary-red">Bio</label>
 <textarea 
 id="bio"
 name="bio" 
 placeholder="Tell brands a little about yourself..."
 rows={4}
 value={formData.bio}
 onChange={handleInputChange}
 required
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400 resize-y min-h-[100px]"
 ></textarea>
 </div>
 
 {/* Photos and Videos Section */}
 <div className="flex flex-col gap-2">
 <label className="text-sm font-bold text-primary-red">Photos & Videos</label>
 <p className="text-xs text-primary-red/60 font-medium -mt-1">Upload your best work (Max 399 MB total limit)</p>
 <div className="flex flex-wrap gap-3 mt-2">
 {portfolioImages.map((mediaSrc: string, index: number) => (
 <div key={index} className="relative w-24 h-24">
 {mediaSrc.startsWith('data:video') || mediaSrc.match(/\.(mp4|webm|ogg|mov)$/i) ? (
 <video src={mediaSrc} className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" muted controls />
 ) : (
 <img src={mediaSrc} alt={`Portfolio ${index}`} className="object-cover rounded-xl w-full h-full border border-gray-200 shadow-sm" />
 )}
 <button type="button" aria-label="Remove media" title="Remove media" className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10" onClick={() => removePortfolioImage(index)}>
 <X size={14} color="white" />
 </button>
 </div>
 ))}
 
 <label htmlFor="portfolio-upload" className="w-24 h-24 rounded-xl bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-[#EF4823] cursor-pointer hover:bg-orange-100 transition-colors">
 <ImagePlus size={24} />
 <span className="text-[10px] font-bold mt-1 text-center px-2">Add Media</span>
 </label>
 <input 
 id="portfolio-upload" 
 type="file" 
 accept="image/*,video/*" 
 multiple
 onChange={handlePortfolioImagesUpload} 
 className="hidden"
 />
 </div>
 </div>

 <button 
 type="submit" 
 className="mt-4 w-full p-4 bg-[#EF4823] text-white text-base font-bold rounded-2xl cursor-pointer transition-all hover:bg-[#d63d1c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(239,72,35,0.2)]" 
 disabled={!isFormValid()}
 >
 Complete Profile
 </button>
 </form>
 </div>
 </div>
 </div>
 );
};

export default SetupProfilePage;
