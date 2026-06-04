"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  Keyboard,
  Fingerprint,
  Cpu,
  Activity,
  Terminal,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (email === "talent@geonixa.com") {
      window.location.href = "/auth/admin-login";
      return;
    }

    try {
      const { verifyCandidateFirebase, getCandidateProfile } = await import('@/lib/firebase');
      const status = await verifyCandidateFirebase(email, password);

      if (status === "SUCCESS") {
        // Clear stale session cache on fresh login
        localStorage.removeItem("geonixa_student_profile");
        localStorage.removeItem(`geonixa_r1_answers_${email}`);
        localStorage.removeItem(`geonixa_r2_answers_${email}`);
        localStorage.removeItem(`geonixa_r3_texts_${email}`);
        const profile = await getCandidateProfile(email);

        if (profile?.day && profile?.slot) {
          try {
            const parts = profile.slot.split(' - ');
            if (parts.length === 2) {
              const startPart = parts[0].trim();
              const endPart = parts[1].trim();

              const [startTime, startModifier] = startPart.split(' ');
              let [startHours, startMinutes] = startTime.split(':').map(Number);
              if (startModifier === 'PM' && startHours !== 12) startHours += 12;
              if (startModifier === 'AM' && startHours === 12) startHours = 0;

              const [endTime, endModifier] = endPart.split(' ');
              let [endHours, endMinutes] = endTime.split(':').map(Number);
              if (endModifier === 'PM' && endHours !== 12) endHours += 12;
              if (endModifier === 'AM' && endHours === 12) endHours = 0;

              const isoStart = `${profile.day}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00+05:30`;
              const isoEnd = `${profile.day}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00+05:30`;

              const slotStart = new Date(isoStart);
              const slotEnd = new Date(isoEnd);
              const now = new Date();

              if (now > slotEnd) {
                setError("SLOT_EXPIRED: Your allocated examination slot has concluded. Pass-keys are PERMANENTLY INVALIDATED beyond slot end time. No re-entry permitted.");
                localStorage.setItem(`geonixa_passkey_expired_${email}`, "true");
                setIsLoading(false);
                return;
              }

              if (now < slotStart) {
                const waitMinutes = Math.ceil((slotStart.getTime() - now.getTime()) / 60000);
                setError(`SLOT_PENDING: Your examination is scheduled to begin at ${startPart}. Please return in ${waitMinutes} minute(s). Early access is strictly prohibited.`);
                setIsLoading(false);
                return;
              }

              localStorage.removeItem(`geonixa_passkey_expired_${email}`);
              localStorage.setItem(`geonixa_slot_start_${email}`, slotStart.toISOString());
              localStorage.setItem(`geonixa_slot_end_${email}`, slotEnd.toISOString());
            }
          } catch (e) {
            console.error("Strict slot validation error:", e);
            setError("SLOT_VALIDATION_ERROR: Unable to validate slot timing. Contact administrator.");
            setIsLoading(false);
            return;
          }
        }

        const authResponse = await fetch('/api/auth/firebase-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, passKey: password }),
          credentials: 'include',
        });

        const authData = await authResponse.json();
        if (!authResponse.ok || !authData.ok) {
          setError(authData.error || 'Unable to establish secure session');
          setIsLoading(false);
          return;
        }

        localStorage.setItem("geonixa_current_user", email);
        localStorage.setItem("geonixa_student_profile", JSON.stringify(profile));
        if (profile?.domain) localStorage.setItem(`geonixa_domain_${email}`, profile.domain);
        if (profile?.name) localStorage.setItem('geonixa_current_user_name', profile.name);
        localStorage.setItem('geonixa_current_user_role', 'student');
        setTargetEmail(email);
        setIsSuccess(true);
        setIsLoading(false);
        return;
      } else if (status === "COMPLETED") {
        setError("IDENTITY_LOCKED: Our records indicate you have already completed this assessment. Multiple attempts are strictly prohibited.");
      } else if (status === "SLOT_EXPIRED") {
        setError("SLOT_EXPIRED: Your assigned exam slot has already elapsed. The pass-key has been revoked and access is permanently blocked.");
      } else if (status === "SLOT_PENDING") {
        setError("SLOT_PENDING: Your exam slot is not yet active. Please return at the scheduled start time.");
      } else if (status === "SLOT_INVALID") {
        setError("SLOT_INVALID: Your slot metadata is invalid. Contact administrator immediately.");
      } else if (status === "INVALID_PASS") {
        setError("Authentication failed: Incorrect pass-key.");
      } else {
        setError("Identity not found in corporate database.");
      }
    } catch (err) {
      setError("Secure Pipeline Error. Check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-orange-500/30">
      <div className="mesh-bg" />
      <div className="grid-overlay" />
      
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="login-ui"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col p-6"
          >
            {/* Header */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 glass-panel flex items-center justify-center rounded-lg group-hover:border-orange-500/50 transition-all">
                  <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Back to Overview</span>
              </Link>
              <div className="flex items-center gap-3">
                <img src="/images/geonixa-logo.png" alt="Geonixa Logo" className="h-24 w-auto scale-110" />
              </div>
            </div>

            {/* Login Card */}
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="w-full max-w-lg">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 md:p-12 rounded-[40px] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-transparent via-orange-500 to-transparent opacity-50" />
                  
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black tracking-widest mb-6">
                      <Lock className="w-3 h-3" /> SECURE GATEWAY
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tight">CANDIDATE ACCESS</h2>
                    <p className="text-slate-500 text-sm font-medium mt-2">Enter your authorized credentials to initialize assessment.</p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-[11px] text-red-400 font-bold"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">CORPORATE EMAIL</label>
                      <input 
                        type="email" 
                        placeholder="name@organization.com" 
                        required 
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-medium"
                        value={email}
                        onChange={e => setEmail(e.target.value.toLowerCase().trim())}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">SECURE PASS-KEY</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          required 
                          className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 pr-16 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-medium"
                          value={password}
                          onChange={e => setPassword(e.target.value.trim())}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      disabled={isLoading}
                      type="submit" 
                      className="btn-premium w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-orange-900/20"
                    >
                      {isLoading ? (
                        <Activity className="w-5 h-5 animate-spin" />
                      ) : (
                        <>INITIALIZE TERMINAL <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </form>

                  <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Invited Candidates Only</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-orange-500" /> Slot Validation Active
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto w-full py-8 text-center">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
                ENCRYPTED SESSION • GEONIXA CORE v2.4.0
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="authorization-screen"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-12">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-orange-500/20">
                      <Fingerprint className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter text-white">GEONIXA</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em]">Authorization Confirmed</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-6xl font-black text-white italic leading-[1.1]">IDENTITY <br /><span className="text-slate-600">VERIFIED.</span></h3>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-lg">
                      Secure session initialized for <span className="text-white font-black underline decoration-orange-500/50 underline-offset-4">{targetEmail}</span>.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="glass-panel px-8 py-5 rounded-2xl flex-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">PROCTORING</span>
                      <span className="text-white font-bold text-sm">KERNEL_ISOLATION</span>
                    </div>
                    <div className="glass-panel px-8 py-5 rounded-2xl flex-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">NETWORK</span>
                      <span className="text-white font-bold text-sm">SECURE_SYNC</span>
                    </div>
                  </div>
                </div>

                {/* Rules Container */}
                <div className="glass-panel p-10 md:p-14 rounded-[50px] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full scanline opacity-10 pointer-events-none" />
                  
                  <div className="flex items-center gap-4 mb-12">
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <AlertCircle className="text-orange-500 w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight italic">PROTOCOL ENFORCEMENT</h4>
                  </div>

                  <div className="space-y-8 mb-16">
                    {[
                      { title: "Browser Integrity", desc: "Real-time kernel monitoring of tab switches and system activity.", icon: <Shield className="w-5 h-5" /> },
                      { title: "Behavioral Analytics", desc: "Proprietary AI gaze tracking and cognitive pattern detection.", icon: <Activity className="w-5 h-5" /> },
                      { title: "Input Lockdown", desc: "Full restriction on clipboard activity and external peripherals.", icon: <Keyboard className="w-5 h-5" /> }
                    ].map((rule, i) => (
                      <div key={i} className="flex gap-6 group/rule">
                        <div className="w-12 h-12 shrink-0 glass-panel rounded-2xl flex items-center justify-center text-slate-500 group-hover/rule:text-orange-500 group-hover/rule:border-orange-500/50 transition-all">
                          {rule.icon}
                        </div>
                        <div>
                          <p className="text-lg font-black text-white mb-1">{rule.title}</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{rule.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      const features = `width=${window.screen.availWidth},height=${window.screen.availHeight},top=0,left=0,fullscreen=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`;
                      window.open("/exam/session-ready", "SecureExamEnvironment", features);
                      // Change current tab to indicate the exam is running elsewhere
                      document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#050810;color:white;font-family:sans-serif;text-align:center;"><div><h1 style="font-size:2rem;margin-bottom:1rem;color:#f97316;">Exam Running</h1><p style="color:#94a3b8;">Your secure assessment is running in a new window.</p></div></div>';
                    }}
                    style={{ width: "100%", backgroundColor: "#0f172a", color: "#ffffff", padding: "1.5rem 2rem", borderRadius: "1.5rem", fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.025em", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    INITIALIZE ASSESSMENT
                    <Terminal className="w-6 h-6" style={{ color: "#f97316" }} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

