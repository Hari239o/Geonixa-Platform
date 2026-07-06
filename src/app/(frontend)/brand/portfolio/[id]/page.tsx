'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Mail, MapPin, Share2, Instagram, Twitter, Facebook, Globe, Star } from 'lucide-react';
import BottomNav from '@/components/brand/BottomNav';

export default function CreatorPortfolioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the brand unlocked this profile
    const unlocked = JSON.parse(localStorage.getItem('kaling_unlocked_profiles') || '[]');
    // For the demo, we won't strictly block here, but normally you'd verify if the session has access.
    
    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${params.id}`);
        const data = await res.json();
        if (data.success && data.creator) {
          setCreator(data.creator);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-full bg-[#F8F9FA] flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#EF4823]/30 border-t-[#EF4823] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="h-full bg-[#F8F9FA] flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
        <p className="text-gray-500 mb-6">The creator profile you are looking for doesn't exist.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-[#EF4823] text-white rounded-[16px] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24">
      {/* Header Area / Cover */}
      <div className="h-[200px] bg-gradient-to-br from-orange-400 to-[#EF4823] relative">
        <button 
          onClick={() => router.back()} 
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 hover:bg-white/30 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info Card */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center">
          <div className="w-28 h-28 bg-white p-1 rounded-full -mt-20 mb-4 shadow-sm border border-gray-50">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden relative">
              {creator.profilePic ? (
                <img src={creator.profilePic} alt={creator.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#EF4823] text-white flex items-center justify-center text-4xl font-bold uppercase">
                  {(creator.fullName || "C")[0]}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{creator.fullName || "Creator Name"}</h1>
            {creator.isVerified && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500/10" />}
          </div>
          
          <div className="text-[#EF4823] font-bold text-sm mb-4 capitalize bg-orange-50 px-3 py-1 rounded-full inline-block">
            {creator.category || "General"} Creator
          </div>

          <p className="text-gray-600 text-sm leading-relaxed max-w-[280px]">
            {creator.bio || "No bio provided."}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button className="px-8 py-3.5 bg-[#EF4823] text-white font-bold rounded-[16px] shadow-[0_4px_15px_rgba(239,72,35,0.3)] hover:bg-[#d63d1c] transition-all active:scale-95">
              Hire Creator
            </button>
            <button className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-[16px] flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-5 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Creator Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Followers</div>
            <div className="text-2xl font-black text-gray-900">{creator.followers || "0"}</div>
          </div>
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Engagement</div>
            <div className="text-2xl font-black text-gray-900">{creator.engagement || "0"}</div>
          </div>
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Viewership</div>
            <div className="text-2xl font-black text-gray-900">{creator.viewership || "0"}</div>
          </div>
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Success Rate</div>
            <div className="text-2xl font-black text-[#EF4823] flex items-center gap-1">
              {creator.successRate || "0%"}
              <Star className="w-5 h-5 fill-[#EF4823]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {creator.tags && creator.tags.length > 0 && (
        <div className="px-5 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Niche & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {creator.tags.map((tag: string, i: number) => (
              <span key={i} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="px-5 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Social Links</h2>
        <div className="bg-white rounded-[24px] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-1">
          {creator.instagram && (
            <a href={`https://instagram.com/${creator.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-[16px] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="flex-1 font-bold text-gray-800">@{creator.instagram}</div>
            </a>
          )}
          {creator.facebook && (
            <a href={creator.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-[16px] transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Facebook className="w-5 h-5 fill-white" />
              </div>
              <div className="flex-1 font-bold text-gray-800">Facebook</div>
            </a>
          )}
          {creator.x && (
            <a href={creator.x} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-[16px] transition-colors">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                <Twitter className="w-5 h-5 fill-white" />
              </div>
              <div className="flex-1 font-bold text-gray-800">X (Twitter)</div>
            </a>
          )}
          {creator.website && (
            <a href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-[16px] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 font-bold text-gray-800 text-sm truncate">{creator.website}</div>
            </a>
          )}
          {!creator.instagram && !creator.facebook && !creator.x && !creator.website && (
            <div className="p-4 text-center text-gray-500 text-sm">No social links provided</div>
          )}
        </div>
      </div>

      {/* Portfolio Images */}
      {creator.portfolioImages && creator.portfolioImages.length > 0 && (
        <div className="px-5 mt-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
          <div className="grid grid-cols-2 gap-3">
            {creator.portfolioImages.map((img: string, i: number) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-[20px] overflow-hidden relative shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                <img src={img} alt={`Portfolio ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
