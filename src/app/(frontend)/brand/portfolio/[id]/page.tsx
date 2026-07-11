'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BadgeCheck, Send, Settings2, Plus } from 'lucide-react';
import { getItem, setItem } from '@/utils/storage';
import { signOut } from 'next-auth/react';
import { uploadFileToR2 } from '@/utils/upload';

const LinkedinIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const TwitterIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
  </svg>
);

const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
  </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
import BottomNav from '@/components/brand/BottomNav';

interface UserProfile {
  fullName: string;
  bio: string;
  profilePic: string;
  category: string;
  followers: string;
  viewership: string;
  engagement: string;
  projects: string;
  successRate: string;
  portfolioImages: string[];
  budgets: { name: string; price: string }[];
  isVerified?: boolean;
  socials?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
  };
}

export default function CreatorPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'About' | 'Portfolio'>('About');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    bio: '',
    profilePic: '',
    category: '',
    followers: '0',
    viewership: '0',
    engagement: '0',
    projects: '0',
    successRate: '0%',
    portfolioImages: [],
    budgets: [
      { name: '1 Reel', price: '₹ xxx' },
      { name: '5 Reels', price: '₹ xxx' },
      { name: '10 Reels', price: '₹ xxx' },
      { name: 'Custom', price: '₹ xxx' },
    ],
    isVerified: false,
    socials: {}
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      // 1. Immediately try to load from local storage to prevent UI flashing
      // Fetch fresh data from database
      try {
        const resolvedParams = await params;
        const res = await fetch(`/api/creators/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.creator) {
            setProfile(prev => {
              const mergedProfile = {
                fullName: data.creator.fullName || prev.fullName,
                bio: data.creator.bio || prev.bio,
                profilePic: data.creator.profilePic || prev.profilePic,
                category: data.creator.category || prev.category,
                followers: data.creator.followers || prev.followers || '0',
                viewership: data.creator.viewership || prev.viewership || '0',
                engagement: data.creator.engagement || prev.engagement || '0',
                projects: data.creator.projects || prev.projects || '0',
                successRate: data.creator.successRate || prev.successRate || '0%',
                portfolioImages: (data.creator.portfolioImages && data.creator.portfolioImages.length > 0) ? data.creator.portfolioImages : prev.portfolioImages,
                budgets: (data.creator.budgets && data.creator.budgets.length > 0) ? data.creator.budgets : prev.budgets,
                isVerified: data.creator.isVerified || false,
                socials: data.creator.socials || {
                  instagram: data.creator.instagram || '',
                  facebook: data.creator.facebook || '',
                  x: data.creator.x || '',
                  linkedin: data.creator.linkedin || ''
                }
              };
              
              // Cache to IndexedDB for next load
              import('@/utils/storage').then(({ setItem, getItem }) => {
                getItem<any>('kaling_user_profile').then(existing => {
                  setItem('kaling_user_profile', { ...(existing || {}), ...mergedProfile });
                });
              });
              
              return { ...prev, ...mergedProfile };
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile from DB:", error);
      }
    }
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    }
    loadProfile();
    fetchCampaigns();
  }, []);

  const handleInvite = async (campaignId: string) => {
    try {
      const resolvedParams = await params;
      const res = await fetch('/api/campaigns/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, creatorId: resolvedParams.id })
      });
      if (res.ok) {
        alert('Invitation sent successfully!');
        setShowInviteModal(false);
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    try {
      const uploadPromises = files.map(file => uploadFileToR2(file, 'public'));
      const urls = await Promise.all(uploadPromises);
      
      let updatedProfile: any = null;
      setProfile(prev => {
        const newPortfolioImages = [...(prev.portfolioImages || []), ...urls];
        const newProfile = { ...prev, portfolioImages: newPortfolioImages };
        updatedProfile = newProfile;
        return newProfile;
      });

      // Save to IndexedDB
      if (typeof window !== 'undefined') {
        try {
          const parsed = await getItem<any>('kaling_user_profile') || {};
          // Note: relying on the state update to be fast enough here is risky, 
          // we use the urls directly for the DB update
          await setItem('kaling_user_profile', { ...parsed, portfolioImages: [...(parsed.portfolioImages || []), ...urls] });
        } catch (error) {
          console.error("Failed to save image to IndexedDB", error);
        }
      }
    } catch (err: any) {
      console.error("Failed to upload portfolio media", err);
      alert("Upload failed: " + (err.message || String(err)));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full bg-white relative flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative">
      {/* Header */}
      <div className="px-6 pt-4 pb-4 flex justify-end gap-4 z-10">
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-[#EF4423] text-white text-[13px] font-bold rounded-[12px] shadow-sm hover:bg-[#d63f1c] transition-colors">
          Invite to Campaign
        </button>
        <button className="p-2 text-[#808b98] hover:text-gray-900 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 3L3 10.5l7.5 3 3 7.5L21 3z" />
            <path d="M10.5 13.5l4.5-4.5" />
          </svg>
        </button>
        
      </div>

      <div className="px-6 pb-24">
        {/* Profile Info */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-[88px] h-[88px] rounded-[24px] overflow-hidden shadow-sm shrink-0">
            <Image 
              src={profile.profilePic} 
              alt="Profile" 
              width={88} height={88} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-[26px] font-bold text-gray-600 tracking-tight">{profile.fullName}</h1>
              {profile.isVerified && (
                <BadgeCheck className="text-[#EF4423] w-6 h-6 fill-[#EF4423] text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-10 px-2">
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-bold text-[#EF4423]">{profile.followers}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-bold text-[#EF4423]">{profile.viewership}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Avg Viewership</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[20px] font-bold text-[#EF4423]">{profile.engagement}</span>
            <span className="text-[10px] text-gray-400 font-bold mt-1">Avg Engagement</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            className={`flex-1 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm ${activeTab === 'About' ? 'bg-[#EF4423] text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
            onClick={() => setActiveTab('About')}
          >
            About
          </button>
          <button 
            className={`flex-1 py-3.5 rounded-2xl text-[13px] font-bold transition-all shadow-sm ${activeTab === 'Portfolio' ? 'bg-[#EF4423] text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
            onClick={() => setActiveTab('Portfolio')}
          >
            Portfolio
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'About' && (
          <div className="flex flex-col gap-5">
            {/* Bio Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
              <h3 className="text-[13px] font-bold text-gray-500 mb-3">Bio</h3>
              <p className="text-[13px] text-gray-400 leading-[1.6] font-medium">
                {profile.bio}
              </p>
            </div>

            {/* Success Rate Card */}
            <div className="bg-white rounded-[24px] px-6 py-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-600">{profile.projects}</span>
                <span className="text-[12px] text-gray-400 font-medium">Projects Done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-gray-600">{profile.successRate}</span>
                <span className="text-[12px] text-gray-400 font-medium">Success Rate</span>
              </div>
            </div>

            {/* Budgets Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
              <h3 className="text-[13px] font-bold text-gray-500 mb-4">Budgets</h3>
              <div className="flex flex-col gap-4 text-[13px]">
                {profile.budgets.map((b, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{b.name}</span>
                    <span className="text-gray-400 font-medium">{b.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
              <h3 className="text-[13px] font-bold text-gray-500 mb-4">Badges</h3>
              <div className="flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-[34px] h-[34px] bg-[#EF4423] rounded-full flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* On The Web */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
              <h3 className="text-[13px] font-bold text-gray-500 mb-5">On The Web</h3>
              <div className="flex gap-4">
                <a 
                  href={profile.socials?.instagram ? (profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://${profile.socials.instagram}`) : '#'} 
                  target={profile.socials?.instagram ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${profile.socials?.instagram ? 'bg-pink-50 text-pink-500 hover:bg-pink-100' : 'bg-[#8c919c] text-white'}`}
                >
                  <InstagramIcon size={18} />
                </a>
                <a 
                  href={profile.socials?.facebook ? (profile.socials.facebook.startsWith('http') ? profile.socials.facebook : `https://${profile.socials.facebook}`) : '#'} 
                  target={profile.socials?.facebook ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${profile.socials?.facebook ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-[#8c919c] text-white'}`}
                >
                  <FacebookIcon size={18} />
                </a>
                <a 
                  href={profile.socials?.x ? (profile.socials.x.startsWith('http') ? profile.socials.x : `https://${profile.socials.x}`) : '#'} 
                  target={profile.socials?.x ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${profile.socials?.x ? 'bg-gray-50 text-gray-800 hover:bg-gray-100' : 'bg-[#8c919c] text-white'}`}
                >
                  <TwitterIcon size={18} />
                </a>
                <a 
                  href={profile.socials?.linkedin ? (profile.socials.linkedin.startsWith('http') ? profile.socials.linkedin : `https://${profile.socials.linkedin}`) : '#'} 
                  target={profile.socials?.linkedin ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${profile.socials?.linkedin ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-[#8c919c] text-white'}`}
                >
                  <LinkedinIcon size={18} />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Portfolio' && (
          <div className="grid grid-cols-2 gap-4 pb-16">
            {profile.portfolioImages && profile.portfolioImages.length > 0 ? (
              profile.portfolioImages.map((img, i) => (
                <div key={i} className="aspect-square rounded-[24px] overflow-hidden relative group">
                  {(img.startsWith('data:video/') || img.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                    <video src={img} className="w-full h-full object-cover" controls playsInline />
                  ) : (
                    <img src={img} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                  )}
                  
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 flex flex-col items-center justify-center text-gray-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <p>No portfolio images yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Actions removed */}
      </div>
      </div>

      <BottomNav />
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-[20px] w-full max-w-sm mx-4">
            <h2 className="text-[18px] font-bold text-gray-900 mb-4">Invite to Campaign</h2>
            {campaigns.length === 0 ? (
              <p className="text-[14px] text-gray-500 mb-6">You don't have any active campaigns to invite this creator to.</p>
            ) : (
              <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto">
                {campaigns.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => handleInvite(c.id)}
                    className="text-left p-3 rounded-[12px] border border-gray-200 hover:border-[#EF4423] hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-bold text-[14px] text-gray-900">{c.title}</div>
                    <div className="text-[12px] text-gray-500 line-clamp-1">{c.description}</div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowInviteModal(false)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-[12px] hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
