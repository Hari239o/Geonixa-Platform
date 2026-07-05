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
 isVerified?: boolean;
}

export default function CreatorDashboard() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
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
 successRate: '92%',
 isVerified: false
 });
 const [showVerifyModal, setShowVerifyModal] = useState(false);

 const [campaigns, setCampaigns] = useState<any[]>([]);

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
            successRate: parsed.successRate === '0%' ? '92%' : parsed.successRate,
            isVerified: parsed.isVerified || false
          }));
          if (!parsed.isVerified) {
            setShowVerifyModal(true);
          }
        } else {
          setShowVerifyModal(true);
        }
      }
    }
    
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns.map((c: any) => ({
             id: c.id,
             timeAgo: 'Just now',
             title: c.title,
             subtitle: c.subtitle || '',
             budget: c.budget || 'Open',
             dateRange: c.dateRange || 'TBD',
             description: c.description || '',
             daysLeft: c.daysLeft || 'Active'
          })));
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    }

    loadProfile();
    fetchCampaigns();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {/* Top Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 pt-4 mb-8">
          <div className="flex items-center gap-4">
            <Image src={profile.profilePic || defaultProfilePic} alt="Profile" width={48} height={48} className="w-14 h-14 rounded-[18px] object-cover shadow-sm" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mt-1">
                <h1 className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">{profile.fullName}</h1>
                {profile.isVerified && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <BadgeCheck className="text-primary-red w-5 h-5 fill-primary-red text-white" />
                    <span className="text-primary-red text-xs font-bold uppercase tracking-wider">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                const userId = localStorage.getItem("kalinq_mock_user_id");
                if (!userId) return alert("User ID not initialized yet");
                try {
                  const res = await fetch("/api/notifications/trigger", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId,
                      message: "<b>New Campaign!</b> A brand wants to work with you.",
                      actionLabel: "View Details"
                    })
                  });
                  const data = await res.json();
                  if (!data.success) alert(data.error || "Failed to send notification");
                } catch(e) {
                  console.error(e);
                }
              }}
              className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md font-bold"
            >
              Test Notification
            </button>
            <button 
              className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
              onClick={() => router.push('/creator/notifications')}
            >
              <Bell className="w-6 h-6 text-[#1a1a2e]" strokeWidth={2.5} />
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-primary-red rounded-full border-2 border-white"></span>
            </button>
          </div>
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
        <div className="flex gap-2 mx-4 sm:mx-6 mb-6 bg-[#f9fafb] rounded-[18px] p-1 border border-gray-100/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Active' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Active')}
          >
            Active
          </button>
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Completed' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Completed')}
          >
            Completed
          </button>
        </div>

        <div className="px-4 sm:px-6 mb-8">
          {/* Bio Box */}
          <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-2">About me</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{profile.bio}</p>
          </div>
          
          {/* Fallback Authenticate Button if modal is closed */}
          {!profile.isVerified && (
            <button 
              className="w-full py-4 bg-gradient-to-r from-[#EF4823] to-[#ff6b4a] text-white text-[15px] font-bold rounded-[18px] shadow-[0_8px_20px_rgba(239,72,35,0.25)] hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => router.push('/kyc')}
            >
              Authenticate
            </button>
          )}
        </div>

        {activeTab === 'Active' && (
          <>
            {/* Campaigns List */}
            <section className="px-4 flex flex-col gap-5 mb-8">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50" key={campaign.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-[#f4f6fa] rounded-full p-2 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center">
                           <div className="w-full h-0.5 bg-indigo-400 transform -rotate-45"></div>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium ml-auto">{campaign.timeAgo}</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1a1a2e]">{campaign.title}</h3>
                        <p className="text-[11px] font-medium text-gray-500 italic mt-0.5">{campaign.subtitle}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Budget</span>
                        <span className="text-sm font-black text-[#EF4823]">{campaign.budget}</span>
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-md mb-3">
                      {campaign.dateRange}
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4 pr-4">
                      {campaign.description} <span className="text-[#EF4823] font-bold cursor-pointer hover:underline">Read more</span>
                    </p>
                    <div className="inline-block px-3.5 py-1.5 bg-[#EF4823] text-white text-[11px] font-bold rounded-[8px]">
                      {campaign.daysLeft || "2 days left"}
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
              <div className="bg-[#f05133] rounded-[16px] p-6 flex justify-between items-center relative overflow-hidden shadow-md h-[110px]">
                {/* Abstract decorative shapes */}
                <div className="absolute top-0 right-0 w-full h-full">
                  <div className="absolute -top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl mix-blend-overlay"></div>
                  <div className="absolute -bottom-10 left-20 w-32 h-32 bg-white/20 rounded-full blur-lg mix-blend-overlay"></div>
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#ea580c] opacity-30 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-white/90 mb-0.5">Find More</span>
                    <span className="text-2xl font-medium text-white tracking-wide">campaigns</span>
                  </div>
                </div>
                <button className="relative z-10 px-6 py-2 bg-[#ddec6a] text-[#f05133] text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow">View</button>
              </div>
              
              <div className="bg-[#f05133] rounded-[16px] p-6 flex justify-between items-center relative overflow-hidden shadow-md h-[110px]">
                {/* Abstract decorative shapes */}
                <div className="absolute top-0 right-0 w-full h-full">
                  <div className="absolute -top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl mix-blend-overlay"></div>
                  <div className="absolute -bottom-10 left-20 w-32 h-32 bg-white/20 rounded-full blur-lg mix-blend-overlay"></div>
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#ea580c] opacity-30 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-white/90 mb-0.5">Find</span>
                    <span className="text-2xl font-medium text-white tracking-wide">Partners</span>
                  </div>
                </div>
                <button className="relative z-10 px-6 py-2 bg-[#ddec6a] text-[#f05133] text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-shadow">View</button>
              </div>
            </section>
          </>
        )}

        {/* Logout Button */}
        <div className="px-4 mb-8">
          <button
            onClick={() => {
              localStorage.removeItem("kaling_user_profile");
              localStorage.removeItem("kalinq_mock_user_id");
              router.push("/");
            }}
            className="w-full text-red-500 font-bold py-4 flex items-center justify-center gap-2 hover:bg-red-50 rounded-[16px] transition-colors border border-red-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Verify Account Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[320px] rounded-[24px] p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mt-2">
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4823] fill-[#EF4823] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4823] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>

              <button 
                onClick={() => router.push('/kyc')}
                className="w-full py-3.5 border-2 border-dashed border-[#EF4823]/40 rounded-[14px] flex items-center justify-center gap-3 mb-6 hover:bg-[#EF4823]/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4823]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-[#1a1a2e] font-semibold text-[14px]">Camera</span>
              </button>

              <button 
                className="w-full py-3.5 bg-[#EF4823] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#d63f1c] transition-colors shadow-[0_4px_14px_rgba(239,72,35,0.3)]"
                onClick={() => router.push('/kyc')}
              >
                VERIFY
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav profilePic={profile.profilePic || defaultProfilePic} />
    </div>
  );
}
