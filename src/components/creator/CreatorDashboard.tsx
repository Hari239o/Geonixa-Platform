'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Bell, BadgeCheck, MessageCircle } from 'lucide-react';
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
            
            if (!parsed.isVerified) {
              // setShowVerifyModal(true);
            }
          } else {
            // setShowVerifyModal(true);
          }
        } catch (error) {
          console.error("Failed to load profile from local DB:", error);
          // setShowVerifyModal(true);
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
              // setShowVerifyModal(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile from DB:", error);
      }
    }
    
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns?role=creator');
        const data = await res.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns.map((c: any) => ({
             id: c.id,
             timeAgo: 'Just now',
             title: c.title,
             subtitle: c.subtitle || `${c.visibility || 'Public'} Campaign`,
             budget: c.budget || 'Open',
             dateRange: c.dateRange || 'TBD',
             description: c.description || 'No description provided.',
             visibility: c.visibility || 'Public',
             brandProfilePic: c.user?.brandProfile?.profilePic || null,
             invite: c.campaignInvites && c.campaignInvites.length > 0 ? c.campaignInvites[0] : null
          })));
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    }

    loadProfile();
    fetchCampaigns();
  }, []);

  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [negotiatedPrice, setNegotiatedPrice] = useState<string>('');

  const handleRespond = async (inviteId: string, action: string, price?: string, message?: string) => {
    try {
      const res = await fetch('/api/campaigns/respond-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId, action, negotiatedPrice: price, message })
      });
      if (res.ok) {
        // Refresh campaigns
        const campaignsRes = await fetch('/api/campaigns');
        const data = await campaignsRes.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns.map((c: any) => ({
             id: c.id,
             timeAgo: 'Just now',
             title: c.title,
             subtitle: c.subtitle || `${c.visibility || 'Public'} Campaign`,
             budget: c.budget || 'Open',
             dateRange: c.dateRange || 'TBD',
             description: c.description || 'No description provided.',
             visibility: c.visibility || 'Public',
             invite: c.campaignInvites && c.campaignInvites.length > 0 ? c.campaignInvites[0] : null
          })));
        }
        setNegotiatingId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {/* Top Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm flex justify-between items-center px-4 sm:px-6 pt-4 pb-4 mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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
          <div className="flex gap-3">
            <div 
              onClick={() => router.push('/chats')}
              className="w-[42px] h-[42px] bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <MessageCircle className="w-[20px] h-[20px] text-gray-800" strokeWidth={2.5} />
            </div>
            <div 
              onClick={() => router.push('/creator/notifications')}
              className="w-[42px] h-[42px] bg-white rounded-[16px] shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center cursor-pointer transition-transform active:scale-95 relative"
            >
              <Bell className="w-[20px] h-[20px] text-gray-800" strokeWidth={2.5} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-[#EF4423] rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>

        {/* Authentication Prompt */}
        {!profile.isVerified && (
          <div className="mb-8 px-4 sm:px-6">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="w-full bg-[#EF4423] hover:bg-[#d63d1c] text-white font-bold py-3.5 rounded-[16px] shadow-[0_4px_15px_rgba(239,72,35,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              Authenticate Account
            </button>
          </div>
        )}

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
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Private' ? 'bg-[#EF4423] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('Private')}
          >
            Private
          </button>
          <button 
            className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all ${activeTab === 'Public' ? 'bg-[#EF4423] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
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
                  <div 
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 cursor-pointer hover:shadow-md transition-shadow" 
                    key={campaign.id}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {campaign.brandProfilePic ? (
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100">
                          <img src={campaign.brandProfilePic} alt="Brand" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 bg-[#f4f6fa] rounded-full p-2 flex items-center justify-center shrink-0">
                          <div className="w-6 h-6 border-2 border-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center opacity-40">
                          </div>
                        </div>
                      )}
                      <span className="text-[11px] text-gray-400 font-medium ml-auto">{campaign.timeAgo}</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1a1a2e]">{campaign.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{campaign.subtitle}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Budget</span>
                        <span className="text-sm font-black text-[#EF4423]">{campaign.budget}</span>
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-md mb-3">
                      {campaign.dateRange}
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4 pr-4">
                      {campaign.description} <span className="text-[#EF4423] font-bold cursor-pointer hover:underline">Read more</span>
                    </p>
                    
                    {['accepted', 'brand_accepted_negotiation'].includes(campaign.privateState || '') ? (
                      <div className="mt-2 w-full py-3 bg-green-50 text-green-600 text-[12px] font-bold rounded-[12px] text-center border border-green-100 uppercase tracking-wide">
                        STATUS: ACCEPTED
                      </div>
                    ) : campaign.privateState === 'negotiating' ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <p className="text-[#EF4423] text-[12px] font-bold">Message: {campaign.requests?.[0]?.message || 'Negotiating amount...'}</p>
                        <div className="w-full py-3 bg-orange-50 text-orange-500 text-[12px] font-bold rounded-[12px] text-center border border-orange-100 uppercase tracking-wide">
                          STATUS: NEGOTIATING
                        </div>
                      </div>
                    ) : campaign.privateState === 'rejected' ? (
                      <div className="mt-2 w-full py-3 bg-red-50 text-red-500 text-[12px] font-bold rounded-[12px] text-center border border-red-100 uppercase tracking-wide">
                        STATUS: REJECTED
                      </div>
                    ) : null}
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
                  <div 
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 cursor-pointer hover:shadow-md transition-shadow" 
                    key={campaign.id}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {campaign.brandProfilePic ? (
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100">
                          <img src={campaign.brandProfilePic} alt="Brand" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 bg-[#f4f6fa] rounded-full p-2 flex items-center justify-center shrink-0">
                          <div className="w-6 h-6 border-2 border-indigo-400 rounded-sm transform rotate-45 flex items-center justify-center opacity-40">
                          </div>
                        </div>
                      )}
                      <span className="text-[11px] text-gray-400 font-medium ml-auto">{campaign.timeAgo}</span>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-[#1a1a2e]">{campaign.title}</h3>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{campaign.subtitle}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Budget</span>
                        <span className="text-sm font-black text-[#EF4423]">{campaign.budget}</span>
                      </div>
                    </div>
                    <div className="inline-block px-3 py-1 bg-orange-50 text-orange-400 text-[10px] font-bold rounded-md mb-3">
                      {campaign.dateRange}
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed mb-4 pr-4">
                      {campaign.description} <span className="text-[#EF4423] font-bold cursor-pointer hover:underline">Read more</span>
                    </p>
                    
                    {['brand_accepted_negotiation', 'BRAND_ACCEPTED_NEGOTIATION', 'ACCEPTED', 'accepted', 'applied'].includes(campaign.privateState || '') ? (
                      <div className="mt-2 w-full py-3 bg-green-50 text-green-600 text-[12px] font-bold rounded-[12px] text-center border border-green-100 uppercase tracking-wide">
                        STATUS: {campaign.privateState === 'applied' ? 'APPLIED' : 'ACCEPTED'}
                      </div>
                    ) : null}
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
              <BadgeCheck className="w-[42px] h-[42px] text-[#EF4423] fill-[#EF4423] text-white mb-3" />
              <h2 className="text-[20px] font-black text-[#EF4423] text-center mb-1 tracking-tight">VERIFY YOUR ACCOUNT</h2>
              <p className="text-[13px] text-gray-500 font-medium text-center mb-6 leading-tight">
                With Aadhar
              </p>



              <button 
                className="w-full py-3.5 bg-[#EF4423] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#d63f1c] transition-colors shadow-[0_4px_14px_rgba(239,72,35,0.3)]"
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
