"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Clock, Activity, ChevronRight, Fingerprint, Shield, Keyboard, Terminal } from 'lucide-react';

export default function CandidateLoginBox() {
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
                setError("SLOT_EXPIRED: Your allocated examination slot has concluded.");
                localStorage.setItem(`geonixa_passkey_expired_${email}`, "true");
                setIsLoading(false);
                return;
              }

              if (now < slotStart) {
                const waitMinutes = Math.ceil((slotStart.getTime() - now.getTime()) / 60000);
                setError(`SLOT_PENDING: Your examination is scheduled to begin at ${startPart}. Please return in ${waitMinutes} minute(s).`);
                setIsLoading(false);
                return;
              }

              localStorage.removeItem(`geonixa_passkey_expired_${email}`);
              localStorage.setItem(`geonixa_slot_start_${email}`, slotStart.toISOString());
              localStorage.setItem(`geonixa_slot_end_${email}`, slotEnd.toISOString());
            }
          } catch (e) {
            console.error("Strict slot validation error:", e);
            setError("SLOT_VALIDATION_ERROR: Unable to validate slot timing.");
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
        setError("IDENTITY_LOCKED: You have already completed this assessment.");
      } else if (status === "SLOT_EXPIRED") {
        setError("SLOT_EXPIRED: Your assigned exam slot has already elapsed.");
      } else if (status === "SLOT_PENDING") {
        setError("SLOT_PENDING: Your exam slot is not yet active. Return at scheduled time.");
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
    <div className="w-full max-w-[450px] mx-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div 
            key="login-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[50px] p-8 md:p-10 shadow-[0_25px_60px_-15px_rgba(249,115,22,0.3)] border border-slate-100 relative overflow-hidden"
          >
            {/* Top Border Highlight */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-orange-400 via-orange-500 to-amber-500" />
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold mb-4">
                <Lock className="w-4 h-4" /> Secure Gateway
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Candidate Access</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Enter your authorized credentials to initialize assessment.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-[11px] text-red-600 font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Corporate Email</label>
                <input 
                  type="email" 
                  placeholder="talent@geonixa.com" 
                  required 
                  className="w-full bg-[#f1f5f9] border-2 border-transparent rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                  value={email}
                  onChange={e => setEmail(e.target.value.toLowerCase().trim())}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Secure Pass-Key</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••" 
                    required 
                    className="w-full bg-[#f1f5f9] border-2 border-transparent rounded-2xl px-6 py-4 pr-16 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-medium"
                    value={password}
                    onChange={e => setPassword(e.target.value.trim())}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full bg-[#ff5a1f] hover:bg-[#e04a15] text-white py-3.5 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 group shadow-[0_8px_16px_rgba(255,90,31,0.2)] mt-6"
              >
                {isLoading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <>Initialize Terminal <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Invited Candidates Only</span>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <Clock className="w-4 h-4 text-orange-500" /> Slot Validation Active
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="authorization-screen"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-emerald-500/10 border border-emerald-100 relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
             
             <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto text-emerald-500 mb-6">
                  <Fingerprint className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-900 leading-tight">Identity <br /><span className="text-emerald-500">Verified</span></h3>
                <p className="text-slate-500 text-sm font-medium">
                  Secure session initialized for <br/><span className="text-slate-900 font-bold">{targetEmail}</span>.
                </p>
                
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      const features = `width=${window.screen.availWidth},height=${window.screen.availHeight},top=0,left=0,fullscreen=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`;
                      window.open("/exam/session-ready", "SecureExamEnvironment", features);
                      document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#050810;color:white;font-family:sans-serif;text-align:center;"><div><h1 style="font-size:2rem;margin-bottom:1rem;color:#f97316;">Exam Running</h1><p style="color:#94a3b8;">Your secure assessment is running in a new window.</p></div></div>';
                    }}
                    style={{ width: "100%", backgroundColor: "#0f172a", color: "#ffffff", padding: "1.25rem 2rem", borderRadius: "1rem", fontWeight: 900, fontSize: "0.875rem", letterSpacing: "-0.025em", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  >
                    START ASSESSMENT
                    <Terminal className="w-5 h-5" style={{ color: "#f97316" }} />
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
