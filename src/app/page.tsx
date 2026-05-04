"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Code, 
  Terminal, 
  Globe, 
  Database, 
  BarChart3, 
  Cpu, 
  PenTool, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Binary, 
  Settings,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  Microscope
} from "lucide-react";

const domains = [
  { name: "Java", icon: <Code className="w-6 h-6" />, type: "TECH" },
  { name: "Python", icon: <Terminal className="w-6 h-6" />, type: "TECH" },
  { name: "Web Dev", icon: <Globe className="w-6 h-6" />, type: "TECH" },
  { name: "Data Science", icon: <Database className="w-6 h-6" />, type: "TECH" },
  { name: "Data Analytics", icon: <BarChart3 className="w-6 h-6" />, type: "TECH" },
  { name: "VLSI", icon: <Cpu className="w-6 h-6" />, type: "NON-TECH" },
  { name: "AutoCAD", icon: <PenTool className="w-6 h-6" />, type: "NON-TECH" },
  { name: "Embedded", icon: <Binary className="w-6 h-6" />, type: "NON-TECH" },
  { name: "EV", icon: <Zap className="w-6 h-6" />, type: "NON-TECH" },
  { name: "Civil", icon: <Layers className="w-6 h-6" />, type: "NON-TECH" },
  { name: "ECE", icon: <Microscope className="w-6 h-6" />, type: "NON-TECH" },
  { name: "EEE", icon: <Settings className="w-6 h-6" />, type: "NON-TECH" },
];

const features = [
  {
    title: "AI Monitoring",
    desc: "Real-time biometric tracking, face detection, and eye-movement analysis ensure 100% integrity.",
    icon: <Eye className="text-[#FF5A1F] w-8 h-8" />
  },
  {
    title: "Secure Exams",
    desc: "Anti-cheat environment with tab-switch locking, screen-snip blocking, and cryptographically secure sessions.",
    icon: <Lock className="text-[#FF5A1F] w-8 h-8" />
  },
  {
    title: "Real-time Evaluation",
    desc: "Instant assessment of coding logic, aptitude deductions, and grammar proficiency with automated reporting.",
    icon: <ShieldCheck className="text-[#FF5A1F] w-8 h-8" />
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050810] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#FF5A1F] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,90,31,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter">GEONIXA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="#domains" className="hover:text-white transition-colors">Domains</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/auth/login" className="px-5 py-2 border border-slate-800 rounded-full hover:bg-slate-900 transition-all">Login</Link>
          <Link href="/auth/register" className="px-5 py-2 bg-[#FF5A1F] text-white rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,90,31,0.2)]">Start Assessment</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-32 max-w-7xl mx-auto w-full">
        <div className="absolute top-0 right-0 -z-10 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FF5A1F] rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-[#FF5A1F] text-xs font-bold border border-orange-500/20 mb-6 uppercase tracking-widest">
              Enterprise Grade Proctoring
            </span>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8">
              GeoNixa AI <br />
              <span className="text-[#FF5A1F]">Recruitment</span> Platform
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
              Secure AI Proctored Assessments for the next generation of engineers. 
              Enterprise-level architecture designed for high-integrity hiring pipelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="btn btn-primary px-10 py-4 text-lg font-bold group">
                Start Assessment <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/login" className="btn btn-outline px-10 py-4 text-lg font-bold">
                Candidate Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Domains Section */}
      <section id="domains" className="px-8 py-24 bg-[#080B14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Assessment Domains</h2>
            <p className="text-slate-500">Industry-specific evaluation tracks for Tech and Non-Tech roles.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {domains.map((domain, i) => (
              <motion.div 
                key={domain.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-6 bg-[#0D121F] border border-slate-900 rounded-2xl hover:border-[#FF5A1F]/50 transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-[#FF5A1F] transition-colors">
                  {domain.icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{domain.name}</h3>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{domain.type}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-32 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-10 bg-[#0D121F] border border-slate-900 rounded-3xl group"
            >
              <div className="mb-6 p-4 bg-orange-500/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-8 py-20 bg-[#050810] border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[#FF5A1F] rounded flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                </svg>
              </div>
              <span className="text-xl font-black">GEONIXA</span>
            </div>
            <p className="text-slate-500 max-w-xs mb-8">
              Standardizing integrity in corporate recruitment through advanced AI proctoring and behavioral forensics.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#FF5A1F] transition-colors cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#FF5A1F] transition-colors cursor-pointer">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Platform</h4>
            <ul className="flex flex-col gap-4 text-slate-500 text-sm">
              <li><Link href="#domains" className="hover:text-white transition-colors">Assessment Domains</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">AI Proctoring</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Start Session</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Enterprise Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Compliance</h4>
            <ul className="flex flex-col gap-4 text-slate-500 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> GDPR Compliant</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> SOC2 Certified</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" /> ISO 27001</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs uppercase tracking-widest font-bold">
          © 2026 GEONIXA CORPORATE INTELLIGENCE. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
