"use client";
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [domain, setDomain] = useState("Java");

  const [isLoading, setIsLoading] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [generatedPass, setGeneratedPass] = useState("");

  const IS_REGISTRATION_OPEN = false; // Set to false to allow only Admin Invitations

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessLink("");

    if (typeof window !== "undefined") {
      try {
        const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        // Save Name/College/Domain mapped to email securely natively using Firebase
        const { registerCandidateFirebase } = await import('@/lib/firebase');
        await registerCandidateFirebase(email, autoPass, { name, college, domain });

        const res = await fetch('/api/auth/register', {

          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: autoPass, name, college, domain })
        });
        const data = await res.json();

        setIsLoading(false);

        if (data.success) {
          setIsRegistered(true);
          setGeneratedPass(autoPass);
          if (data.previewUrl) {
            setSuccessLink(data.previewUrl);
          }
        } else {
          alert("SMTP Framework error: " + data.error);
        }
      } catch (err) {
        setIsLoading(false);
        alert("Server validation crash.");
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--bg-color)", fontFamily: "sans-serif" }}>
      <header style={{ padding: "1.2rem 2.5rem", backgroundColor: "#0f172a", display: "flex", alignItems: "center", gap: "0.8rem", borderBottom: "1px solid #1e293b", zIndex: 100, position: "relative" }}>
        <div style={{ width: "35px", height: "35px", backgroundColor: "#3b82f6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
             <polyline points="2 17 12 22 22 17"></polyline>
             <polyline points="2 12 12 17 22 12"></polyline>
           </svg>
        </div>
        <div>
          <h1 style={{ color: "white", fontSize: "1.4rem", margin: 0, letterSpacing: "1px", fontWeight: "bold" }}>GEONIXA</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.6rem", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>Corporate Systems</p>
        </div>
      </header>
      <div className="animate-fade-in" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflowY: "auto", padding: "2rem" }}>
      <div style={{ padding: "3rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", width: "100%", maxWidth: "550px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>

        {!isRegistered ? (
          <>
            {IS_REGISTRATION_OPEN ? (
              <>
                <h2 style={{ color: "var(--primary-color)", margin: "0 0 0.5rem", textAlign: "center", fontSize: "1.8rem" }}>Candidate Registration</h2>
                <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>Enter candidate metadata exactly to deploy the assessment payload.</p>

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div className="responsive-grid">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontWeight: 600 }}>Candidate Name</label>
                      <input type="text" placeholder="John Doe" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <label style={{ fontWeight: 600 }}>College / University</label>
                      <input type="text" placeholder="Stanford Institute..." required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={college} onChange={e => setCollege(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: 600 }}>Target Discipline / Domain</label>
                    <select style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={domain} onChange={e => setDomain(e.target.value)}>
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Data Analyst">Data Analyst</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontWeight: 600 }}>Secure Delivery Email</label>
                    <input type="email" placeholder="student@example.com" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>

                  <button disabled={isLoading} type="submit" style={{ padding: "1.2rem", backgroundColor: isLoading ? "#94a3b8" : "var(--primary-color)", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "1rem", cursor: isLoading ? "not-allowed" : "pointer", marginTop: "1rem", transition: "0.2s linear" }}>
                    {isLoading ? "Assembling MNC Email & Processing..." : "Generate Candidate File & Deliver Email"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Public Registration Suspended</h2>
                <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                  The GeoNixa assessment window is currently restricted to pre-authorized candidates only. 
                  <br/><br/>
                  If you are an invited candidate, please check your email for the <strong>Secure Pass-Key</strong> and proceed to the login portal.
                </p>
              </div>
            )}
            <p style={{ marginTop: "2rem", fontSize: "0.9rem", textAlign: "center", color: "var(--text-muted)" }}>
              Already registered? <a href="/auth/login" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Access Dashboard</a>
            </p>
          </>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "4px solid var(--success)", padding: "10px", margin: "0 auto 1.5rem" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "var(--success)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: "bold" }}>✓</div>
            </div>
            <h2 style={{ color: "var(--success)", margin: "0 0 1rem", fontSize: "2rem" }}>Registration Successful</h2>
            <p style={{ color: "var(--text-main)", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "bold" }}>Credentials Sent to {email}</p>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: "1.6" }}>
              Your assessment profile has been created. Please check your email inbox for the official invitation and secure pass-key. 
              <br/><br/>
              <strong>To begin the exam:</strong> Close this window, return to the main website, and navigate to the Login Portal.
            </p>

            <div style={{ backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #e2e8f0", position: "relative" }}>
              <p style={{ margin: "0", fontSize: "0.9rem", color: "#475569" }}>Generated Pass-Key (Backup):</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "0.5rem" }}>
                <code style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0f172a" }}>{generatedPass}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPass);
                    alert("Pass-Key copied to clipboard!");
                  }}
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderRadius: "4px", border: "1px solid var(--primary-color)", backgroundColor: "white", cursor: "pointer", color: "var(--primary-color)" }}
                >
                  Copy 📋
                </button>
              </div>
            </div>

            {successLink && (
              <a href={successLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: "1rem", marginBottom: "1rem", width: "100%", display: "block" }}>
                PREVIEW MNC INVITATION
              </a>
            )}
            
            <a href="/auth/login" className="btn btn-primary" style={{ display: "inline-block", padding: "1.2rem", fontWeight: "bold", width: "100%", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white", textDecoration: "none", borderRadius: "6px" }}>
              Go to Secure Login Portal
            </a>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
