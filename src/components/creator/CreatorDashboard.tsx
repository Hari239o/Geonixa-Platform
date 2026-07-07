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
 socials?: {
   instagram?: string;
   facebook?: string;
   x?: string;
   linkedin?: string;
 };
 budgets?: any[];
}

export default function CreatorDashboard() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'Private' | 'Public'>('Private');
 const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');
 const [profile, setProfile] = useState<ProfileData>({
 fullName: '',
 bio: '',
 profilePic: defaultProfilePic,
 category: 'Category',
 portfolioLink: '',
 portfolioImages: [],
 followers: '0',
 viewership: '0',
 engagement: '0',
 projects: '0',
 successRate: '0%',
 isVerified: false,
 socials: {},
 budgets: []
 });
 const [showVerifyModal, setShowVerifyModal] = useState(false);

 const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      // 1. First immediately load from local storage
      let localProfile = null;
      if (typeof window !== 'undefined') {
        try {
          const parsed = await getItem<any>('kaling_user_profile');
          if (parsed) {
            localProfile = parsed;
            setProfile(prev => ({ 
              ...prev, 
              ...parsed,
              followers: parsed.followers || '0',
              viewership: parsed.viewership || '0',
              engagement: parsed.engagement || '0',
              projects: parsed.projects || '0',
              successRate: parsed.successRate || '0%',
              isVerified: parsed.isVerified || false,
              socials: parsed.socials || {},
              budgets: parsed.budgets || []
            }));
          }
        } catch (error) {
          console.error("Failed to load profile from local DB:", error);
        }
      }

      // 2. Fetch fresh data from database
      try {
        const res = await fetch('/api/user/complete-profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const mergedProfile = {
              ...data.profile,
              fullName: data.profile.fullName || '',
              bio: data.profile.bio || '',
              followers: data.profile.followers || '0',
              viewership: data.profile.viewership || '0',
              engagement: data.profile.engagement || '0',
              projects: data.profile.projects || '0',
              successRate: data.profile.successRate || '0%',
              isVerified: data.profile.isVerified || false,
              socials: data.profile.socials || localProfile?.socials || {
                instagram: data.profile.instagram || '',
                facebook: data.profile.facebook || '',
                x: data.profile.x || '',
                linkedin: data.profile.linkedin || ''
              },
              budgets: data.profile.budgets || localProfile?.budgets || []
            };
            
            setProfile(prev => ({ 
              ...prev, 
              ...mergedProfile
            }));
            
            // Cache to IndexedDB for next load
            import('@/utils/storage').then(({ setItem, getItem }) => {
              getItem<any>('kaling_user_profile').then(existing => {
                setItem('kaling_user_profile', { ...(existing || {}), ...mergedProfile });
              });
            });

            if (!data.profile.isVerified && !localProfile?.isVerified) {
              setShowVerifyModal(true);
            }
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
          setCampaigns(data.campaigns.map((c: any) => ({
             id: c.id,
             timeAgo: '20 minutes ago',
             title: c.title,
             subtitle: c.visibility === 'Private' ? 'Private | Haircare' : 'Public | Haircare',
             budget: c.budget || '₹8000',
             dateRange: c.dateRange || '04 September - 10 September',
             description: c.description || 'We are looking for lifestyle and beauty influencers to showcase our new Radiance Glow Serum.',
             visibility: c.visibility || 'Public',
             // Mock states for UI demonstration
             privateState: c.id % 3 === 0 ? 'negotiating' : c.id % 2 === 0 ? 'accepted' : 'pending'
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
                  <div className="flex items-center mt-0.5">
                    <BadgeCheck className="text-primary-red w-5 h-5 fill-primary-red text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">

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
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Private' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Private')}
          >
            Private
          </button>
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Public' ? 'bg-[#EF4823] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Public')}
          >
            Public
          </button>
        </div>

        <div className="px-4 sm:px-6 mb-8">
          {/* Bio Box */}
          <div className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-2">About me</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{profile.bio}</p>
          </div>

          {/* On The Web section moved to Profile tab */}

          {/* Budgets moved to Profile tab */}
        </div>

        {activeTab === 'Private' && (
          <>
            {/* Private Campaigns List */}
            <section className="px-4 flex flex-col gap-5 mb-8">
              {campaigns.filter(c => c.visibility === 'Private').length > 0 ? (
                campaigns.filter(c => c.visibility === 'Private').map((campaign) => (
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50" key={campaign.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-[#f4f6fa] rounded-full p-2 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center opacity-40">
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium ml-auto">{campaign.timeAgo}</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1a1a2e]">{campaign.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{campaign.subtitle}</p>
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
                    
                    {campaign.privateState === 'accepted' ? (
                      <div className="inline-block px-5 py-2 bg-[#22C55E] text-white text-[12px] font-bold rounded-[8px]">
                        Accepted
                      </div>
                    ) : campaign.privateState === 'negotiating' ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-[#EF4823] text-[11px] font-bold">Negotiated to ₹9000</p>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-[8px] hover:bg-gray-200">Accept</button>
                          <button className="flex-1 py-2 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-[8px] hover:bg-gray-200">Reject</button>
                          <div className="flex-1 flex items-center bg-gray-50 rounded-[8px] border border-gray-200 px-2">
                            <span className="text-gray-400 text-[12px]">-</span>
                            <span className="text-[#EF4823] text-[11px] font-bold flex-1 text-center">₹9000</span>
                            <span className="text-gray-400 text-[12px]">+</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-[#EF4823] text-white text-[11px] font-bold rounded-[8px] hover:bg-[#d63f1c]">Accept</button>
                        <button className="flex-1 py-2 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-[8px] hover:bg-gray-200">Reject</button>
                        <button className="flex-1 py-2 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-[8px] hover:bg-gray-200">Negotiate</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-5">
                  No private invitations yet.
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'Public' && (
          <>
            {/* Public Campaigns List */}
            <section className="px-4 flex flex-col gap-5 mb-8">
              {campaigns.filter(c => c.visibility === 'Public').length > 0 ? (
                campaigns.filter(c => c.visibility === 'Public').map((campaign) => (
                  <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50" key={campaign.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-[#f4f6fa] rounded-full p-2 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center opacity-40">
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium ml-auto">{campaign.timeAgo}</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1a1a2e]">{campaign.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{campaign.subtitle}</p>
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
                    
                    <button className="w-fit px-8 py-2 border border-gray-200 text-gray-700 text-[12px] font-bold rounded-[12px] hover:bg-gray-50 transition-colors">
                      Apply
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-5">
                  No public campaigns available.
                </div>
              )}
            </section>
          </>
        )}

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
