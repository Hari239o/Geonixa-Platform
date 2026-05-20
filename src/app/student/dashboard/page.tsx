"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Clock, 
  ArrowRight, 
  Shield, 
  Terminal, 
  BrainCircuit,
  User,
  LogOut,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [user, setUser] = useState<{ email: string; name: string; college: string; domain: string; slot: string; day: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("geonixa_current_user");
      if (email) {
        const profiles = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
        setUser({ email, ...profiles[email] });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("geonixa_current_user");
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-slate-900 bg-[#080B14]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF5A1F] rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">GEONIXA</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-black text-white">{user?.name || "Candidate"}</span>
            <span className="text-[8px] font-bold text-[#FF5A1F] uppercase tracking-widest">{user?.domain || "General"} Track</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-slate-900 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all border border-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Hero */}
        <div className="mb-12 relative overflow-hidden bg-gradient-to-br from-[#0D121F] to-[#050810] border border-slate-900 rounded-[40px] p-10 md:p-16">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <BrainCircuit className="w-64 h-64 text-[#FF5A1F]" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Enterprise <br /><span className="text-slate-500 italic">Assessment Terminal.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Welcome back, <span className="text-white font-bold">{user?.name}</span>. Your portal is synchronized with the Geonixa secure intelligence network. Your scheduled assessment window is active.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/exam/session-ready"
                className="bg-[#FF5A1F] hover:bg-[#E44E18] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2 group shadow-[0_15px_30px_rgba(255,90,31,0.2)]"
              >
                INITIALIZE TERMINAL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="px-8 py-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center gap-3">
                 <Calendar className="w-4 h-4 text-slate-500" />
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{user?.day || "TBD"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Assigned Slot", value: user?.slot || "Unassigned", icon: <Clock />, color: "text-blue-500" },
            { label: "Track Security", value: "Level 4 (Encrypted)", icon: <Shield />, color: "text-emerald-500" },
            { label: "System Latency", value: "14ms (Optimal)", icon: <Target />, color: "text-amber-500" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0D121F] border border-slate-900 p-8 rounded-3xl relative overflow-hidden group hover:border-[#FF5A1F]/30 transition-all"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Critical Instructions */}
        <div className="bg-[#0D121F] border border-slate-900 rounded-[40px] p-10">
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="text-[#FF5A1F] w-6 h-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Pre-Assessment Protocols</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Browser Integrity", desc: "Ensure you are using the latest version of Chrome or Edge. Incognito mode is prohibited." },
              { title: "Biometric Calibration", desc: "Your camera must be positioned at eye-level with clear lighting." },
              { title: "Environment Lock", desc: "Dual monitors and screen-sharing software will trigger immediate disqualification." },
              { title: "Network Stability", desc: "A minimum bandwidth of 5Mbps is required for high-fidelity proctoring streams." },
            ].map((rule, i) => (
              <div key={i} className="flex gap-4 p-6 bg-slate-950/50 rounded-3xl border border-slate-900 group hover:border-[#FF5A1F]/20 transition-all">
                <div className="w-10 h-10 shrink-0 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-[#FF5A1F] transition-all">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white mb-1 uppercase tracking-widest">{rule.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="p-12 text-center border-t border-slate-900 mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-700" />
          <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">GeoNixa Security Infrastructure</span>
        </div>
        <p className="text-[10px] text-slate-600 font-medium">
          Authorized use only. Unauthorized access attempts are monitored and logged.
        </p>
      </footer>
    </div>
  );
}
