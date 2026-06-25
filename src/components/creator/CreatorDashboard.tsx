'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '../shared/BottomNav';

const defaultProfilePic = '/profile_pic.png';

interface ProfileData {
  fullName: string;
  bio: string;
  profilePic: string;
  category: string;
  portfolioLink: string;
  portfolioImages: string[];
  followers: string;
  viewership: string;
  engagement: string;
  projects: string;
  successRate: string;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Hello Lorem',
    bio: 'Lorem ipsum dolor sit amet',
    profilePic: defaultProfilePic,
    category: 'Category',
    portfolioLink: '',
    portfolioImages: [],
    followers: '44.5k',
    viewership: '22.8k',
    engagement: '38.9k',
    projects: '17',
    successRate: '92%'
  });

  const [campaigns] = useState([
    {
      id: 1,
      timeAgo: '25 minute ago',
      title: 'Glow With Radiance',
      subtitle: '- Skincare Brand Campaign',
      budget: '₹6000',
      dateRange: '04 September - 10 September 2025',
      description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
      daysLeft: '2 days left'
    },
    {
      id: 2,
      timeAgo: '25 minute ago',
      title: 'Glow With Radiance',
      subtitle: '- Skincare Brand Campaign',
      budget: '₹6000',
      dateRange: '04 September - 10 September 2025',
      description: "We're looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.",
      daysLeft: '5 days left'
    }
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('kaling_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        // eslint-disable-next-line
        setProfile(prev => ({ ...prev, ...parsed }));
      }
    }
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f9fafb] pb-24">
      {/* Profile Header Block */}
      <section className="bg-white rounded-[32px] p-6 m-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8">
        <div className="flex items-center gap-6 mb-6">
          <Image src={profile.profilePic || defaultProfilePic} alt="Profile" width={96} height={96} className="w-24 h-24 rounded-full object-cover shadow-sm flex-shrink-0" />
          <div className="flex-1 flex justify-between items-center bg-[#f8fafc] rounded-2xl p-4">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 font-medium mb-1">Followers</span>
              <span className="text-lg font-bold text-gray-900">{profile.followers}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 font-medium mb-1">Avg Viewership</span>
              <span className="text-lg font-bold text-gray-900">{profile.viewership}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 font-medium mb-1">Avg Engagement</span>
              <span className="text-lg font-bold text-gray-900">{profile.engagement}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profile.fullName}</h1>
          <div className="px-4 py-1.5 bg-[#f3f4f6] rounded-full text-sm font-semibold text-gray-700 flex items-center gap-1 cursor-pointer">
            <span>{profile.category}</span>
            <span className="text-xs">⌄</span>
          </div>
        </div>

        <div className="text-gray-600 text-sm leading-relaxed mb-4">
          <p>{profile.bio}</p>
        </div>

        <div className="mb-6">
          <a href={profile.portfolioLink || '#'} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] text-sm hover:underline font-medium">
            {profile.portfolioLink || 'Portfolio/Website link'}
          </a>
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2">
          <button 
            className={`pb-2 text-sm font-semibold transition-colors ${mediaTab === 'photos' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
            onClick={() => setMediaTab('photos')}
          >
            Photos
          </button>
          <button 
            className={`pb-2 text-sm font-semibold transition-colors ${mediaTab === 'videos' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
            onClick={() => setMediaTab('videos')}
          >
            Videos
          </button>
        </div>

        <div className="mb-6">
          {mediaTab === 'photos' && (
            profile.portfolioImages && profile.portfolioImages.filter(src => !src.startsWith('data:video')).length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {profile.portfolioImages.filter(src => !src.startsWith('data:video')).map((img, i) => (
                  <div key={i} className="relative w-full aspect-square rounded-xl overflow-hidden">
                    <Image src={img} alt={`Portfolio ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium">
                No photos added yet.
              </div>
            )
          )}

          {mediaTab === 'videos' && (
            profile.portfolioImages && profile.portfolioImages.filter(src => src.startsWith('data:video')).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {profile.portfolioImages.filter(src => src.startsWith('data:video')).map((vid, i) => (
                  <video 
                    key={i} 
                    src={vid} 
                    className="w-full aspect-[9/16] object-cover rounded-xl bg-black" 
                    controls 
                    controlsList="nodownload noplaybackrate"
                  />
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm font-medium">
                No videos added yet.
              </div>
            )
          )}
        </div>

        <button 
          className="w-full py-4 bg-gradient-to-r from-[#EF4823] to-[#ff6b4a] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(239,72,35,0.25)] hover:-translate-y-0.5 transition-all duration-300"
          onClick={() => router.push('/kyc')}
        >
          Authenticate
        </button>
      </section>

      {/* Tabs */}
      <section className="flex gap-4 px-6 mb-6">
        <button className="px-6 py-2.5 bg-black text-white rounded-full font-semibold text-sm">Active</button>
        <button className="px-6 py-2.5 bg-transparent text-gray-500 rounded-full font-semibold text-sm hover:bg-gray-100">Completed</button>
      </section>

      {/* Campaigns List */}
      <section className="px-4 flex flex-col gap-4 mb-8">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100" key={campaign.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-gray-200 p-1 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gray-100 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{campaign.timeAgo}</span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{campaign.title}</h3>
                  <p className="text-xs font-semibold text-gray-500">{campaign.subtitle}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Budget</span>
                  <span className="text-sm font-extrabold text-[#EF4823]">{campaign.budget}</span>
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-[#fff7ed] text-[#ea580c] text-xs font-bold rounded-md mb-3">
                {campaign.dateRange}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {campaign.description} <span className="text-[#0066cc] font-semibold cursor-pointer hover:underline">Read more</span>
              </p>
              <div className="inline-block px-3 py-1 bg-[#f3f4f6] text-gray-700 text-xs font-bold rounded-md">
                {campaign.daysLeft}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-5">
            No active campaigns available.
          </div>
        )}
      </section>

      {/* Call to Actions */}
      <section className="px-4 flex flex-col gap-4">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 flex justify-between items-center border border-orange-200/50 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-orange-600 mb-1">Find More</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">campaigns</span>
            </div>
          </div>
          <button className="relative z-10 px-6 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">View</button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 flex justify-between items-center border border-blue-200/50 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-blue-600 mb-1">Find</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">Partners</span>
            </div>
          </div>
          <button className="relative z-10 px-6 py-2.5 bg-white text-gray-900 text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">View</button>
        </div>
      </section>

      <BottomNav profilePic={profile.profilePic || defaultProfilePic} />
    </div>
  );
}
