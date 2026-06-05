"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Code2,
  FileText,
  Gauge,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  UsersRound,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Globe2,
  ChevronRight,
  Play,
  Menu,
  X
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useState, useEffect, useRef } from "react";

import CandidateLoginBox from "@/components/auth/CandidateLoginBox";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "Security", href: "#security" },
  { label: "Analytics", href: "#analytics" },
  { label: "Enterprise", href: "#enterprise" },
];

const metrics = [
  { label: "Platform Uptime", value: "99.99%" },
  { label: "AI Proctoring Signals", value: "6+" },
  { label: "Global Enterprises", value: "150+" },
  { label: "Assessments Delivered", value: "2M+" },
];

const capabilities = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Proctoring",
    detail: "Advanced facial recognition, head movement tracking, and ambient noise analysis to ensure complete integrity.",
  },
  {
    icon: Zap,
    title: "Real-time Operations",
    detail: "Instant telemetry, live candidate monitoring, and dynamic slot management at scale.",
  },
  {
    icon: Code2,
    title: "Enterprise IDE",
    detail: "Monaco-powered coding environment with multi-language support, hidden testcases, and execution metrics.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade Security",
    detail: "End-to-end encryption, SOC-2 compliance, and expiring passkeys for secure assessment delivery.",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-orange-500/30 font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-screen-2xl w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex flex-col items-start group z-50" aria-label="Geonixa home">
            <Logo className="transition-transform duration-500 group-hover:translate-x-1" size="lg" />
            <div className="hidden md:block mt-1">
              <p className="text-[10px] sm:text-xs tracking-widest font-black uppercase text-orange-500">Enterprise Assessment Intelligence</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-orange-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              <span className="relative flex items-center gap-2 z-10">
                Candidate Portal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden relative z-50 p-2 text-slate-600 hover:text-orange-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          initial={false}
          animate={mobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-3xl border-b border-slate-200 shadow-lg"
        >
          <div className="flex flex-col px-5 py-6 gap-4">
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full rounded-full bg-orange-500 py-3 text-center text-xs font-bold uppercase text-white"
              >
                Candidate Portal
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-16 px-5 sm:px-8 lg:px-12 min-h-[85vh] flex items-center">
        <div className="mx-auto max-w-screen-2xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 backdrop-blur-sm mb-8">
                <Sparkles className="h-4 w-4" />
                <span>The New Standard in Tech Hiring</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                Evaluate talent with <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-orange-500 to-amber-500">absolute precision.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 font-medium pr-10">
                Geonixa is the enterprise assessment infrastructure for modern teams. We unify AI proctoring, coding environments, and behavioral analytics into one seamless, secure platform.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full relative z-50"
            >
              <CandidateLoginBox />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-slate-200 bg-slate-50/50 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-2xl w-full px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 divide-x divide-slate-200">
            {metrics.map((metric, i) => (
              <motion.div 
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`flex flex-col ${i === 0 ? "pl-0" : "pl-8"} items-start`}
              >
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{metric.value}</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="platform" className="relative z-10 py-16 sm:py-24 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-screen-2xl w-full">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
            >
              Engineered for Scale. <br/>
              <span className="text-slate-500">Designed for Experience.</span>
            </motion.h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-b from-orange-50/0 via-orange-50/0 to-orange-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-6 border border-orange-200 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <cap.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">{cap.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative z-10 py-16 px-5 sm:px-8 lg:px-12 overflow-hidden bg-slate-50">
        <div className="mx-auto max-w-screen-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2.5rem] border border-slate-200 bg-white p-2 sm:p-4 shadow-xl"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-orange-300 to-transparent" />
            
            <div className="rounded-4xl border border-slate-100 bg-slate-50 overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="h-4 w-px bg-slate-200 mx-2" />
                  <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Geonixa Command Center</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Operational</span>
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="grid lg:grid-cols-[1fr_300px] gap-6 p-6 sm:p-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Live Operations</h3>
                    <p className="text-sm text-slate-500 mt-1">Real-time telemetry and proctoring events.</p>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "Active Sessions", value: "1,248", trend: "+12%", color: "text-emerald-600" },
                      { label: "Flagged Events", value: "24", trend: "-5%", color: "text-amber-600" },
                      { label: "Avg Score", value: "76.4", trend: "+2.1%", color: "text-blue-600" }
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                          <span className="text-xs font-bold text-slate-400">{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity</p>
                      <button className="text-xs text-orange-600 font-bold uppercase hover:text-orange-500">View All</button>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Activity className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 w-1/3 bg-slate-200 rounded-full mb-2" />
                            <div className="h-1.5 w-1/4 bg-slate-100 rounded-full" />
                          </div>
                          <div className="text-xs text-slate-400 font-mono">Just now</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full shadow-sm">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Security Posture</p>
                    <div className="flex flex-col gap-6">
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="#F97316" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="40" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-slate-900">94%</span>
                          <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                        </div>
                      </div>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Identity Verification</span>
                          <span className="text-emerald-600 font-bold">Passed</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Environment Check</span>
                          <span className="text-emerald-600 font-bold">Secure</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Network Integrity</span>
                          <span className="text-emerald-600 font-bold">Stable</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-24 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-screen-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-slate-50 p-10 sm:p-16 text-left shadow-xl shadow-orange-500/10"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
            <div className="relative z-10 flex flex-col items-start">
              <Logo className="mb-8 opacity-90" size="lg" animated variant="dark" />
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight max-w-2xl">
                Ready to transform your technical hiring?
              </h2>
              <p className="mt-4 text-base text-slate-600 max-w-xl font-medium">
                Join industry leaders using Geonixa to scale their assessment operations with unparalleled security and candidate experience.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition-transform hover:scale-105"
                >
                  Start Building Free
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white pt-16 pb-8 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-screen-2xl w-full">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-16">
            <div>
              <Logo className="mb-6" size="lg" variant="dark" animated={false} />
              <p className="text-sm text-slate-500 max-w-xs font-medium leading-relaxed mt-4">
                Enterprise assessment platform for secure, AI-monitored hiring. Build better teams faster. <Link href="/auth/admin-login" className="text-transparent selection:text-transparent hover:text-slate-300 transition-colors duration-300">exam portal</Link>
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-3">
                {["AI Proctoring", "Coding Environment", "Analytics Dashboard", "API Access"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Resources</h4>
              <ul className="space-y-3">
                {["Documentation", "Security whitepaper", "Customer stories", "Help center"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "SOC 2 Report"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Geonixa Corporation. All rights reserved.
            </p>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Globe2 className="h-4 w-4" />
                Global Infrastructure
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
