'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, ImagePlus, X } from 'lucide-react';
import { setItem } from '@/utils/storage';

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
 bio: '',
 creatorType: 'UGC'
 };
 });

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 setProfilePic(reader.result as string);
 };
 reader.readAsDataURL(file);
 }
 };

 const handlePortfolioImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (!e.target.files) return;
 const files = Array.from(e.target.files);
 
 files.forEach((file: File) => {
 const reader = new FileReader();
 reader.onloadend = () => {
 setPortfolioImages((prev: string[]) => [...prev, reader.result as string]);
 };
 reader.readAsDataURL(file);
 });
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

  const initialBudgets = formData.creatorType === 'UGC' ? [
    { name: '1 Reel', price: '₹ xxx' },
    { name: '5 Reels', price: '₹ xxx' },
    { name: '10 Reels', price: '₹ xxx' },
    { name: 'Custom', price: '₹ xxx' },
  ] : [
    { name: 'Collab Reel', price: '₹ xxx' },
    { name: 'YT Integration', price: '₹ xxx' },
    { name: 'Timeline', price: '₹ xxx' },
    { name: 'Custom', price: '₹ xxx' },
  ];

 // Create profile object with initial stats
 const userProfile = {
 ...formData,
 category: formData.category === 'Others' ? formData.customCategory : formData.category,
 profilePic: profilePic, // data URL
 portfolioImages: portfolioImages,
 followers: '44.5k',
 viewership: '22.8k',
 engagement: '38.9k',
 projects: '17',
 successRate: '92%',
 budgets: initialBudgets
 };

 // Clean up temp storage
 localStorage.removeItem('kaling_temp_form');

 // Save to indexedDB for persistence
 try {
   await setItem('kaling_user_profile', userProfile);
 } catch (error) {
   console.error("Failed to save to IndexedDB:", error);
 }

 // Redirect to creators dashboard
 router.push('/creator');
 };

 const isFormValid = () => {
 if (!formData.fullName || !formData.category) return false;
 if (formData.category === 'Others' && !formData.customCategory) return false;
 return true;
 };

 return (
 <div className="w-full max-w-md mx-auto min-h-screen bg-[#f9fafb] flex items-center justify-center p-4 font-sans">
 <div className="bg-white w-full rounded-[32px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
 <div className="mb-8 text-center">
 <h2 className="text-2xl font-bold text-primary-red tracking-tight mb-2">Complete Your Profile</h2>
 <p className="text-primary-red/80 text-sm">Add your details to stand out to brands and partners.</p>
 </div>

 <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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

  {/* Creator Type */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-primary-red">Creator Type</label>
    <div className="flex gap-4">
      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.creatorType === 'UGC' ? 'bg-[#EF4823]/10 border-[#EF4823] text-[#EF4823] font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 font-medium hover:bg-gray-100'}`}>
        <input type="radio" name="creatorType" value="UGC" checked={formData.creatorType === 'UGC'} onChange={handleInputChange} className="hidden" />
        UGC
      </label>
      <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.creatorType === 'Influencer' ? 'bg-[#EF4823]/10 border-[#EF4823] text-[#EF4823] font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 font-medium hover:bg-gray-100'}`}>
        <input type="radio" name="creatorType" value="Influencer" checked={formData.creatorType === 'Influencer'} onChange={handleInputChange} className="hidden" />
        Influencer
      </label>
    </div>
  </div>

 <div className="flex flex-col gap-2">
 <label htmlFor="category" className="text-sm font-bold text-primary-red">Category</label>
 <select 
 id="category"
 name="category" 
 value={formData.category}
 onChange={handleInputChange}
 required
 className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none transition-all focus:bg-white focus:border-[#EF4823] focus:ring-2 focus:ring-orange-100 appearance-none text-gray-900"
 style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px top 50%', backgroundSize: '12px auto' }}
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
 <p className="text-xs text-primary-red/60 font-medium -mt-1">Upload some of your best work</p>
 <div className="flex flex-wrap gap-3 mt-2">
 {portfolioImages.map((mediaSrc: string, index: number) => (
 <div key={index} className="relative w-20 h-20">
 {mediaSrc.startsWith('data:video') ? (
 <video src={mediaSrc} className="w-full h-full object-cover rounded-xl" muted />
 ) : (
 <Image src={mediaSrc} alt={`Portfolio ${index}`} fill className="object-cover rounded-xl" />
 )}
 <button type="button" className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors" onClick={() => removePortfolioImage(index)}>
 <X size={14} color="white" />
 </button>
 </div>
 ))}
 
 <label htmlFor="portfolio-upload" className="w-20 h-20 rounded-xl bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-[#EF4823] cursor-pointer hover:bg-orange-100 transition-colors">
 <ImagePlus size={24} />
 <span className="text-[10px] font-bold mt-1">Add</span>
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
 );
};

export default SetupProfilePage;
