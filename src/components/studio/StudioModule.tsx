'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit3, Copy, Share2, Square, RefreshCcw } from 'lucide-react';
import BottomNav from '../shared/BottomNav';
import { getItem } from '@/utils/storage';

export default function StudioModule() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [profilePic, setProfilePic] = useState<string>('');
  
  useEffect(() => {
    async function loadProfile() {
      if (typeof window !== 'undefined') {
        const parsed = await getItem<any>('kaling_user_profile');
        if (parsed && parsed.profilePic) {
          setProfilePic(parsed.profilePic);
        }
      }
    }
    loadProfile();
  }, []);
  const [chatState, setChatState] = useState<'main' | 'generating' | 'generated'>('main');
  const [showShare, setShowShare] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [userMessage, setUserMessage] = useState('');

  const fullText = `Got it! Here are 2 content ideas that you can adapt for social media, blogs, or videos depending on your niche:
1. Behind-the-Scenes
Show how you work, your creative process, or what a "day in your life" looks like. People love authenticity.
2. Before & After
Transformation posts (designs, edits, projects, fitness, or even workspace makeovers) perform really well.`;

  // Typing effect simulation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (chatState === 'generating') {
      setGeneratedText('');
      let i = 0;
      const typeChar = () => {
        if (i < fullText.length) {
          setGeneratedText((prev) => prev + fullText.charAt(i));
          i++;
          timeout = setTimeout(typeChar, 20); // typing speed
        } else {
          setChatState('generated');
        }
      };
      typeChar();
    }
    return () => clearTimeout(timeout);
  }, [chatState]);

  const handleSend = (text?: string) => {
    const msg = text || inputText;
    if (!msg.trim()) return;
    setUserMessage(msg);
    setInputText('');
    setChatState('generating');
    setShowShare(false);
  };

  const stopGenerating = () => {
    setChatState('generated');
  };

  const handleSuggestion = (text: string) => {
    handleSend(`Give me 2 ${text}`);
  };

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-white relative flex flex-col overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-4 pb-4 z-20 shrink-0 bg-white">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-[#fff0e5] text-[#EF4423] rounded-[16px] flex items-center justify-center transition-transform active:scale-95"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {chatState === 'main' ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <img src="/logo.png" alt="Kalinq" className="w-48 h-auto opacity-[0.05] grayscale mb-10" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              {/* User Message */}
              <div className="flex items-center justify-end gap-3 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-[12px] bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    <img src={profilePic} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[13px] font-bold text-gray-900">{userMessage}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2">
                  <Edit3 size={18} />
                </button>
              </div>

              {/* AI Response */}
              <div className="w-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-[12px] bg-[#EF4423] flex items-center justify-center text-white shrink-0 shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g transform="rotate(45 12 12)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8.5 5C8.5 4.44772 8.94772 4 9.5 4H14.5C15.0523 4 15.5 4.44772 15.5 5V19C15.5 19.5523 15.0523 20 14.5 20H9.5C8.94772 20 8.5 19.5523 8.5 19V5ZM10 5.5H14V9.5H10V5.5Z" fill="currentColor" />
                      </g>
                      <path d="M10 2.5 Q10 5 12.5 5 Q10 5 10 7.5 Q10 5 7.5 5 Q10 5 10 2.5 Z" fill="currentColor" />
                      <path d="M19 4 Q19 6 21 6 Q19 6 19 8 Q19 6 17 6 Q19 6 19 4 Z" fill="currentColor" />
                      <path d="M16.5 13 Q16.5 15 18.5 15 Q16.5 15 16.5 17 Q16.5 15 14.5 15 Q16.5 15 16.5 13 Z" fill="currentColor" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-3 relative">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => setShowShare(!showShare)}
                      className="text-gray-400 hover:text-[#EF4423] transition-colors p-1"
                    >
                      <Share2 size={16} />
                    </button>
                    
                    {/* Share Popover */}
                    {showShare && (
                      <div className="absolute right-0 top-8 bg-white border border-[#EF4423]/20 shadow-[0_8px_30px_rgba(239,72,35,0.12)] rounded-[16px] py-2 w-32 z-50 animate-in fade-in zoom-in duration-200">
                        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-50 text-[11px] font-bold text-gray-700 transition-colors">
                          <img src="/facebook.png" alt="FB" className="w-4 h-4 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /> Facebook
                        </button>
                        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-50 text-[11px] font-bold text-gray-700 transition-colors">
                          <img src="/instagram.png" alt="IG" className="w-4 h-4 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /> Instagram
                        </button>
                        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-50 text-[11px] font-bold text-gray-700 transition-colors">
                          <img src="/twitter.png" alt="TW" className="w-4 h-4 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /> Twitter
                        </button>
                        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-50 text-[11px] font-bold text-gray-700 transition-colors">
                          <img src="/youtube.png" alt="YT" className="w-4 h-4 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /> Youtube
                        </button>
                        <div className="h-[1px] w-full bg-gray-100 my-1"></div>
                        <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-50 text-[11px] font-bold text-[#EF4423] transition-colors">
                          <Share2 size={14} /> Copylink
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-[12.5px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                  {generatedText}
                  {chatState === 'generating' && <span className="inline-block w-1.5 h-4 ml-1 bg-[#EF4423] animate-pulse align-middle"></span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Input */}
        <div className="px-6 pb-6 pt-4 shrink-0 bg-white">
          
          {/* Main State Suggestions */}
          {chatState === 'main' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[20px] font-extrabold text-[#1a1a2e] text-center mb-6 tracking-tight">What can I help with?</h2>
              
              <div className="flex items-center justify-center gap-3 mb-6 overflow-x-auto no-scrollbar">
                <button onClick={() => handleSuggestion('Content Ideas')} className="px-5 py-2.5 bg-[#f4f4f5] hover:bg-gray-200 text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-all">
                  Content Ideas
                </button>
                <button onClick={() => handleSuggestion('Captions/Descriptions')} className="px-5 py-2.5 bg-[#f4f4f5] hover:bg-gray-200 text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-all">
                  Captions/Descriptions
                </button>
                <button onClick={() => handleSuggestion('Scripts')} className="px-5 py-2.5 bg-[#f4f4f5] hover:bg-gray-200 text-gray-500 text-[11px] font-bold rounded-full whitespace-nowrap active:scale-95 transition-all">
                  Scripts
                </button>
              </div>
            </div>
          )}

          {/* Context Action Button (Stop / Regenerate) */}
          {chatState === 'generating' && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={stopGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <div className="w-3 h-3 bg-[#EF4423] rounded-sm"></div>
                <span className="text-[12px] font-bold text-gray-500">Stop generating...</span>
              </button>
            </div>
          )}

          {chatState === 'generated' && (
            <div className="flex justify-center mb-6">
              <button 
                onClick={() => setChatState('generating')}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-gray-500 hover:text-[#EF4423]"
              >
                <RefreshCcw size={14} className="text-[#EF4423]" />
                <span className="text-[12px] font-bold">Regenerate Response</span>
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Send a message." 
              disabled={chatState === 'generating'}
              className="w-full bg-white border border-gray-100 rounded-2xl pl-5 pr-14 py-4 outline-none text-[13px] text-gray-900 shadow-[0_2px_15px_rgba(0,0,0,0.04)] font-medium placeholder-gray-400 disabled:opacity-50"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputText.trim() || chatState === 'generating'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EF4423] p-1 active:scale-95 transition-transform disabled:opacity-50"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Nav pushes to bottom */}
      <div className="shrink-0 z-30">
        <BottomNav profilePic={profilePic} />
      </div>
    </div>
  );
}
