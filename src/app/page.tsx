"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  Terminal,
  Activity,
  Shield,
  Cpu,
  Layers
} from "lucide-react";

// Geonixa Premium Logo Component
const GeonixaLogo = ({ className = "h-12 w-auto" }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className={`relative ${className} group cursor-pointer`}
  >
    <img src="/images/geonixa-logo.svg" alt="Geonixa Logo" className="h-full w-auto" />
  </motion.div>
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#020408] text-white overflow-hidden selection:bg-orange-500/30">
      
      {/* Premium Background Architecture */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b1b0a,transparent_70%)] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
        
        {/* Animated Geometric Grid */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black, transparent 80%)'
        }} />

        {/* Floating Orbs */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            y: [0, 40, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full"
        />
      </div>

      {/* Navigation Header */}
      <header className="relative z-50 px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-5 group">
            <img src="/images/geonixa-logo.svg" alt="Geonixa Logo" className="h-14 w-auto" />
            <div className="flex flex-col border-l border-white/10 pl-5">
              <span className="text-[10px] font-black text-orange-500 tracking-[0.4em] uppercase">Enterprise Intel</span>
              <span className="text-[8px] font-bold text-white/30 tracking-[0.2em] uppercase mt-1">Global Proctoring Node</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-12">
            {['Architecture', 'Security', 'Protocols'].map((item) => (
              <Link key={item} href="#" className="text-[11px] font-black text-white/40 hover:text-white tracking-[0.3em] uppercase transition-all duration-300">
                {item}
              </Link>
            ))}
          </nav>

          <Link href="/auth/login" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-white/10 transition-all backdrop-blur-md">
            Portal Access
          </Link>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-40 px-6">
        <div className="max-w-6xl w-full">
          
          <div className="flex flex-col items-center text-center">
            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.4em] mb-12"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Strategic Assessment v4.0 Active
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-9xl lg:text-[160px] font-black leading-[0.8] tracking-tighter text-white mb-10"
            >
              BEYOND <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-orange-600">INTEGRITY.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl leading-relaxed mb-16"
            >
              The world's most sophisticated AI-proctoring engine. Geonixa redefines enterprise assessment through behavioral forensics and secure neural clusters.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8"
            >
              <Link href="/auth/login" className="group relative flex items-center gap-4 px-12 py-7 bg-orange-600 text-white rounded-[32px] font-black text-xs tracking-[0.3em] overflow-hidden shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                LAUNCH ENVIRONMENT <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="flex items-center gap-4 px-12 py-7 bg-white/5 border border-white/10 rounded-[32px] font-black text-xs tracking-[0.3em] hover:bg-white/10 transition-all">
                <Terminal className="w-5 h-5 text-orange-500" /> VIEW ARCHITECTURE
              </button>
            </motion.div>

            {/* Micro Features Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl"
            >
              {[
                { icon: Shield, label: "Neural Shield", desc: "Real-time behavioral forensics" },
                { icon: Cpu, label: "Kernel Logic", desc: "Proprietary assessment engine" },
                { icon: Layers, label: "Decentralized", desc: "Global edge node distribution" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white uppercase tracking-widest mb-1 italic">{feature.label}</div>
                    <div className="text-xs text-white/30 font-bold tracking-wide uppercase">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="absolute bottom-12 left-0 w-full px-8 flex justify-between items-center z-10 opacity-30 grayscale hover:opacity-100 transition-all duration-700">
        <span className="text-[9px] font-black tracking-[0.8em] text-white uppercase">© 2026 GEONIXA CORP. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-10">
          {['SOC2', 'GDPR', 'ISO'].map(tag => (
            <span key={tag} className="text-[9px] font-black tracking-widest text-white">{tag} COMPLIANT</span>
          ))}
        </div>
      </footer>

      {/* Animated Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
        <motion.div 
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-full h-[1px] bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
        />
      </div>

    </div>
  );
}
