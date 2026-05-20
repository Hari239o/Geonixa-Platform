"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, CheckCircle, Mail, Briefcase, GraduationCap, Lock, Clock } from 'lucide-react';
import Link from 'next/link';
import { NON_TECHNICAL_DOMAINS, TECHNICAL_DOMAINS, getExamPatternForDomain } from '@/data/domainConfig';

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [domain, setDomain] = useState("Java");
  const [slot, setSlot] = useState("SLOT_1");
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

  const IS_REGISTRATION_OPEN = false; // Disabled: Admin will send exam links directly from admin portal

  const examPattern = getExamPatternForDomain(domain);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessLink("");

    if (typeof window !== "undefined") {
      try {
        const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { allocateSlotWithTransaction, getSlotAvailability } = await import('@/lib/firebase');
        
        try {
          await allocateSlotWithTransaction(slot, email, { name, email, college, domain, day }, autoPass);
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
                <p className="text-slate-500 text-sm">Access is securely restricted to provisioned candidates.</p>
              </div>

              {IS_REGISTRATION_OPEN ? (
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* form fields omitted since IS_REGISTRATION_OPEN is false */}
                </form>
              ) : (
                <div className="text-center py-10 space-y-6">
                  <div className="w-20 h-20 bg-[#FF5A1F]/10 rounded-3xl border border-[#FF5A1F]/20 flex items-center justify-center mx-auto shadow-2xl shadow-[#FF5A1F]/10">
                    <Lock className="w-10 h-10 text-[#FF5A1F]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Public Sign-Up Disabled</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                      Geonixa Assessment Platform is an invite-only corporate screening infrastructure. Free public registration is strictly disabled.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                      <Mail className="w-4 h-4" /> Official Dispatch Notice
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All assessment exam links, scheduled slot timings, and secure passkeys are dispatched directly to candidates via email exclusively from the enterprise administration portal.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href="/auth/login" className="inline-flex items-center justify-center gap-3 w-full py-4 bg-[#FF5A1F] hover:bg-[#E44E18] text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(255,90,31,0.2)] transition-all">
                      Proceed to Secure Candidate Portal <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              <p className="mt-8 text-center text-slate-600 text-xs">
                Authorized Personnel? <Link href="/admin/dashboard" className="text-slate-400 font-bold hover:underline">Admin Command Center</Link>
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
