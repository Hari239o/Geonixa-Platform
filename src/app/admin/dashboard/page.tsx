"use client";
import { useEffect, useState } from 'react';

const APTITUDE_CORRECT_ANSWERS = [
   "9720", "168", "3/4", "15 days", "150 m", "110", "2", "4/5", "130 degrees", "Friday",
   "20%", "1.8573", "186", "29.16 L", "6.25%", "32 years", "11", "100%", "6 hours", "362880",
   "0", "~97%", "16! / 2^8", "8√3", "2", "4", "1/4", "5 days", "10!/ (4!*2!*2!) * 11C3", "First Player",
   "2", "252", "1/2", "3", "48%", "3:2", "30", "4:1", "3/8", "6",
   "24", "Loss 1%", "37.5", "5", "34650", "60", "10", "30", "3h", "5km"
];

const GRAMMAR_CORRECT_ANSWERS = [
   "were eligible", "Enthusiastic", "RQPS", "Both A and B", "He said that he had been reading that book.", "Pessimistic / Objective", "revered", "As I was running down the street, the tree caught my attention.", "to", "All Bloops are Lazzies",
   "had escaped", "Love", "Endure a painful experience bravely", "Doubt", "Let's eat, Grandma!", "smarter of the two", "I used it, or he had it (ambiguous)", "reading", "finish", "has",
   "would have reconsidered", "when the crowd began", "Elucidate", "PRSQ", "My purse has been stolen.", "She requested him to give her a glass of water.", "Indignant", "unanimous", "She watched the dog, covered in mud, run into the house.", "of",
   "No A's are C's", "had started", "Time", "Reveal a secret", "Call", "It's a beautiful day.", "were", "Both A and B", "review", "leave",
   "are", "is made", "Misanthrope", "PQRS", "By whom was this book written?", "He said he would go the next day.", "on", "Very easy", "have known"
];

export default function AdminDashboard() {
   const [authorized, setAuthorized] = useState(false);
   const [submissions, setSubmissions] = useState<Record<string, any>>({});
   const [registeredUsers, setRegisteredUsers] = useState<Record<string, string>>({});
   const [profiles, setProfiles] = useState<Record<string, any>>({});
   const [printingEmail, setPrintingEmail] = useState<string | null>(null);
   const [loadingDb, setLoadingDb] = useState(true);

   // Invitation States
   const [inviteEmail, setInviteEmail] = useState("");
   const [inviteName, setInviteName] = useState("");
   const [inviteCollege, setInviteCollege] = useState("");
   const [inviteDomain, setInviteDomain] = useState("Java");
   const [inviting, setInviting] = useState(false);

   useEffect(() => {
      const user = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
      if (user !== "talent@geonixa.com") {
         alert("Unauthorized Access Request! Admin rights strictly required.");
         window.location.href = "/";
      } else {
         setAuthorized(true);
         if (typeof window !== "undefined") {
            import('@/lib/firebase').then(({ fetchAllDashboardData }) => {
               fetchAllDashboardData().then((data) => {
                  setSubmissions(data.submissions);
                  setRegisteredUsers(data.logins);
                  setProfiles(data.profiles);
                  setLoadingDb(false);
               });
            });
         }
      }
   }, []);

   if (!authorized) return <div style={{ height: "100vh", backgroundColor: "var(--bg-color)" }} />;

   const completedEmails = Object.keys(submissions);
   const allRegisteredEmails = Object.keys(registeredUsers);

   const calculateScore = (data: any) => {
      let aptitudePoints = 0;
      let aptitudeWrong = 0;
      let grammarPoints = 0;
      let grammarWrong = 0;

      // Calculate Aptitude Out of 15 limits
      if (data.r1Results) {
         data.r1Results.forEach((res: any) => {
            if (res.isRight) aptitudePoints++;
            else if (res.selected !== "Not Attempted") aptitudeWrong++;
         });
      } else if (data.r1Answers) {
         Object.keys(data.r1Answers).forEach(idx => {
            const userPick = data.r1Answers[idx];
            if (APTITUDE_CORRECT_ANSWERS.includes(userPick)) aptitudePoints++;
            else aptitudeWrong++;
         });
      }

      if (data.r2Results) {
         data.r2Results.forEach((res: any) => {
            if (res.isRight) grammarPoints++;
            else if (res.selected !== "Not Attempted") grammarWrong++;
         });
      } else if (data.r2Answers) {
         Object.keys(data.r2Answers).forEach(idx => {
            const userPick = data.r2Answers[idx];
            if (GRAMMAR_CORRECT_ANSWERS.includes(userPick)) grammarPoints++;
            else grammarWrong++;
         });
      }

      // Penalty logic: 3 wrong = -1 point (which is now scaled down to 0.5 marks)
      const finalAptitude = Math.max(0, (aptitudePoints - Math.floor(aptitudeWrong / 3)) * 0.5);
      const finalGrammar = Math.max(0, (grammarPoints - Math.floor(grammarWrong / 3)) * 0.5);

      // Typing Rules: Total 10. Must type >= 20 lines to get 10 marks. Negative 5 if backspaces exist.
      const rawBackspaces = data.backspacesUsed || 0;
      const typedLines = data.typingLines || 0;
      let typingPoints = 0;
      if (typedLines >= 20) {
         typingPoints = 10;
         if (rawBackspaces > 0) typingPoints -= 5;
      }

      // Coding Rules: Total 60. 20 per correctly passed structure.
      const codingPasses = (data.codingProgress || []).filter(Boolean).length;
      const codingPoints = codingPasses * 20;

      const totalMarks = finalAptitude + finalGrammar + typingPoints + codingPoints;

      return { finalAptitude, finalGrammar, typingPoints, codingPoints, totalMarks };
   };

   const handleSendInvite = async (e: React.FormEvent) => {
      e.preventDefault();
      setInviting(true);
      try {
         const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
         const { registerCandidateFirebase } = await import('@/lib/firebase');
         await registerCandidateFirebase(inviteEmail, autoPass, { name: inviteName, college: inviteCollege, domain: inviteDomain });

         const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail, password: autoPass, name: inviteName, college: inviteCollege, domain: inviteDomain })
         });
         const data = await res.json();
         if (data.success) {
            alert(`INVITATION DISPATCHED SUCCESSFULLY!\nCredentials sent to ${inviteEmail}\nPass-Key: ${autoPass}`);
            setInviteEmail("");
            setInviteName("");
            setInviteCollege("");
         } else {
            alert("Error dispatching: " + data.error);
         }
      } catch (err) {
         alert("Internal System Error during dispatch.");
      } finally {
         setInviting(false);
      }
   };

   const handleDeleteTarget = async (targetEmail: string) => {
      if (confirm(`CRITICAL: Do you really want to permanently erase the entire record and exam locks for candidate: ${targetEmail}?`)) {
         const { deleteCandidateFirebase } = await import('@/lib/firebase');
         await deleteCandidateFirebase(targetEmail);

         const newSubs = { ...submissions };
         delete newSubs[targetEmail];
         setSubmissions(newSubs);

         const newRegs = { ...registeredUsers };
         delete newRegs[targetEmail];
         setRegisteredUsers(newRegs);

         const newProfs = { ...profiles };
         delete newProfs[targetEmail];
         setProfiles(newProfs);

         localStorage.removeItem(`geonixa_exam_status_${targetEmail}`);
      }
   };

    return (
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          body { overflow: hidden !important; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}} />
        <div className="animate-fade-in" style={{ flex: 1, overflowY: "auto", padding: "6rem 3rem 3rem", backgroundColor: "var(--bg-color)", fontFamily: "sans-serif" }}>
         <div className="no-print">
            <h1 style={{ color: "var(--primary-color)", fontSize: "2.5rem" }}>Secured Admin Operations Layer</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>Super-Admin Logged in securely: <strong>talent@geonixa.com</strong></p>

            <div className="responsive-grid" style={{ marginTop: "2rem" }}>
               <div className="hover-glow animate-pulse-border" style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", transition: "0.3s" }}>
                  <h3 style={{ color: "var(--text-main)" }}>Total Active Platform Candidates</h3>
                  <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "1rem 0 0", color: "var(--primary-color)" }}>{allRegisteredEmails.length}</p>
               </div>
               <div className="hover-glow" style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", transition: "0.3s" }}>
                  <h3 style={{ color: "var(--text-main)" }}>Finalized Exams Logged</h3>
                  <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "1rem 0 0", color: "var(--success)" }}>{completedEmails.length}</p>
               </div>
               <div style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "12px", border: "2px dashed var(--primary-color)", gridColumn: "span 1" }}>
                  <h3 style={{ color: "var(--primary-color)", margin: "0 0 1rem" }}>Authorized Invitation Dispatch</h3>
                  <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                     <input type="text" placeholder="Candidate Name" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={inviteName} onChange={e => setInviteName(e.target.value)} />
                     <input type="email" placeholder="Candidate Email" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                     <div style={{ display: "flex", gap: "1rem" }}>
                        <input type="text" placeholder="College" required style={{ flex: 1, padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={inviteCollege} onChange={e => setInviteCollege(e.target.value)} />
                        <select style={{ flex: 1, padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={inviteDomain} onChange={e => setInviteDomain(e.target.value)}>
                           <option value="Java">Java</option>
                           <option value="Python">Python</option>
                           <option value="Web Development">Web Development</option>
                        </select>
                     </div>
                     <button disabled={inviting} type="submit" style={{ padding: "0.8rem", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                        {inviting ? "Processing..." : "Dispatch Secure Invitation"}
                     </button>
                  </form>
               </div>
            </div>
         </div>

         <style dangerouslySetInnerHTML={{
            __html: `
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          body { background: white !important; color: black !important; font-family: 'Arial', sans-serif !important; }
          .no-print, header { display: none !important; }
          .print-only { display: block !important; }
          * { box-shadow: none !important; text-shadow: none !important; }
          .student-card { border: 2px solid #000 !important; background: transparent !important; page-break-inside: avoid !important; margin-bottom: 2rem !important; }
          .score-grid { border: 1px solid #000 !important; }
          .score-grid div { border: 1px solid #000 !important; color: black !important; }
        }
      `}} />

         <div className="print-only" style={{ marginBottom: "2rem", textAlign: "center", borderBottom: "3px solid #ea580c", paddingBottom: "1rem" }}>
            <h1 style={{ margin: 0, fontSize: "32px", fontFamily: "'Arial', sans-serif", fontWeight: 900, letterSpacing: "-0.5px" }}>
               <span style={{ color: "#ea580c" }}>Geo</span><span style={{ color: "#334155" }}>Nixa</span>
            </h1>
            <h2 style={{ margin: "5px 0 0", color: "#475569", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "bold" }}>Official Candidate Assessment Repository</h2>
            <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "10px", fontWeight: "bold" }}>STRICTLY CONFIDENTIAL HR DOCUMENT - DO NOT DISTRIBUTE</p>
         </div>
         <div style={{ marginTop: "3rem" }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
               <h2 style={{ color: "var(--text-main)", margin: 0 }}>Candidate Grading Matrix Analytics</h2>
               <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                     onClick={async () => {
                        if (confirm("CRITICAL WARNING: Are you sure you want to completely erase ALL student profiles, logins, and exam submissions? This action cannot be undone.")) {
                           // Normally we'd batch delete all Firebase documents here, but for simplicity we rely on manual deletion or fallback if using dummy.
                           const { fetchAllDashboardData, deleteCandidateFirebase } = await import('@/lib/firebase');
                           const data = await fetchAllDashboardData();
                           for (let email of Object.keys(data.logins)) {
                              await deleteCandidateFirebase(email);
                           }
                           // Clear individual status locks
                           Object.keys(localStorage).forEach(key => {
                              if (key.includes("geonixa_exam_status_")) localStorage.removeItem(key);
                           });
                           setSubmissions({});
                           setRegisteredUsers({});
                           setProfiles({});
                           alert("Database factory reset complete.");
                        }
                     }}
                     className="btn btn-outline"
                     style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", fontWeight: "bold", backgroundColor: "var(--danger)", color: "white", border: "none" }}
                  >
                     ⚠️ Wipe All Databases
                  </button>
                  <button onClick={() => window.print()} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", fontWeight: "bold" }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" /></svg>
                     Export PDF / Print Full Report
                  </button>
               </div>
            </div>

            {allRegisteredEmails.length === 0 ? (
               <p className="no-print" style={{ color: "var(--text-muted)" }}>No students have registered yet. Submissions will populate here dynamically.</p>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {allRegisteredEmails.map((email, idx) => {
                     const data = submissions[email];
                     const s = data ? calculateScore(data) : { finalAptitude: 0, finalGrammar: 0, typingPoints: 0, codingPoints: 0, totalMarks: 0 };
                     const dateStr = data ? new Date(data.timestamp).toLocaleString() : "Not Attempted";
                     const passed = s.totalMarks >= 90;
                     const statusText = !data ? "ABSENT" : (passed ? "PASSED" : "FAILED");
                     const statusColor = !data ? "#f59e0b" : (passed ? "var(--success)" : "var(--danger)");

                     const profile = profiles[email] || {};

                     const feedback = data ? data.feedback || null : null;

                     return (
                        <div key={email} className={`student-card ${printingEmail && printingEmail !== email ? 'no-print' : ''}`} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                              <div>
                                 <h2 style={{ color: "var(--primary-color)", margin: "0 0 0.5rem" }}>{profile.name || "Unknown Candidate"}</h2>
                                 <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <span><strong>ID:</strong> {email}</span>
                                    <span><strong>Date:</strong> {dateStr}</span>
                                 </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                 <div style={{ fontSize: "2rem", fontWeight: "bold", color: statusColor }}>
                                    {statusText}
                                 </div>
                                 <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-main)" }}>Score: {s.totalMarks}/100</div>
                              </div>
                           </div>

                           <div className="responsive-flex">
                              <div style={{ flex: 1 }}>
                                 <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1.1rem", textTransform: "uppercase" }}>Candidate Dossier</h3>
                                 <div style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}><strong>Institute:</strong> {profile.college || "N/A"}</div>
                                 <div style={{ color: "var(--text-muted)" }}><strong>Domain:</strong> {profile.domain || "N/A"}</div>
                              </div>

                              <div style={{ flex: 2 }}>
                                 <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem", fontSize: "1.1rem", textTransform: "uppercase" }}>Section Metrics</h3>
                                 <div className="score-grid responsive-grid-4" style={{ backgroundColor: "var(--border-color)", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center", opacity: !data ? 0.5 : 1 }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Aptitude (15)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.finalAptitude}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center", opacity: !data ? 0.5 : 1 }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Grammar (15)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.finalGrammar}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center", opacity: !data ? 0.5 : 1 }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Typing (10)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.typingPoints}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center", opacity: !data ? 0.5 : 1 }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Coding (60)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.codingPoints}</div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {data && (data.r1Results || data.r2Results) && (
                              <div className="no-print" style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                 <h3 style={{ color: "var(--text-main)", marginBottom: "1rem", fontSize: "1.1rem", textTransform: "uppercase" }}>Question-Level Database Analysis</h3>

                                 {data.r1Results && (
                                    <details style={{ cursor: "pointer", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                       <summary style={{ fontWeight: "bold", padding: "0.5rem", backgroundColor: "var(--card-bg)", borderRadius: "4px" }}>View Aptitude Database Log</summary>
                                       <div style={{ padding: "1rem", backgroundColor: "var(--card-bg)", marginTop: "0.5rem", borderRadius: "4px", maxHeight: "300px", overflowY: "auto" }}>
                                          {data.r1Results.map((res: any, i: number) => (
                                             <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                                <div style={{ color: "var(--text-main)", fontWeight: "bold", fontSize: "0.95rem" }}>Q{i + 1}: {res.question}</div>
                                                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
                                                   Selected Answer: <strong style={{ color: res.isRight ? "var(--success)" : "var(--danger)" }}>{res.selected}</strong>
                                                </div>
                                                {!res.isRight && <div style={{ color: "var(--success)", fontSize: "0.9rem", marginTop: "0.2rem" }}><strong>Correct Answer:</strong> {res.correct}</div>}
                                             </div>
                                          ))}
                                       </div>
                                    </details>
                                 )}

                                 {data.r2Results && (
                                    <details style={{ cursor: "pointer", color: "var(--text-muted)" }}>
                                       <summary style={{ fontWeight: "bold", padding: "0.5rem", backgroundColor: "var(--card-bg)", borderRadius: "4px" }}>View Grammar Database Log</summary>
                                       <div style={{ padding: "1rem", backgroundColor: "var(--card-bg)", marginTop: "0.5rem", borderRadius: "4px", maxHeight: "300px", overflowY: "auto" }}>
                                          {data.r2Results.map((res: any, i: number) => (
                                             <div key={i} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                                                <div style={{ color: "var(--text-main)", fontWeight: "bold", fontSize: "0.95rem" }}>Q{i + 1}: {res.question}</div>
                                                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
                                                   Selected Answer: <strong style={{ color: res.isRight ? "var(--success)" : "var(--danger)" }}>{res.selected}</strong>
                                                </div>
                                                {!res.isRight && <div style={{ color: "var(--success)", fontSize: "0.9rem", marginTop: "0.2rem" }}><strong>Correct Answer:</strong> {res.correct}</div>}
                                             </div>
                                          ))}
                                       </div>
                                    </details>
                                 )}
                              </div>
                           )}

                           {feedback && (
                              <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                                 <h3 style={{ color: "var(--text-main)", fontSize: "1rem", marginBottom: "0.5rem" }}>System Feedback Log</h3>
                                 <div style={{ color: "var(--warning)", fontSize: "1rem", marginBottom: "0.5rem" }}>
                                    {[...Array(5)].map((_, i) => <span key={i} style={{ opacity: i < feedback.stars ? 1 : 0.3 }}>★</span>)}
                                 </div>
                                 <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.3rem" }}><strong>Experience:</strong> {feedback.experience}</div>
                                 <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}><strong>Suggestions:</strong> {feedback.improvements}</div>
                              </div>
                           )}

                           <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                              <button
                                 onClick={() => {
                                    setPrintingEmail(email);
                                    setTimeout(() => {
                                       window.print();
                                       setPrintingEmail(null);
                                    }, 200);
                                 }}
                                 className="btn btn-outline"
                                 style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", fontWeight: "bold" }}
                              >
                                 🖨️ Export Specifically
                              </button>
                              <button
                                 onClick={() => handleDeleteTarget(email)}
                                 className="btn btn-outline"
                                 style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.2rem", fontWeight: "bold", backgroundColor: "var(--danger)", color: "white", border: "none" }}
                              >
                                 🗑️ Erase Candidate
                              </button>
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
          </div>
        </div>
      </div>
    );
}
