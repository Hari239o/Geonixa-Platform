'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/shared/BottomNav';
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { getItem } from '@/utils/storage';

export default function PartnerSchedulePage() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  const [isInstantAvailable, setIsInstantAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'dates'>('daily');
  
  // Daily schedule state: e.g. { "monday": ["09:00", "10:00"] }
  const [availableDays, setAvailableDays] = useState<Record<string, string[]>>({});
  // Specific dates state: e.g. { "2026-07-20": ["14:00", "15:00"] }
  const [availableDates, setAvailableDates] = useState<Record<string, string[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Selection state for UI
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState('');

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeBlocks = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const p = await getItem<any>('kaling_user_profile');
        if (p && p.profilePic) {
          setProfilePic(p.profilePic);
        }
        
        const res = await fetch('/api/partner/schedule');
        if (res.ok) {
          const data = await res.json();
          if (data.schedule) {
            setIsInstantAvailable(data.schedule.isInstantAvailable || false);
            setAvailableDays(data.schedule.availableDays || {});
            setAvailableDates(data.schedule.availableDates || {});
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveSchedule = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/partner/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isInstantAvailable,
          availableDays,
          availableDates
        })
      });
      // Could show a toast here
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDayBlock = (day: string, time: string) => {
    setAvailableDays(prev => {
      const current = prev[day] || [];
      const updated = current.includes(time) 
        ? current.filter(t => t !== time)
        : [...current, time];
      
      const newDays = { ...prev };
      if (updated.length > 0) {
        newDays[day] = updated.sort();
      } else {
        delete newDays[day];
      }
      return newDays;
    });
  };

  const toggleDateBlock = (date: string, time: string) => {
    setAvailableDates(prev => {
      const current = prev[date] || [];
      const updated = current.includes(time) 
        ? current.filter(t => t !== time)
        : [...current, time];
      
      const newDates = { ...prev };
      if (updated.length > 0) {
        newDates[date] = updated.sort();
      } else {
        delete newDates[date];
      }
      return newDates;
    });
  };

  const addSpecificDate = () => {
    if (newDateInput && !availableDates[newDateInput]) {
      setAvailableDates(prev => ({
        ...prev,
        [newDateInput]: []
      }));
      setExpandedDate(newDateInput);
      setNewDateInput('');
    }
  };

  const removeSpecificDate = (date: string) => {
    setAvailableDates(prev => {
      const newDates = { ...prev };
      delete newDates[date];
      return newDates;
    });
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#F8F9FA]"><div className="animate-spin w-8 h-8 border-4 border-[#EF4423] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-[#F8F9FA] flex flex-col font-sans overflow-hidden pb-[72px]">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-gray-800 hover:text-[#EF4423]">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-extrabold text-[#1a1a2e]">Time Slots & Schedule</h1>
        </div>
        <p className="text-[13px] text-gray-500 pl-9">Manage your availability for brands</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        
        {/* Instant Available Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-lg">Instant Availability</span>
            <span className="text-[12px] text-gray-400">Available to work right now</span>
          </div>
          <button 
            onClick={() => setIsInstantAvailable(!isInstantAvailable)}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${isInstantAvailable ? 'bg-[#2ECC71]' : 'bg-gray-200'}`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isInstantAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'daily' ? 'bg-white text-[#EF4423] shadow-sm' : 'text-gray-500'}`}
          >
            <Clock size={16} /> Daily Hours
          </button>
          <button 
            onClick={() => setActiveTab('dates')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'dates' ? 'bg-white text-[#EF4423] shadow-sm' : 'text-gray-500'}`}
          >
            <Calendar size={16} /> Specific Dates
          </button>
        </div>

        {/* Daily Schedule Content */}
        {activeTab === 'daily' && (
          <div className="flex flex-col gap-3">
            {daysOfWeek.map(day => {
              const isActive = !!availableDays[day];
              const isExpanded = expandedDay === day;
              
              return (
                <div key={day} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedDay(isExpanded ? null : day)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive ? 'bg-[#EF4423] border-[#EF4423]' : 'border-gray-300'}`}>
                        {isActive && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`font-bold capitalize ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="text-[11px] font-bold text-[#EF4423] bg-orange-50 px-2 py-1 rounded-md">
                          {availableDays[day].length} slots
                        </span>
                      )}
                      <ChevronRight size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50 bg-gray-50/30">
                      <p className="text-[11px] text-gray-500 mb-3">Select available 1-hour blocks</p>
                      <div className="grid grid-cols-3 gap-2">
                        {timeBlocks.map(time => {
                          const isSelected = availableDays[day]?.includes(time);
                          return (
                            <button
                              key={time}
                              onClick={() => toggleDayBlock(day, time)}
                              className={`py-2 text-[12px] font-semibold rounded-lg transition-colors border ${
                                isSelected 
                                  ? 'bg-[#EF4423]/10 border-[#EF4423] text-[#EF4423]' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {formatTime(time)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Specific Dates Content */}
        {activeTab === 'dates' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input 
                type="date" 
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4423]/20 focus:border-[#EF4423]"
                min={new Date().toISOString().split('T')[0]}
              />
              <button 
                onClick={addSpecificDate}
                className="bg-[#1a1a2e] text-white px-5 rounded-xl font-bold text-sm hover:bg-gray-800"
              >
                Add Date
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {Object.keys(availableDates).sort().map(date => {
                const isExpanded = expandedDate === date;
                return (
                  <div key={date} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedDate(isExpanded ? null : date)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                          <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-[11px] text-gray-400">
                            {availableDates[date].length > 0 ? `${availableDates[date].length} slots selected` : 'No slots selected'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeSpecificDate(date); }}
                          className="text-red-400 text-[11px] font-bold px-2 py-1 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                        <ChevronRight size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-50 bg-gray-50/30">
                        <p className="text-[11px] text-gray-500 mb-3">Select available 1-hour blocks</p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeBlocks.map(time => {
                            const isSelected = availableDates[date]?.includes(time);
                            return (
                              <button
                                key={time}
                                onClick={() => toggleDateBlock(date, time)}
                                className={`py-2 text-[12px] font-semibold rounded-lg transition-colors border ${
                                  isSelected 
                                    ? 'bg-[#EF4423]/10 border-[#EF4423] text-[#EF4423]' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                {formatTime(time)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {Object.keys(availableDates).length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Calendar size={24} />
                  </div>
                  <p className="text-gray-500 text-sm">No specific dates added yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Add a date above to set custom availability.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Save Button spacing */}
        <div className="h-20"></div>
      </div>

      {/* Save Button (Fixed at bottom above nav) */}
      <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-20">
        <button 
          onClick={saveSchedule}
          disabled={isSaving}
          className="w-full bg-[#1a1a2e] text-white py-3.5 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 hover:bg-gray-900 active:scale-[0.98] transition-all"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Save Schedule
            </>
          )}
        </button>
      </div>

      <BottomNav profilePic={profilePic || undefined} />
    </div>
  );
}
