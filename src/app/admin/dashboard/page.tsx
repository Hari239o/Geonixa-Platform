"use client";
import { useEffect, useState } from 'react';

// Hardcoded Correct Constraints locally
const APTITUDE_CORRECT_MAP: Record<string, string> = {
   "Logical Deduction: If all Bloops are Razzies and all Razzies are Lazzies, then...": "All Bloops are Lazzies",
   "Tense Consistency: By the time the police arrived, the burglar ___.": "had escaped",
   "Probability: Two dice are thrown simultaneously. What is the probability of getting two numbers whose product is even?": "3/4",
   "Time & Work: A can do a piece of work in 24 days. If B is 60% more efficient than A, then how many days does B require to do the same work?": "15 days",
   "Speed & Distance: A train running at 54 km/hr crosses a platform in 20 seconds. If the length of the train is 150m, what is the length of the platform?": "150 m",
   "Algebra: If x + 1/x = 5, find the value of x^3 + 1/x^3.": "110",
   "Geometry: A triangle has sides 5, 12, and 13. What is the radius of the inscribed circle?": "2",
   "Trigonometry: In a right angled triangle, if tan(A) = 3/4, what is the value of cos(A)?": "4/5",
   "Clocks: What is the angle between the minute hand and the hour hand of a clock at 3:40?": "130 degrees",
   "Calendars: What day of the week was on 15th August 1947?": "Friday",
   "Profit & Loss: A merchant marks his goods up by 50% and then offers a discount on the marked price. If he makes a 20% profit, what is the discount percentage?": "20%",
   "Logarithms: If log(2) = 0.3010 and log(3) = 0.4771, find the value of log(72).": "1.8573",
   "Combinatorics: In how many ways can a committee of 5 be formed from 6 men and 4 women if at least 2 women must be included?": "186",
   "Mixture: A container contains 40 litres of milk. From this, 4 litres of milk was taken out and replaced by water. This process was repeated further two times. How much milk is now in the container?": "29.16 L",
   "Simple Interest: At what rate percent per annum will a sum of money double in 16 years?": "6.25%",
   "Ages: The present ages of A and B are in the ratio 4:5. Eight years hence, the ratio of their ages will be 5:6. What is A's present age?": "32 years",
   "Data Interpretation: From a dataset of 5, 9, x, 14, 21, if the mean is 12, what is the value of x?": "11",
   "Mensuration: If the radius of a cylinder is doubled and its height is halved, by what percent does its volume increase?": "100%",
   "Pipes & Cisterns: Pipe A can fill a tank in 10 hours, B in 15 hours. If both are opened together, how long will it take?": "6 hours",
   "Permutations: How many unique string sets can be formed by rearranging ALGORITHM?": "362880",
};

const GRAMMAR_CORRECT_MAP: Record<string, string> = {
   "Error Spotting: Identify the error -> 'Neither of the two candidates who had applied for the post were eligible.'": "were eligible",
   "Synonyms: What is the closest meaning of the word 'Ebullient'?": "Enthusiastic",
   "Parajumbles: Arrange -> P: to understand Q: is essential R: the context S: clearly.": "RQPS",
   "Active/Passive: Convert to Passive -> 'The manager will give you a ticket.'": "Both A and B",
   "Direct/Indirect: 'He said, \"I have been reading this book.\"'": "He said that he had been reading that book.",
   "Reading Comprehension Analysis: What is the primary tone of a passage discussing catastrophic climate failures?": "Pessimistic / Objective",
   "Cloze Test: The scientist was highly ___ by his peers for his groundbreaking research.": "revered",
   "Modifier Misplacement: Fix -> 'Running down the street, the tree caught my attention.'": "As I was running down the street, the tree caught my attention.",
   "Prepositions: She is completely averse ___ the idea of moving abroad.": "to",
   "Logical Deduction: If all Bloops are Razzies and all Razzies are Lazzies, then...": "All Bloops are Lazzies",
   "Tense Consistency: By the time the police arrived, the burglar ___.": "had escaped",
   "Vocabulary Root: The root 'phil' in philanthropy means:": "Love",
   "Idioms: To 'bite the bullet' means to:": "Endure a painful experience bravely",
   "Phonology: Which word has a silent 'b'?": "Doubt",
   "Punctuation: Which sentence is correctly punctuated?": "Let's eat, Grandma!",
   "Sentence Improvement: He is the smartest of the two brothers.": "smarter of the two",
   "Semantic Ambiguity: 'I saw the man with the telescope.' This means:": "I used it, or he had it (ambiguous)",
   "Parallelism: She likes cooking, jogging, and ___.": "reading",
   "Subjunctive Mood: It is essential that he ___ his homework immediately.": "finish",
   "Subject-Verb Concord: The bouquet of red roses ___ a beautiful aroma.": "has",
};

export default function AdminDashboard() {
   const [authorized, setAuthorized] = useState(false);
   const [submissions, setSubmissions] = useState<Record<string, any>>({});
   const [registeredUsers, setRegisteredUsers] = useState<Record<string, string>>({});
   const [profiles, setProfiles] = useState<Record<string, any>>({});
   const [printingEmail, setPrintingEmail] = useState<string | null>(null);
   const [loadingDb, setLoadingDb] = useState(true);

   useEffect(() => {
      const user = typeof window !== 'undefined' ? localStorage.getItem("geonixa_current_user") : null;
      if (user !== "harikishorereddy9908@gmail.com") {
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
      if (data.r1Answers) {
         Object.keys(data.r1Answers).forEach(idx => {
            const userPick = data.r1Answers[idx];
            let foundMatch = false;
            // Searching globally since arrays were shuffled per user
            Object.values(APTITUDE_CORRECT_MAP).forEach(ans => {
               if (ans === userPick) foundMatch = true;
            });
            if (foundMatch) aptitudePoints++;
            else aptitudeWrong++;
         });
      }

      if (data.r2Answers) {
         Object.keys(data.r2Answers).forEach(idx => {
            const userPick = data.r2Answers[idx];
            let foundMatch = false;
            Object.values(GRAMMAR_CORRECT_MAP).forEach(ans => {
               if (ans === userPick) foundMatch = true;
            });
            if (foundMatch) grammarPoints++;
            else grammarWrong++;
         });
      }

      // Penalty logic: 3 wrong = -1 mark
      const finalAptitude = Math.max(0, aptitudePoints - Math.floor(aptitudeWrong / 3));
      const finalGrammar = Math.max(0, grammarPoints - Math.floor(grammarWrong / 3));

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
      <div className="animate-fade-in" style={{ padding: "6rem 3rem 3rem", backgroundColor: "var(--bg-color)", minHeight: "100vh", fontFamily: "sans-serif" }}>
         <div className="no-print">
            <h1 style={{ color: "var(--primary-color)", fontSize: "2.5rem" }}>Secured Admin Operations Layer</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>Super-Admin Logged in securely: <strong>harikishorereddy9908@gmail.com</strong></p>

            <div className="responsive-grid" style={{ marginTop: "2rem" }}>
               <div className="hover-glow animate-pulse-border" style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", transition: "0.3s" }}>
                  <h3 style={{ color: "var(--text-main)" }}>Total Active Platform Candidates</h3>
                  <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "1rem 0 0", color: "var(--primary-color)" }}>{allRegisteredEmails.length}</p>
               </div>
               <div className="hover-glow" style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)", transition: "0.3s" }}>
                  <h3 style={{ color: "var(--text-main)" }}>Finalized Exams Logged</h3>
                  <p style={{ fontSize: "3rem", fontWeight: "bold", margin: "1rem 0 0", color: "var(--success)" }}>{completedEmails.length}</p>
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

            {completedEmails.length === 0 ? (
               <p className="no-print" style={{ color: "var(--text-muted)" }}>No students have finalized an assessment run yet. Submissions will populate here dynamically.</p>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {completedEmails.map((email, idx) => {
                     const data = submissions[email];
                     const s = calculateScore(data);
                     const dateStr = new Date(data.timestamp).toLocaleString();
                     const passed = s.totalMarks >= 90;

                     const profile = profiles[email] || {};

                     const feedback = data.feedback || null;

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
                                 <div style={{ fontSize: "2rem", fontWeight: "bold", color: passed ? "var(--success)" : "var(--danger)" }}>
                                    {passed ? "PASSED" : "FAILED"}
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
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center" }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Aptitude (15)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.finalAptitude}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center" }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Grammar (15)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.finalGrammar}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center" }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Typing (10)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.typingPoints}</div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--card-bg)", padding: "1rem", textAlign: "center" }}>
                                       <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Coding (60)</div>
                                       <div style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "bold" }}>{s.codingPoints}</div>
                                    </div>
                                 </div>
                              </div>
                           </div>

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
   );
}
