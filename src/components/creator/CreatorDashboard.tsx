'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, BadgeCheck } from 'lucide-react';
import BottomNav from '../shared/BottomNav';
import { getItem } from '@/utils/storage';

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
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const parsed = await getItem<any>('kaling_user_profile');
        if (parsed) {
          setProfile(prev => ({ 
            ...prev, 
            ...parsed,
            followers: parsed.followers === '0' ? '44.5k' : parsed.followers,
            viewership: parsed.viewership === '0' ? '22.8k' : parsed.viewership,
            engagement: parsed.engagement === '0' ? '38.9k' : parsed.engagement,
            projects: parsed.projects === '0' ? '17' : parsed.projects,
            successRate: parsed.successRate === '0%' ? '92%' : parsed.successRate
          }));
        }
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {/* Top Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 pt-10 mb-8">
          <div className="flex items-center gap-4">
            <Image src={profile.profilePic || defaultProfilePic} alt="Profile" width={48} height={48} className="w-14 h-14 rounded-[18px] object-cover shadow-sm" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mt-1">
                <h1 className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">{profile.fullName}</h1>
                <BadgeCheck className="text-primary-red w-5 h-5 fill-primary-red text-white" />
              </div>
            </div>
          </div>
          <button 
            className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
            onClick={() => router.push('/home/notifications')}
          >
            <Bell className="w-6 h-6 text-[#1a1a2e]" strokeWidth={2.5} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-primary-red rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Stats Row 1 */}
        <div className="flex justify-between items-center px-4 sm:px-8 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[22px] font-extrabold text-primary-red">{profile.followers}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[22px] font-extrabold text-primary-red">{profile.viewership}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Avg Viewership</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[22px] font-extrabold text-primary-red">{profile.engagement}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Avg Engagement</span>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="flex justify-between items-center px-8 mb-8">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#1a1a2e]">{profile.projects}</span>
            <span className="text-[11px] text-gray-400 font-medium">Projects Done</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#1a1a2e]">{profile.successRate}</span>
            <span className="text-[11px] text-gray-400 font-medium">Success Rate</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mx-4 sm:mx-6 mb-6 bg-[#f9fafb] rounded-2xl p-1 border border-gray-100/50">
          <button className="flex-1 py-3 text-[13px] font-bold text-gray-400 rounded-xl">Active</button>
          <button className="flex-1 py-3 text-[13px] font-bold text-white bg-primary-red rounded-xl shadow-[0_4px_12px_rgba(239,72,35,0.2)]">Completed</button>
        </div>

        {/* Bio Box */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-2">About me</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{profile.bio}</p>
          </div>
        </div>
        <div className="px-4 sm:px-6 mb-8">
          <button 
            className="w-full py-4 bg-gradient-to-r from-[#EF4823] to-[#ff6b4a] text-white text-[15px] font-bold rounded-[18px] shadow-[0_8px_20px_rgba(239,72,35,0.25)] hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => router.push('/kyc')}
          >
            Authenticate
          </button>
        </div>

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
                <div className="inline-block px-4 py-1.5 bg-[#2ed47a] text-white text-[11px] font-bold rounded-md">
                  Completed
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
        <section className="px-4 flex flex-col gap-4 mb-8">
          <div className="bg-[#EF4823] rounded-2xl p-6 flex justify-between items-center relative overflow-hidden shadow-md h-[100px]">
            <div className="absolute top-0 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-white/90 mb-0.5">Find More</span>
                <span className="text-xl font-medium text-white tracking-wide">campaigns</span>
              </div>
            </div>
            <button className="relative z-10 px-6 py-2.5 bg-[#d8f042] text-[#EF4823] text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">View</button>
          </div>
          
          <div className="bg-[#EF4823] rounded-2xl p-6 flex justify-between items-center relative overflow-hidden shadow-md h-[100px]">
            <div className="absolute top-0 right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-10 w-24 h-24 bg-white opacity-10 rounded-full blur-xl transform -translate-x-10 translate-y-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-white/90 mb-0.5">Find</span>
                <span className="text-xl font-medium text-white tracking-wide">Partners</span>
              </div>
            </div>
            <button className="relative z-10 px-6 py-2.5 bg-[#d8f042] text-[#EF4823] text-sm font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">View</button>
          </div>
        </section>
      </div>

      <BottomNav profilePic={profile.profilePic || defaultProfilePic} />
    </div>
  );
}
