"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
  X,
  Keyboard,
  Eye,
  Shield,
  CheckCircle2,
  Settings,
  Globe,
  RotateCcw,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

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
  r3Score?: number;
  totalScore?: number;
  roundScores?: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
  };
  r1Details?: any[];
  r2Details?: any[];
  r3Details?: {
    topic1: string;
    text1: string;
    lines1: number;
    topic2: string;
    text2: string;
    lines2: number;
  };
  r4Details?: any[];
  typingData?: { round1: string; round2: string };
  codingResults?: any[];
  violations: string[];
  isCheating: boolean;
  securityMeta?: {
    totalViolations: number;
    tabSwitches: number;
    aiProbability: number;
    suspicionScore: number;
    humanConfidence?: number;
  };
  roundDurations?: Record<number, number>;
  timestamp: string | number;
  slot?: string;
  day?: string;
}

// Helper Component for Live Preview
const LiveFrameView = ({ email }: { email: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const { storage } = await import("@/lib/firebase");
        const { ref, getDownloadURL } = await import("firebase/storage");
        const path = `live_frames/${email}.jpg`;
        const downloadUrl = await getDownloadURL(ref(storage, path));
        setUrl(`${downloadUrl}?t=${Date.now()}`); // Cache bust
      } catch (e) {
        setUrl(null);
      }
    };
    fetchUrl();
    const interval = setInterval(fetchUrl, 15000); // Sync with upload frequency
    return () => clearInterval(interval);
  }, [email]);

  return url ? (
    <img src={url} alt="Live" className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <Eye className="w-4 h-4 text-slate-700" />
    </div>
  );
};

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [allRegistered, setAllRegistered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'submissions' | 'registered' | 'live' | 'audit' | 'communications' | 'merit_list'>('merit_list');
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  
  // Configuration
  const slots = ["10:00 AM - 11:30 AM", "12:00 PM - 01:30 PM", "03:00 PM - 04:30 PM", "06:00 PM - 07:30 PM"];
  const domains = [
    "Java", "Python", "Web Development", "Data Science", "Data Analytics",
    "AI & Machine Learning", "VLSI Design", "AutoCAD", "Electric Vehicles", 
    "Embedded Systems", "Computer Science", "Electrical & Electronics", 
    "Electronics & Comm", "Civil Engineering", "Cybersecurity", "Cloud Computing"
  ];
  
  // Registration Form
  const [newStudent, setNewStudent] = useState({ 
    name: "", 
    email: "", 
    college: "", 
    domain: "Java", 
    slot: "10:00 AM - 11:30 AM", 
    day: new Date().toISOString().split('T')[0] 
  });

  const [domainFilter, setDomainFilter] = useState("All Domains");

  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
    if (user !== "talent@geonixa.com") {
      setAuthorized(false);
      return;
    }
    
    setAuthorized(true);
    
    let unsubSlots = () => {};
    let unsubSubs = () => {};
    let unsubProfs = () => {};
    let unsubEmail = () => {};

    const setupRealtimeListeners = async () => {
      setLoading(true);
      try {
        const { db, isFirebaseConfigured, fetchAllDashboardData, getSlotAvailability } = await import("@/lib/firebase");
        
        if (!isFirebaseConfigured) {
          // Fallback static load for local/dummy mode
          const data = await fetchAllDashboardData();
          setSlotAvailability(await getSlotAvailability());
          const subs = (Object.values(data.submissions || {}) as Submission[]).filter(s => s.email !== "talent@geonixa.com");
          setSubmissions(subs);
          const regs = Object.keys(data.profiles || {}).filter(email => email !== "talent@geonixa.com").map(email => ({ email, ...data.profiles[email] }));
          setAllRegistered(regs);
          setLoading(false);
          return;
        }

        const { collection, onSnapshot, doc, query, orderBy, limit } = await import("firebase/firestore");

        // 1. Slots Realtime Stream
        unsubSlots = onSnapshot(doc(db, "meta", "slots"), (docSnap) => {
          if (docSnap.exists()) {
            setSlotAvailability(docSnap.data() as Record<string, number>);
          }
        });

        // Run a one-time repair on mount to fix any \"zombie\" slots
        import('@/lib/firebase').then(m => m.recalibrateSlotCapacities());

        // 2. Profiles Realtime Stream
        unsubProfs = onSnapshot(collection(db, "student_profiles"), (snap) => {
          const regs: any[] = [];
          snap.forEach(d => {
            if (d.id !== "talent@geonixa.com") {
              regs.push({ email: d.id, ...d.data() });
            }
          });
          setAllRegistered(regs);
          setLoading(false); // Can stop loading after main profiles load
        });

        // 3. Submissions Realtime Stream
        unsubSubs = onSnapshot(collection(db, "exam_submissions"), (snap) => {
          const subs: Submission[] = [];
          snap.forEach(d => {
            if (d.id !== "talent@geonixa.com") {
              subs.push({ email: d.id, ...d.data() } as Submission);
            }
          });
          setSubmissions(subs);
        });

        // 4. Email Logs Realtime Stream
        const q = query(collection(db, "email_logs"), orderBy("timestamp", "desc"), limit(100));
        unsubEmail = onSnapshot(q, (snap) => {
          const logs: any[] = [];
          snap.forEach(d => logs.push({ id: d.id, ...d.data() }));
          setEmailLogs(logs);
        });

      } catch (err) {
        console.error("Realtime setup failed:", err);
        setLoading(false);
      }
    };

    setupRealtimeListeners();

    // Cleanup listeners on unmount
    return () => {
      unsubSlots();
      unsubSubs();
      unsubProfs();
      unsubEmail();
    };
  }, []);

  // Manual trigger for visual feedback or local mock refresh
  const fetchData = async () => {
    setLoading(true);
    try {
      const { isFirebaseConfigured, fetchAllDashboardData, getSlotAvailability } = await import('@/lib/firebase');
      if (!isFirebaseConfigured) {
        const data = await fetchAllDashboardData();
        setSlotAvailability(await getSlotAvailability());
        const subs = (Object.values(data.submissions || {}) as Submission[]).filter(s => s.email !== "talent@geonixa.com");
        setSubmissions(subs);
        const regs = Object.keys(data.profiles || {}).filter(email => email !== "talent@geonixa.com").map(email => ({ email, ...data.profiles[email] }));
        setAllRegistered(regs);
      }
      setTimeout(() => setLoading(false), 600);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleForceSubmit = async (email: string) => {
    if (!confirm(`Emergency: Force termination for ${email}?`)) return;
    try {
       const { db } = await import("@/lib/firebase");
       const { updateDoc, doc } = await import("firebase/firestore");
       await updateDoc(doc(db, "student_profiles", email), { 
         examStatus: "TERMINATED_BY_ADMIN" 
       });
       alert("Termination command dispatched.");
       fetchData();
    } catch (err) { alert("Command failed"); }
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
    const totalMarks = (sub.aptScore || 0) + (sub.gramScore || 0) + (sub.domainScore || 0) + (sub.r3Score || 0);
    const finalPass = totalMarks >= 85 && !sub.isCheating;
    const resultStatus = sub.isCheating ? "TERMINATED" : (finalPass ? "QUALIFIED" : "DISQUALIFIED");

    autoTable(doc, {
      startY: 105,
      head: [['Assessment Round', 'Analytical Performance', 'Correct', 'Errors', 'Evaluation']],
      body: [
        ['Round 1: Aptitude & Logic', `${sub.aptScore || 0} / 15`, `${sub.aptCorrect || 0}`, `${sub.aptWrong || 0}`, (sub.aptScore || 0) >= 12 ? 'EXCEPTIONAL' : 'COMPETENT'],
        ['Round 2: Grammar & Verbal', `${sub.gramScore || 0} / 15`, `${sub.gramCorrect || 0}`, `${sub.gramWrong || 0}`, (sub.gramScore || 0) >= 12 ? 'EXCEPTIONAL' : 'COMPETENT'],
        ['Round 3: Typing Diagnostics', `${sub.r3Score || 0} / 10`, 'N/A', 'N/A', (sub.r3Score || 0) === 10 ? 'VALIDATED' : 'INCOMPLETE'],
        [sub.isTech ? 'Round 4: Coding & Logic' : 'Round 4: Technical MCQ', `${sub.domainScore || 0} / 60`, sub.isTech ? 'N/A' : `${sub.domainCorrect || 0}`, sub.isTech ? 'N/A' : `${sub.domainWrong || 0}`, 'VERIFIED'],
      ],
      headStyles: { fillColor: [5, 8, 16], textColor: [255, 90, 31], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // Integrity & Security Log
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFillColor(245, 247, 250);
    doc.rect(20, finalY - 5, 170, 30, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("INTEGRITY & PROCTORING AUDIT", 25, finalY + 5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`AI Violations: ${sub.violations ? sub.violations.length : 0}`, 25, finalY + 12);
    doc.text(`Neural Status: ${sub.isCheating ? "COMPROMISED (CHEATING DETECTED)" : "IDENTITY VERIFIED (CLEAN FEED)"}`, 25, finalY + 18);

    // Final Determination
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(finalPass ? 16 : 239, finalPass ? 185 : 68, finalPass ? 129 : 68);
    doc.text(`${resultStatus}`, 20, finalY + 55);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`CUMULATIVE SCORE: ${totalMarks} / 100`, 20, finalY + 63);
    doc.text(`(QUALIFICATION THRESHOLD: 85%)`, 20, finalY + 69);
    
    // Auth Section
    doc.setDrawColor(226, 232, 240);
    doc.line(20, finalY + 80, 190, finalY + 80);
    doc.setFontSize(8);
    doc.text("GEONIXA CORPORATE ASSESSMENT PROTOCOL v2.4", 20, finalY + 88);
    doc.text("THIS IS AN ELECTRONICALLY GENERATED REPORT. NO SIGNATURE REQUIRED.", 20, finalY + 93);

    doc.save(`GEONIXA_DOSSIER_${sub.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleDeleteStudent = async (email: string) => {
    if (!confirm(`Are you sure you want to delete records for ${email}? This action cannot be undone.`)) return;
    
    try {
      const { deleteCandidateFirebase } = await import('@/lib/firebase');
      await deleteCandidateFirebase(email);
      
      // Force clean local state first
      setAllRegistered(prev => prev.filter(p => p.email !== email));
      setSubmissions(prev => prev.filter(s => s.email !== email));
      
      // Double check purge with a re-fetch
      await fetchData();
      
      alert("Candidate records purged successfully from secure database.");
    } catch (err) {
      console.error("Purge Error:", err);
      alert("FATAL_ERROR: Secure record purge failed. Verify database connectivity.");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const originalStudent = allRegistered.find(s => s.email === editingStudent.email);
      const { registerCandidateFirebase, updateSlotTransferTransaction } = await import('@/lib/firebase');
      
      // If the admin changed the slot, perform a capacity transfer transaction
      if (originalStudent && originalStudent.slot !== editingStudent.slot) {
         try {
           await updateSlotTransferTransaction(originalStudent.slot, editingStudent.slot);
         } catch (transferErr: any) {
           if (transferErr.message === "NEW_SLOT_FULL") {
             alert("Cannot transfer candidate: The new slot is completely full (25/25).");
             return;
           }
           throw transferErr;
         }
      }
      
      // Update profile data
      await registerCandidateFirebase(editingStudent.email, editingStudent.passKey || "RESTORED", editingStudent);
      alert("Candidate profile and slot allocations updated successfully.");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Update failed. Verify database connection.");
    }
  };

  const handleSendResult = async (email: string, name: string, status: "SELECTED" | "REJECTED" | "INTERVIEW") => {
    if (!confirm(`Are you sure you want to send a ${status} notification to ${name}?`)) return;
    
    setIsSendingEmail(email);
    try {
      const res = await fetch('/api/communication/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "RESULT",
          candidateEmail: email,
          candidateName: name,
          status: status
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${status} email dispatched successfully.`);
        fetchData();
      } else {
        alert(`Dispatch failed: ${data.error}`);
      }
    } catch (e) {
      alert("Communication error occurred.");
    } finally {
      setIsSendingEmail(null);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentEmail = newStudent.email.trim().toLowerCase();
    if (!studentEmail || !newStudent.name.trim()) {
      alert("VALIDATION_ERROR: Candidate Name and Email are mandatory.");
      return;
    }

    try {
      const { getCandidateProfile, allocateSlotWithTransaction } = await import('@/lib/firebase');
      
      // --- DUPLICATE CHECK ---
      const existing = await getCandidateProfile(studentEmail);
      if (existing) {
        alert("CANDIDATE_EXISTS: This email is already authorized in the system.");
        return;
      }

      const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Map label to internal SLOT ID for correct transaction tracking
      const slotMap: Record<string, string> = {
        "10:00 AM - 11:30 AM": "SLOT_1",
        "12:00 PM - 01:30 PM": "SLOT_2",
        "03:00 PM - 04:30 PM": "SLOT_3",
        "06:00 PM - 07:30 PM": "SLOT_4"
      };
      const internalSlotId = slotMap[newStudent.slot] || "SLOT_1";
      
      // Use Transaction to decrement slot capacity and register the candidate safely
      await allocateSlotWithTransaction(
        internalSlotId, 
        studentEmail, 
        {
          ...newStudent,
          email: studentEmail,
          name: newStudent.name.trim(),
          registeredAt: new Date().toISOString()
        }, 
        autoPass
      );
      
      // Call Email API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: studentEmail, 
          password: autoPass, 
          name: newStudent.name.trim(), 
          college: newStudent.college, 
          domain: newStudent.domain,
          slot: newStudent.slot,
          day: newStudent.day
        })
      });

      const emailData = await res.json();
      
      if (!emailData.success) {
        alert(emailData.error);
        return;
      }

      alert(`Candidate Registered Successfully!\nEmail: ${newStudent.email}\nPassKey: ${autoPass}\nSlot: ${newStudent.slot}\nDay: ${newStudent.day}\n\nOfficial email dispatched.`);
      
      fetchData();
      setActiveTab('registered');
      setNewStudent({ name: "", email: "", college: "", domain: "Java", slot: "10:00 AM - 11:30 AM", day: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert("Error adding student");
    }
  };

  const filteredSubs = submissions.filter(s => {
    if (!s) return false;
    const term = (searchTerm || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesDomain = domainFilter === "All Domains" || s.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const filteredRegs = allRegistered.filter(r => {
    if (!r) return false;
    const term = (searchTerm || "").toLowerCase();
    const name = (r.name || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesDomain = domainFilter === "All Domains" || r.domain === domainFilter;
    return matchesSearch && matchesDomain;
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
      <header className="px-6 md:px-10 py-4 md:py-6 border-b border-slate-900 bg-[#080B14] flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/images/geonixa-logo.svg" alt="Geonixa Logo" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Server: Operational</span>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Omni-search candidates..." 
              className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-6 py-2 text-sm focus:outline-none focus:border-[#FF5A1F] w-48 lg:w-64 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-slate-900 rounded-full transition-all">
            <RotateCcw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Operational Intelligence Header */}
        <div className="mb-12 grid lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0D121F] border border-slate-900 rounded-[40px] p-8 lg:col-span-2 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Live Slot Capacity</h3>
                  <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Real-time Seat Monitoring</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      if (!confirm("System Audit: Recalibrate live slot counters based on actual student profiles?")) return;
                      const { recalibrateSlotCapacities } = await import('@/lib/firebase');
                      await recalibrateSlotCapacities();
                      alert("Slot capacities successfully recalibrated with database state.");
                    }}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 transition-colors"
                    title="Recalibrate Counters"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <Globe className="w-4 h-4 text-[#FF5A1F] animate-pulse" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["SLOT_1", "SLOT_2", "SLOT_3", "SLOT_4"].map((id) => {
                  const { SLOT_CONFIG } = require('@/lib/firebase');
                  const config = (SLOT_CONFIG as any)[id];
                  const count = slotAvailability[id] || 0;
                  const remaining = 25 - count;
                  const isFull = remaining <= 0;
                  
                  return (
                    <div key={id} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-900/50">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black text-white">{config.label}</span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isFull ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {remaining} / 25 LEFT
                         </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-[#FF5A1F]'}`} 
                          style={{ width: `${(count / 25) * 100}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Operational Intelligence Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Registrations", value: allRegistered.length, icon: <Users />, color: "text-blue-500", bg: "bg-blue-500/5" },
            { label: "Active Sessions", value: allRegistered.filter(r => r.examStatus === "ACTIVE").length, icon: <Globe />, color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { label: "Suspicious Alerts", value: submissions.filter(s => s.violations?.length > 3).length, icon: <Shield />, color: "text-red-500", bg: "bg-red-500/5" },
            { label: "Qualified (85%+)", value: submissions.filter(s => {
              const total = (s.aptScore || 0) + (s.gramScore || 0) + (s.domainScore || 0) + (s.r3Score || 0);
              return total >= 85 && !s.isCheating;
            }).length, icon: <TrendingUp />, color: "text-[#FF5A1F]", bg: "bg-orange-500/5" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-[#0D121F] border border-slate-900 p-8 rounded-[35px] relative overflow-hidden group hover:border-slate-700 transition-all cursor-default ${stat.bg}`}
            >
              <div className={`absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-all ${stat.color} scale-150`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">{stat.label}</p>
              <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
              <div className="mt-4 flex items-center gap-1.5">
                 <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(dot => <div key={dot} className={`w-1 h-1 rounded-full ${stat.color} opacity-20`} />)}
                 </div>
                 <span className="text-[8px] font-bold text-slate-700 uppercase">System Telemetry</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Add Student Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#0D121F] border border-slate-900 p-8 rounded-3xl sticky top-28">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="text-[#FF5A1F]" /> Candidate Authorization
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold">Secure Credential Provisioning</p>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="studentName" className="text-[10px] font-bold text-slate-600 uppercase">Student Full Name</label>
                  <input 
                    id="studentName"
                    name="studentName"
                    type="text" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A1F] transition-all"
                    value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="studentEmail" className="text-[10px] font-bold text-slate-600 uppercase">Institutional Email</label>
                  <input 
                    id="studentEmail"
                    name="studentEmail"
                    type="email" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A1F] transition-all"
                    value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value.toLowerCase().trim()})}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="studentCollege" className="text-[10px] font-bold text-slate-600 uppercase">College / University</label>
                  <input 
                    id="studentCollege"
                    name="studentCollege"
                    type="text" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A1F] transition-all"
                    value={newStudent.college} onChange={e => setNewStudent({...newStudent, college: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="studentDomain" className="text-[10px] font-bold text-slate-600 uppercase">Registered Course / Domain</label>
                  <select 
                    id="studentDomain"
                    name="studentDomain"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#FF5A1F] transition-all"
                    value={newStudent.domain} onChange={e => setNewStudent({...newStudent, domain: e.target.value})}
                  >
                    {domains.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="examDay" className="text-[10px] font-bold text-slate-600 uppercase">Exam Day</label>
                    <input 
                      id="examDay"
                      name="examDay"
                      type="date" required 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#FF5A1F] transition-all"
                      value={newStudent.day} onChange={e => setNewStudent({...newStudent, day: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="examSlot" className="text-[10px] font-bold text-slate-600 uppercase">Assigned Slot</label>
                    <select 
                      id="examSlot"
                      name="examSlot"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-[#FF5A1F] transition-all"
                      value={newStudent.slot} onChange={e => setNewStudent({...newStudent, slot: e.target.value})}
                    >
                      {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#FF5A1F] text-white py-4 rounded-xl font-bold mt-6 shadow-[0_10px_20px_rgba(255,90,31,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" /> ADMIN CREDENTIALS
                </button>
              </form>

              {/* RECENTLY AUTHORIZED LIST */}
              <div className="mt-10 pt-8 border-t border-slate-900/50">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Recently Authorized</h4>
                <div className="space-y-3">
                  {allRegistered.slice(-5).reverse().map((reg, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-900/50 group">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{reg.name}</p>
                        <p className="text-[9px] text-slate-600 font-mono truncate">{reg.email}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingStudent(reg); setIsEditModalOpen(true); }} className="p-1.5 hover:bg-slate-800 rounded text-slate-500"><Settings className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                  {allRegistered.length === 0 && (
                    <p className="text-[10px] text-slate-700 italic">No recent registrations</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="lg:col-span-2">
            <div className="bg-[#0D121F] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-slate-900 flex justify-between items-center bg-[#080B14]">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('merit_list')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'merit_list' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Merit & Results ({filteredSubs.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('registered')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'registered' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Candidates Data ({allRegistered.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('live')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'live' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Live Monitor ({allRegistered.filter(r => r.examStatus === "ACTIVE").length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('audit')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'audit' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Security Audit
                  </button>
                  <button 
                    onClick={() => setActiveTab('audit')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'audit' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Security Audit
                  </button>
                  <button 
                    onClick={() => setActiveTab('communications')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'communications' ? "border-[#FF5A1F] text-white" : "border-transparent text-slate-500"}`}
                  >
                    Communications
                  </button>
                </div>
                <div className="flex gap-4 items-center">
                   <div className="relative">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                     <select 
                       className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#FF5A1F]"
                       value={domainFilter}
                       onChange={e => setDomainFilter(e.target.value)}
                     >
                       <option value="All Domains">All Domains</option>
                       {domains.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                   </div>
                   <button className="p-2 hover:bg-slate-900 rounded-lg text-slate-500"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {activeTab === 'merit_list' ? (
                    <>
                      <thead>
                        <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                          <th className="px-8 py-4">Candidate</th>
                          <th className="px-8 py-4 text-center">Score Breakdown (R1|R2|R3|R4)</th>
                          <th className="px-8 py-4 text-center">Total Marks</th>
                          <th className="px-8 py-4">Verdict</th>
                          <th className="px-8 py-4 text-right">Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {[...filteredSubs].sort((a,b) => (b.totalScore || 0) - (a.totalScore || 0)).map((sub, idx) => {
                          const total = sub.totalScore || 0;
                          const isPass = total >= 85 && !sub.isCheating;
                          const scores = sub.roundScores || { round1: 0, round2: 0, round3: 0, round4: 0 };
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="font-bold text-white">{sub.name}</div>
                                <div className="text-[10px] text-slate-600 font-mono mt-1">{sub.email}</div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex justify-center gap-1 font-mono text-[10px]">
                                   <span className="text-blue-400">{scores.round1}</span>
                                   <span className="text-slate-700">|</span>
                                   <span className="text-blue-400">{scores.round2}</span>
                                   <span className="text-slate-700">|</span>
                                   <span className="text-blue-400">{scores.round3}</span>
                                   <span className="text-slate-700">|</span>
                                   <span className="text-[#FF5A1F] font-black">{scores.round4}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className={`font-mono font-black text-xl ${isPass ? "text-emerald-500" : "text-red-500"}`}>
                                  {sub.isCheating ? "DISQ" : total}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                  sub.isCheating ? "bg-red-500/10 text-red-500" : (isPass ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")
                                }`}>
                                  {sub.isCheating ? "Security Lock" : (isPass ? "Qualified" : "Disqualified")}
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => { setSelectedSub(sub); setIsDetailModalOpen(true); }}
                                  className="px-4 py-2 bg-slate-900 hover:bg-[#FF5A1F] text-slate-500 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ml-auto"
                                >
                                  <Eye className="w-3 h-3" /> View Audit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  ) : activeTab === 'live' ? (
                    <>
                      <thead>
                        <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                          <th className="px-8 py-4">Active Candidate</th>
                          <th className="px-8 py-4 text-center">Round Status</th>
                          <th className="px-8 py-4 text-center">Security warnings</th>
                          <th className="px-8 py-4">Risk Analytics</th>
                          <th className="px-8 py-4 text-right">Emergency Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {allRegistered.filter(r => r.examStatus === "ACTIVE").map((reg, idx) => {
                          const lastActive = reg.lastActive ? new Date(reg.lastActive) : null;
                          const isIdle = lastActive && (Date.now() - lastActive.getTime() > 60000);
                          const isDisconnected = lastActive && (Date.now() - lastActive.getTime() > 300000);
                          const suspicionScore = (reg.warningCount || 0) * 20 + (reg.tabSwitches || 0) * 10;

                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="relative group/camera">
                                     <div className="w-16 h-12 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
                                        <LiveFrameView email={reg.email} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-1">
                                           <div className={`w-1.5 h-1.5 rounded-full ${isDisconnected ? 'bg-red-500' : isIdle ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                                        </div>
                                     </div>
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-sm">{reg.name}</div>
                                    <div className="text-[10px] text-slate-600 font-mono">{reg.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-black text-[#58a6ff]">ROUND {reg.currentRound || 1}</span>
                                  {reg.roundDurations && (
                                    <span className="text-[8px] text-slate-600 mt-1 font-bold">
                                      {Math.floor((reg.roundDurations[reg.currentRound] || 0) / 60)}m elapsed
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`font-mono font-bold text-lg ${reg.warningCount >= 2 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {reg.warningCount || 0}
                                  </span>
                                  <span className="text-[8px] text-slate-700 font-black uppercase">Warnings</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-black uppercase ${suspicionScore > 40 ? 'text-red-500' : suspicionScore > 10 ? 'text-orange-500' : 'text-slate-500'}`}>
                                    Risk: {suspicionScore}%
                                  </span>
                                  <span className="text-[9px] text-slate-600 truncate max-w-[150px]" title={reg.lastViolation}>
                                    {reg.lastViolation || 'Clean Session'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => handleForceSubmit(reg.email)}
                                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase rounded-xl transition-all border border-red-500/20"
                                >
                                  FORCE TERMINATE
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {allRegistered.filter(r => r.examStatus === "ACTIVE").length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-20 text-center text-slate-700 text-xs font-bold uppercase tracking-widest italic">
                               No active sessions detected at this time
                             </td>
                           </tr>
                        )}
                      </tbody>
                    </>
                  ) : activeTab === 'communications' ? (
                    <>
                      <thead>
                        <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                          <th className="px-8 py-4">Dispatch Time</th>
                          <th className="px-8 py-4">Recipient</th>
                          <th className="px-8 py-4">Type</th>
                          <th className="px-8 py-4">Status</th>
                          <th className="px-8 py-4 text-right">Analytics</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {emailLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-8 py-4">
                               <div className="text-[10px] font-mono text-slate-500">
                                 {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'PENDING...'}
                               </div>
                               {log.attempts > 1 && (
                                 <div className="text-[8px] text-orange-500 font-bold uppercase mt-1 flex items-center gap-1">
                                   <RotateCcw className="w-2 h-2" /> Attempt #{log.attempts}
                                 </div>
                               )}
                            </td>
                            <td className="px-8 py-4">
                               <div className="text-xs font-bold text-white">{log.candidateEmail}</div>
                               <div className="text-[9px] text-slate-600 truncate max-w-[150px]">{log.subject}</div>
                            </td>
                            <td className="px-8 py-4">
                               <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-black text-slate-400 uppercase">
                                 {log.type}
                               </span>
                            </td>
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-1.5">
                                 <div className={`w-1.5 h-1.5 rounded-full ${
                                   log.status === 'DELIVERED' ? 'bg-emerald-500' : 
                                   log.status === 'RETRYING' ? 'bg-orange-500 animate-pulse' : 
                                   log.status === 'PENDING' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                                 }`} />
                                 <span className={`text-[10px] font-black uppercase ${
                                   log.status === 'DELIVERED' ? 'text-emerald-500' : 
                                   log.status === 'RETRYING' ? 'text-orange-500' : 
                                   log.status === 'PENDING' ? 'text-blue-500' : 'text-red-500'
                                 }`}>
                                   {log.status}
                                 </span>
                               </div>
                            </td>
                            <td className="px-8 py-4 text-right">
                               <div className="flex flex-col items-end gap-1">
                                 {log.previewUrl && (
                                   <a href={log.previewUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                                     <Eye className="w-3 h-3" /> PREVIEW
                                   </a>
                                 )}
                                 {log.status === 'FAILED' && (
                                   <div className="flex flex-col items-end">
                                      <span className="text-[9px] text-red-400 font-bold uppercase">Critical Failure</span>
                                      <span className="text-[8px] text-red-400/50 italic max-w-[120px] truncate">{log.error}</span>
                                   </div>
                                 )}
                                 {log.status === 'RETRYING' && (
                                   <span className="text-[8px] text-orange-400 italic">Backoff Active...</span>
                                 )}
                               </div>
                            </td>
                          </tr>
                        ))}
                        {emailLogs.length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-20 text-center text-slate-700 text-xs font-bold uppercase tracking-widest italic">
                               Communication archive empty: No dispatches recorded
                             </td>
                           </tr>
                        )}
                      </tbody>
                    </>
                  ) : activeTab === 'audit' ? (
                    <>
                      <thead>
                        <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                          <th className="px-8 py-4">Incident Time</th>
                          <th className="px-8 py-4">Candidate</th>
                          <th className="px-8 py-4">Violation Type</th>
                          <th className="px-8 py-4 text-right">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {submissions.filter(s => s.violations && s.violations.length > 0).map((sub, sIdx) => (
                           sub.violations.map((v: string, vIdx: number) => (
                             <tr key={`${sIdx}-${vIdx}`} className="hover:bg-slate-900/30 transition-colors">
                               <td className="px-8 py-4 text-[10px] font-mono text-slate-500">{v.match(/\[(.*?)\]/)?.[1] || 'N/A'}</td>
                               <td className="px-8 py-4 font-bold text-xs text-white">{sub.name}</td>
                               <td className="px-8 py-4 text-xs text-slate-400">{v.split(':').slice(1).join(':').trim()}</td>
                               <td className="px-8 py-4 text-right">
                                 <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${v.includes('TAB_SWITCH') ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500'}`}>
                                   {v.includes('TAB_SWITCH') ? 'MEDIUM' : 'CRITICAL'}
                                 </span>
                               </td>
                             </tr>
                           ))
                        ))}
                        {submissions.filter(s => s.violations && s.violations.length > 0).length === 0 && (
                           <tr>
                             <td colSpan={4} className="py-20 text-center text-slate-700 text-xs font-bold uppercase tracking-widest italic">
                               Security clean: No integrity violations logged
                             </td>
                           </tr>
                        )}
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead>
                        <tr className="text-[10px] text-slate-600 uppercase tracking-widest border-b border-slate-900 bg-slate-950/30">
                          <th className="px-8 py-4">Candidate</th>
                          <th className="px-8 py-4">College</th>
                          <th className="px-8 py-4">Slot & Day</th>
                          <th className="px-8 py-4">Domain</th>
                          <th className="px-8 py-4 text-center">Status</th>
                          <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {filteredRegs.map((reg, idx) => {
                          const hasSubmitted = submissions.find(s => s.email === reg.email);
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="font-bold text-white">{reg.name}</div>
                                <div className="text-[10px] text-slate-600 font-mono mt-1">{reg.email}</div>
                              </td>
                              <td className="px-8 py-6 text-xs text-slate-400">{reg.college}</td>
                              <td className="px-8 py-6">
                                <div className="text-xs font-bold text-white">{reg.slot}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{reg.day}</div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-xs font-medium text-slate-400">{reg.domain}</span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasSubmitted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                  {hasSubmitted ? 'Completed' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={() => { setEditingStudent(reg); setIsEditModalOpen(true); }}
                                    className="p-2 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-slate-500"
                                    title="Edit Details"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStudent(reg.email)}
                                    className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-slate-500"
                                    title="Purge Identity"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                  )}
                </table>
                {activeTab === 'submissions' && filteredSubs.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-600 italic mb-2">No assessment records found.</p>
                    <p className="text-[10px] text-slate-700 uppercase font-bold tracking-widest">Check "Students Data" for authorized personnel who haven't started yet.</p>
                  </div>
                )}
                {activeTab === 'registered' && allRegistered.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-600 italic">No candidates authorized yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-6 border-t border-slate-900 text-center">
         <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
           GEONIXA INTERNAL SYSTEMS • SECURE AUDIT LOG ENABLED • {new Date().getFullYear()}
         </p>
      </footer>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0D121F] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-black italic">{selectedSub.name}</h2>
                    <p className="text-xs text-slate-500 font-mono">{selectedSub.email} • {selectedSub.domain}</p>
                  </div>
                  <div className={`px-6 py-2 rounded-2xl border ${selectedSub.totalScore >= 85 && !selectedSub.isCheating ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <p className="text-[8px] font-black uppercase tracking-widest mb-0.5">Final Outcome</p>
                    <p className="text-sm font-black uppercase tracking-tighter">
                      {selectedSub.isCheating ? 'DISQUALIFIED (SECURITY)' : (selectedSub.totalScore >= 85 ? 'QUALIFIED FOR NEXT STAGE' : 'DISQUALIFIED (SCORE)')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Aptitude Score</p>
                    <p className="text-3xl font-black text-white">{selectedSub.aptScore} <span className="text-sm text-slate-600">/ 15</span></p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Grammar Score</p>
                    <p className="text-3xl font-black text-white">{selectedSub.gramScore} <span className="text-sm text-slate-600">/ 15</span></p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 bg-gradient-to-br from-slate-950 to-slate-900/50">
                    <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Aggregate Score</p>
                    <p className="text-3xl font-black text-[#FF5A1F]">{selectedSub.totalScore} <span className="text-sm text-slate-600">/ 100</span></p>
                    <div className="mt-3 flex gap-2">
                       <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-900 rounded text-slate-400">R1: {selectedSub.roundScores?.round1 || 0}</span>
                       <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-900 rounded text-slate-400">R2: {selectedSub.roundScores?.round2 || 0}</span>
                       <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-900 rounded text-slate-400">R3: {selectedSub.roundScores?.round3 || 0}</span>
                       <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-900 rounded text-slate-400">R4: {selectedSub.roundScores?.round4 || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><Keyboard className="w-4 h-4" /> Descriptive Round (R3)</h3>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-4">
                      {selectedSub.r3Details ? (
                        <>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Topic 01: {selectedSub.r3Details.topic1}</p>
                            <p className="text-[10px] text-slate-400 font-mono leading-relaxed italic">
                              "{selectedSub.r3Details.text1 || "No content submitted"}"
                            </p>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Topic 02: {selectedSub.r3Details.topic2}</p>
                            <p className="text-[10px] text-slate-400 font-mono leading-relaxed italic">
                              "{selectedSub.r3Details.text2 || "No content submitted"}"
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] text-slate-700 italic">Historical typing data unavailable</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase flex items-center gap-2"><Shield className="w-4 h-4 text-[#FF5A1F]" /> Behavioral Security Audit</h3>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 space-y-6">
                      {selectedSub.securityMeta ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                              <p className="text-[8px] font-black text-red-500 uppercase mb-1">AI Probability</p>
                              <p className="text-2xl font-black text-red-500">{selectedSub.securityMeta.aiProbability}%</p>
                            </div>
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                              <p className="text-[8px] font-black text-emerald-500 uppercase mb-1">Human Confidence</p>
                              <p className="text-2xl font-black text-emerald-500">{selectedSub.securityMeta.humanConfidence}%</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                             <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                               <span>Neural Suspicion Score</span>
                               <span className={selectedSub.securityMeta.suspicionScore > 50 ? 'text-red-500' : 'text-slate-400'}>{selectedSub.securityMeta.suspicionScore} / 100</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                               <div 
                                 className={`h-full transition-all duration-1000 ${selectedSub.securityMeta.suspicionScore > 50 ? 'bg-red-500' : 'bg-[#FF5A1F]'}`} 
                                 style={{ width: `${selectedSub.securityMeta.suspicionScore}%` }} 
                               />
                             </div>
                          </div>

                          <div className="pt-4 border-t border-slate-900 space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time spent per round</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[1,2,3,4].map(r => (
                                <div key={r} className="flex justify-between p-2 bg-slate-900/30 rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-600">Round {r}</span>
                                  <span className="text-[9px] font-mono text-slate-400">
                                    {selectedSub.roundDurations ? Math.floor((selectedSub.roundDurations[r] || 0) / 60) : '0'}m
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-700">
                          <AlertTriangle className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Historical Data: Security Meta Unavailable</p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-900">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Violation Timeline</p>
                        <div className="space-y-2">
                          {selectedSub.violations && selectedSub.violations.length > 0 ? (
                            selectedSub.violations.map((log: string, i: number) => (
                              <div key={i} className="text-[9px] font-mono p-2 bg-slate-950 border border-slate-900 rounded-lg text-slate-400">
                                {log}
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-emerald-500/50 italic">Clean integrity record</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-slate-950/50 border border-slate-900 rounded-[35px]">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#FF5A1F]" /> Hiring Workflow Authorization
                        </h3>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter mt-1">Formal Recruitment Communication Panel</p>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           disabled={isSendingEmail === selectedSub.email}
                           onClick={() => handleSendResult(selectedSub.email, selectedSub.name, "SELECTED")}
                           className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                         >
                           {isSendingEmail === selectedSub.email ? "SENDING..." : "DISPATCH SELECTION"}
                         </button>
                         <button 
                           disabled={isSendingEmail === selectedSub.email}
                           onClick={() => handleSendResult(selectedSub.email, selectedSub.name, "INTERVIEW")}
                           className="px-6 py-2 bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-400 transition-all disabled:opacity-50"
                         >
                           {isSendingEmail === selectedSub.email ? "SENDING..." : "INVITE INTERVIEW"}
                         </button>
                         <button 
                           disabled={isSendingEmail === selectedSub.email}
                           onClick={() => handleSendResult(selectedSub.email, selectedSub.name, "REJECTED")}
                           className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
                         >
                           {isSendingEmail === selectedSub.email ? "SENDING..." : "DISPATCH REJECTION"}
                         </button>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Communication History</p>
                      <div className="space-y-2">
                        {emailLogs.filter(l => l.candidateEmail === selectedSub.email).map((log, i) => (
                           <div key={i} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-xl">
                              <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${log.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                 <span className="text-[10px] font-bold text-white uppercase">{log.type}</span>
                                 <span className="text-[9px] text-slate-600 font-mono">[{log.timestamp?.toDate?.().toLocaleString() || 'N/A'}]</span>
                              </div>
                              <span className={`text-[9px] font-black ${log.status === 'DELIVERED' ? 'text-emerald-500' : 'text-red-500'}`}>{log.status}</span>
                           </div>
                        ))}
                        {emailLogs.filter(l => l.candidateEmail === selectedSub.email).length === 0 && (
                          <p className="text-[10px] text-slate-700 italic px-2">No historical dispatches found for this candidate reference.</p>
                        )}
                      </div>
                   </div>
                </div>

                {/* DETAILED QUESTION BREAKDOWN */}
                <div className="mt-12 space-y-8">
                   <h3 className="text-sm font-black text-slate-500 uppercase flex items-center gap-2 px-2">
                     <Settings className="w-4 h-4 text-[#FF5A1F]" /> Granular Neural Audit
                   </h3>
                   
                   <div className="space-y-6">
                      {['r1Details', 'r2Details', 'r4Details'].map((roundKey: any) => {
                        const details = selectedSub[roundKey];
                        if (!details || details.length === 0) return null;
                        
                        return (
                          <div key={roundKey} className="bg-slate-950/50 border border-slate-900 rounded-3xl overflow-hidden">
                            <div className="px-6 py-4 bg-slate-950 border-b border-slate-900 flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-[#FF5A1F] shadow-[0_0_10px_#FF5A1F]" />
                                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                                   {roundKey === 'r1Details' ? 'Round 1: Aptitude Analytics' : roundKey === 'r2Details' ? 'Round 2: Grammar Analytics' : 'Round 4: Technical Execution'}
                                 </span>
                               </div>
                               <div className="flex gap-4">
                                 <span className="text-[9px] font-bold text-slate-600 uppercase">
                                   {details.filter((d:any)=> d.type === 'coding' ? d.passed : d.isCorrect).length} / {details.length} Successful
                                 </span>
                                 <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                   {Math.round((details.filter((d:any)=> d.type === 'coding' ? d.passed : d.isCorrect).length / details.length) * 100)}% Accuracy
                                 </span>
                               </div>
                            </div>
                            <div className="divide-y divide-slate-900/50">
                               {details.map((item: any, i: number) => (
                                 <div key={i} className="p-6 flex gap-4 hover:bg-slate-900/30 transition-all">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                       {item.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-xs font-bold text-white mb-2">{item.question || item.title || `Task ${i+1}`}</p>
                                       <div className="grid grid-cols-2 gap-4">
                                          <div className="p-2 bg-slate-900/50 rounded-lg">
                                             <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Candidate Input</p>
                                             <p className={`text-[10px] font-bold ${item.isCorrect ? "text-emerald-500" : "text-red-400"}`}>{item.selected || "OMITTED"}</p>
                                          </div>
                                          {!item.isCorrect && (
                                            <div className="p-2 bg-emerald-500/5 rounded-lg">
                                              <p className="text-[8px] font-bold text-emerald-500/50 uppercase mb-1">Correct Identity</p>
                                              <p className="text-[10px] font-bold text-emerald-500">{item.correct}</p>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              </div>
              
              <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-3 bg-[#FF5A1F] text-white font-bold rounded-xl">Close Review</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-[#0D121F] border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-blue-500" /> Modify Candidate Details
              </h2>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div>
                  <label htmlFor="editName" className="text-[10px] font-bold text-slate-600 uppercase">Full Name</label>
                  <input 
                    id="editName"
                    name="name"
                    type="text" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                    value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="editEmail" className="text-[10px] font-bold text-slate-600 uppercase">Email (Read Only)</label>
                  <input 
                    id="editEmail"
                    name="email"
                    type="email" disabled 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500"
                    value={editingStudent.email}
                  />
                </div>
                <div>
                  <label htmlFor="editCollege" className="text-[10px] font-bold text-slate-600 uppercase">College</label>
                  <input 
                    id="editCollege"
                    name="college"
                    type="text" required 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
                    value={editingStudent.college} onChange={e => setEditingStudent({...editingStudent, college: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editDomain" className="text-[10px] font-bold text-slate-600 uppercase">Domain</label>
                    <select 
                      id="editDomain"
                      name="domain"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs"
                      value={editingStudent.domain} onChange={e => setEditingStudent({...editingStudent, domain: e.target.value})}
                    >
                      {["Java", "Python", "Web Development", "Data Science", "Data Analytics", "Civil", "Mechanical", "Electrical"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="editSlot" className="text-[10px] font-bold text-slate-600 uppercase">Slot</label>
                    <select 
                      id="editSlot"
                      name="slot"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs"
                      value={editingStudent.slot} onChange={e => setEditingStudent({...editingStudent, slot: e.target.value})}
                    >
                      {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
