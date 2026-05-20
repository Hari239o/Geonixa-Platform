"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle, Mail, Briefcase, GraduationCap, Lock, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [domain, setDomain] = useState("Java");
  const [slot, setSlot] = useState("9-10 AM");
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const loadSlots = async () => {
      const { getSlotAvailability } = await import('@/lib/firebase');
      const availability = await getSlotAvailability();
      setSlotAvailability(availability);
    };
    loadSlots();
    const interval = setInterval(loadSlots, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [generatedPass, setGeneratedPass] = useState("");

  const IS_REGISTRATION_OPEN = true; // Enabled for testing and candidate onboarding

  const techDomains = ["Java", "Python", "Web Development", "Data Science", "Data Analytics"];
  const nonTechDomains = ["VLSI", "AutoCAD", "Embedded", "EV", "Civil"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessLink("");

    if (typeof window !== "undefined") {
      try {
        const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        try {
          await allocateSlotWithTransaction(slot, email, { name, college, domain, day }, autoPass);
        } catch (e: any) {
          if (e === "SLOT_FULL" || e.message === "SLOT_FULL") {
            alert("SLOT_EXHAUSTED: This slot just reached maximum capacity. Please select another timing.");
            const availability = await getSlotAvailability();
            setSlotAvailability(availability);
            setIsLoading(false);
            return;
          }
          throw e;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: autoPass, name, college, domain, slot, day })
        });
        const data = await res.json();

        setIsLoading(false);

        if (data.success) {
          setIsRegistered(true);
          setGeneratedPass(autoPass);
          if (data.previewUrl) {
            setSuccessLink(data.previewUrl);
          }
        } else {
          alert(data.error);
        }
      } catch (err) {
        setIsLoading(false);
        alert("Server validation crash.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050810] text-white">
      {/* GeoNixa Header */}
      <header className="px-8 py-6 border-b border-slate-900 bg-[#080B14] flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF5A1F] rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">GEONIXA</h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Security</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-600 font-mono hidden md:block">
          STATUS: <span className="text-emerald-500">ENCRYPTED_SESSION_ACTIVE</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          {!isRegistered ? (
            <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-3">Candidate Enrollment</h2>
                <p className="text-slate-500 text-sm">Register your profile to receive assessment credentials.</p>
              </div>

              {IS_REGISTRATION_OPEN ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="w-3 h-3 text-[#FF5A1F]" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        placeholder="Kishore Reddy" 
                        required 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#FF5A1F] focus:outline-none transition-all placeholder:text-slate-700" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="w-3 h-3 text-[#FF5A1F]" /> College
                      </label>
                      <input 
                        type="text" 
                        placeholder="NIT Trichy" 
                        required 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#FF5A1F] focus:outline-none transition-all placeholder:text-slate-700" 
                        value={college} 
                        onChange={e => setCollege(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-[#FF5A1F]" /> Assessment Domain
                    </label>
                    <select 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#FF5A1F] focus:outline-none transition-all appearance-none" 
                      value={domain} 
                      onChange={e => setDomain(e.target.value)}
                    >
                      <optgroup label="Technology" className="bg-slate-900">
                        {techDomains.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                      <optgroup label="Non-Technology" className="bg-slate-900">
                        {nonTechDomains.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail className="w-3 h-3 text-[#FF5A1F]" /> Secure Delivery Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="kishore@geonixa.com" 
                        required 
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#FF5A1F] focus:outline-none transition-all placeholder:text-slate-700" 
                        value={email} 
                        onChange={e => setEmail(e.target.value.toLowerCase().trim())} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#FF5A1F]" /> Preferred Date
                      </label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#FF5A1F] focus:outline-none transition-all" 
                        value={day} 
                        onChange={e => setDay(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-3 h-3 text-[#FF5A1F]" /> Select Examination Slot (Max 25/slot)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["SLOT_1", "SLOT_2", "SLOT_3", "SLOT_4"].map((id) => {
                        const { getSlotAvailability, SLOT_CONFIG } = require('@/lib/firebase');
                        const config = (SLOT_CONFIG as any)[id];
                        const count = slotAvailability[id] || 0;
                        const remaining = 25 - count;
                        const isFull = remaining <= 0;
                        const isLow = remaining > 0 && remaining <= 5;
                        
                        return (
                          <div
                            key={id}
                            onClick={() => !isFull && setSlot(id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                              slot === id 
                                ? "bg-[#FF5A1F]/10 border-[#FF5A1F] shadow-[0_0_20px_rgba(255,90,31,0.1)]" 
                                : isFull ? "bg-slate-900/50 border-slate-900 opacity-60 grayscale cursor-not-allowed" : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                                isFull ? "bg-red-500/20 text-red-500" : isLow ? "bg-orange-500/20 text-orange-500" : "bg-emerald-500/20 text-emerald-500"
                              }`}>
                                {isFull ? "FULL" : isLow ? "FEW LEFT" : "AVAILABLE"}
                              </span>
                              <span className="text-slate-500 text-[10px] font-mono">{config.start} - {config.end}</span>
                            </div>
                            <div className="font-bold text-sm text-white">{config.label}</div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="h-1.5 flex-1 bg-slate-900 rounded-full overflow-hidden mr-3">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${(count / 25) * 100}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{remaining} Seats Left</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    disabled={isLoading} 
                    type="submit" 
                    className="w-full bg-[#FF5A1F] hover:bg-[#E44E18] text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-[0_10px_20px_rgba(255,90,31,0.2)] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Generating Credentials...
                      </span>
                    ) : (
                      <>Generate Secure Access <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Registration Locked</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    The public registration window is closed. Access is currently restricted to pre-authorized corporate candidates.
                  </p>
                </div>
              )}

              <p className="mt-8 text-center text-slate-600 text-xs">
                Already registered? <Link href="/auth/login" className="text-[#FF5A1F] font-bold hover:underline">Access Portal</Link>
              </p>
            </div>
          ) : (
            <div className="bg-[#0D121F] border border-slate-900 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl font-black mb-4">Onboarding Initialized</h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                Secure credentials for <span className="text-white font-bold">{email}</span> have been generated and dispatched.
              </p>

              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 mb-8 relative">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">Secure Pass-Key (Backup)</p>
                <div className="flex items-center justify-center gap-4">
                  <code className="text-2xl font-mono text-emerald-400 font-bold">{generatedPass}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPass);
                      alert("Copied to clipboard");
                    }}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                  >
                    <Briefcase className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Proceed to Secure Login
                </Link>
                {successLink && (
                  <a href={successLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 text-xs hover:text-white transition-colors">
                    Preview Official Invite Payload
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      <footer className="p-8 text-center border-t border-slate-900">
        <p className="text-[10px] text-slate-700 uppercase tracking-[0.2em] font-bold">
          © 2026 GEONIXA CORP • SYSTEM LEVEL ENCRYPTION : AES-256
        </p>
      </footer>
    </div>
  );
}
