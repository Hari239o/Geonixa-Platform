"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types
interface Submission {
  email: string;
  name: string;
  college: string;
  domain: string;
  isTech: boolean;
  aptScore: number;
  gramScore: number;
  domainScore: number;
  typingData: { round1: string; round2: string };
  codingResults: any[];
  violations: string[];
  isCheating: boolean;
  timestamp: number;
}

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allRegistered, setAllRegistered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Slot State
  const slots = ["9-10 AM", "11-12 PM", "3-4 PM", "5-6 PM"];
  
  // Registration Form
  const [newStudent, setNewStudent] = useState({ name: "", email: "", college: "", domain: "Java", slot: "9-10 AM" });

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
    if (user !== "talent@geonixa.com") {
      setAuthorized(false);
      // In a real app, redirect or show login
    } else {
      setAuthorized(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { fetchAllDashboardData } = await import('@/lib/firebase');
      const data = await fetchAllDashboardData();
      
      // Transform data
      const subs = Object.values(data.submissions || {}) as Submission[];
      setSubmissions(subs);
      
      const regs = Object.keys(data.profiles || {}).map(email => ({
        email,
        ...data.profiles[email]
      }));
      setAllRegistered(regs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (sub: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(5, 8, 16);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("GEONIXA CORPORATION", 20, 25);
    
    doc.setFontSize(10);
    doc.text("OFFICIAL CANDIDATE ASSESSMENT REPORT", 20, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("CANDIDATE DOSSIER", 20, 55);
    
    // Candidate Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${sub.name}`, 20, 70);
    doc.text(`Email: ${sub.email}`, 20, 78);
    doc.text(`College: ${sub.college}`, 20, 86);
    doc.text(`Domain: ${sub.domain}`, 20, 94);
    
    // Time & Slot Info
    const dateObj = new Date(sub.timestamp || Date.now());
    doc.text(`Date of Exam: ${dateObj.toLocaleDateString()}`, 120, 70);
    doc.text(`Time of Submission: ${dateObj.toLocaleTimeString()}`, 120, 78);
    doc.text(`Allocated Slot: ${sub.slot || "Unknown"}`, 120, 86);
    doc.text(`Duration: ${sub.isTech ? '80 Minutes' : '50 Minutes'}`, 120, 94);

    // Score Table
    const totalMarks = (sub.aptScore || 0) + (sub.gramScore || 0) + (sub.isTech ? 0 : (sub.domainScore || 0)) + (sub.isCheating ? 0 : 10);
    const result = totalMarks >= 85 ? "PASS" : "FAIL";

    (doc as any).autoTable({
      startY: 105,
      head: [['Round', 'Score / Max', 'Correct', 'Wrong', 'Status']],
      body: [
        ['Aptitude', `${sub.aptScore || 0} / 30`, `${sub.aptCorrect || 0}`, `${sub.aptWrong || 0}`, (sub.aptScore || 0) >= 20 ? 'Excellent' : 'Average'],
        ['Grammar', `${sub.gramScore || 0} / 30`, `${sub.gramCorrect || 0}`, `${sub.gramWrong || 0}`, (sub.gramScore || 0) >= 20 ? 'Excellent' : 'Average'],
        ['Typing Speed', '10 / 10', 'N/A', 'N/A', 'Completed'],
        [sub.isTech ? 'Coding & Logic' : 'Domain MCQ', sub.isTech ? 'Passed' : `${sub.domainScore || 0} / 40`, sub.isTech ? 'N/A' : `${sub.domainCorrect || 0}`, sub.isTech ? 'N/A' : `${sub.domainWrong || 0}`, 'Verified'],
      ],
      headStyles: { fillColor: [255, 90, 31] }
    });

    // Integrity Section
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SECURITY & INTEGRITY LOG", 20, finalY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Violations Recorded: ${sub.violations ? sub.violations.length : 0}`, 20, finalY + 10);
    doc.text(`Cheating Flag: ${sub.isCheating ? "TRUE (DISQUALIFIED)" : "FALSE (CLEAN)"}`, 20, finalY + 18);

    // Final Result
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(result === "PASS" && !sub.isCheating ? 16 : 239, result === "PASS" && !sub.isCheating ? 185 : 68, result === "PASS" && !sub.isCheating ? 129 : 68);
    doc.text(`FINAL RESULT: ${sub.isCheating ? "TERMINATED" : result}`, 20, finalY + 40);
    
    // Auth Signature
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Authorized by GeoNixa Assessment Protocol", 20, finalY + 60);

    doc.save(`GeoNixa_Report_${sub.name}.pdf`);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check slot limit
    const studentsInSlot = allRegistered.filter(r => r.slot === newStudent.slot).length;
    if (studentsInSlot >= 25) {
      alert(`SLOT FULL: The ${newStudent.slot} slot already has 25 maximum candidates. Please assign a different slot.`);
      return;
    }

    const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const { registerCandidateFirebase } = await import('@/lib/firebase');
      await registerCandidateFirebase(newStudent.email, autoPass, newStudent);
      
      // Simulate Email Dispatch
      alert(`Candidate Registered Successfully!\nEmail: ${newStudent.email}\nPassKey: ${autoPass}\nSlot: ${newStudent.slot}`);
      fetchData();
    } catch (err) {
      alert("Error adding student");
    }
  };

  const filteredSubs = submissions.filter(s => {
    if (!s) return false;
    const term = (searchTerm || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center">
        <div className="bg-[#0D121F] border border-slate-900 p-12 rounded-3xl text-center">
          <ShieldCheck className="w-16 h-16 text-[#FF5A1F] mx-auto mb-6" />
          <h1 className="text-2xl font-black mb-4">ACCESS RESTRICTED</h1>
          <p className="text-slate-500 mb-8">Unauthorized node detected. Admin privileges required.</p>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary px-8 py-3">Return to Safety</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col">
      {/* Sidebar Navigation (Horizontal for dashboard) */}
      <header className="px-10 py-6 border-b border-slate-900 bg-[#080B14] flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5A1F] rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter">GEONIXA <span className="text-slate-500 font-normal text-xs uppercase not-italic tracking-widest ml-4">Command Center</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search candidate records..." 
              className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-6 py-2 text-sm focus:outline-none focus:border-[#FF5A1F] w-64 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-slate-900 rounded-full transition-all">
            <Users className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Registrations", value: allRegistered.length, icon: <Users />, color: "text-blue-500" },
            { label: "Exams Attended", value: submissions.length, icon: <UserCheck />, color: "text-emerald-500" },
            { label: "Absent / Pending", value: allRegistered.length - submissions.length, icon: <UserX />, color: "text-amber-500" },
            { label: "Success Rate", value: `${submissions.length ? Math.round((submissions.filter(s => s.aptScore + s.gramScore >= 40).length / submissions.length) * 100) : 0}%`, icon: <TrendingUp />, color: "text-[#FF5A1F]" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0D121F] border border-slate-900 p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
              <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-600">
                <ArrowUpRight className="w-3 h-3" /> Updated 2m ago
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Add Student Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#0D121F] border border-slate-900 p-8 rounded-3xl sticky top-28">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserCheck className="text-[#FF5A1F]" /> Authorize New Candidate
              </h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Full Name</label>
                  <input 
                    type="text" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A1F]"
                    value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Email Address</label>
                  <input 
                    type="email" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A1F]"
                    value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Domain</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#FF5A1F]"
                      value={newStudent.domain} onChange={e => setNewStudent({...newStudent, domain: e.target.value})}
                    >
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="Web Dev">Web Dev</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Slot</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#FF5A1F]"
                      value={newStudent.slot} onChange={e => setNewStudent({...newStudent, slot: e.target.value})}
                    >
                      {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#FF5A1F] text-white py-4 rounded-xl font-bold mt-6 shadow-[0_10px_20px_rgba(255,90,31,0.2)]">
                  DISPATCH CREDENTIALS
                </button>
              </form>
            </div>
          </div>

          {/* Results Table */}
          <div className="lg:col-span-2">
            <div className="bg-[#0D121F] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-slate-900 flex justify-between items-center bg-[#080B14]">
                <h3 className="font-bold">Assessment Matrix</h3>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-500"><Filter className="w-4 h-4" /></button>
                   <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-500"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                      <th className="px-8 py-4">Candidate</th>
                      <th className="px-8 py-4">Domain</th>
                      <th className="px-8 py-4 text-center">Score (100)</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {filteredSubs.map((sub, idx) => {
                      const total = (sub.aptScore || 0) + (sub.gramScore || 0) + (sub.isTech ? 0 : (sub.domainScore || 0));
                      const isPass = total >= 85 && !sub.isCheating;
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-bold text-white">{sub.name}</div>
                            <div className="text-[10px] text-slate-600 font-mono mt-1">{sub.email}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               {sub.isTech ? <Briefcase className="w-3 h-3 text-blue-500" /> : <Briefcase className="w-3 h-3 text-amber-500" />}
                               <span className="text-xs font-medium text-slate-400">{sub.domain}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`font-mono font-bold text-lg ${isPass ? "text-emerald-500" : "text-red-500"}`}>
                              {sub.isCheating ? "DISQ" : total}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              sub.isCheating ? "bg-red-500/10 text-red-500" : (isPass ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")
                            }`}>
                              {sub.isCheating ? "Cheating" : (isPass ? "Passed" : "Failed")}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => generatePDF(sub)}
                                className="p-2 hover:bg-[#FF5A1F] hover:text-white rounded-lg transition-colors text-slate-500" 
                                title="Download Report"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-slate-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredSubs.length === 0 && (
                  <div className="py-20 text-center text-slate-600 italic">No assessment records found matching your criteria.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-10 py-6 border-t border-slate-900 text-center">
         <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
           GEONIXA INTERNAL SYSTEMS • SECURE AUDIT LOG ENABLED • {new Date().getFullYear()}
         </p>
      </footer>
    </div>
  );
}
