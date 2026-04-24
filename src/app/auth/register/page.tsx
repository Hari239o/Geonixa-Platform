"use client";
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [domain, setDomain] = useState("Java");
  
  const [isLoading, setIsLoading] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessLink("");

    if(typeof window !== "undefined") {
      try {
        const autoPass = "GEONIXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Save Name/College/Domain mapped to email securely natively
        const validLogins = JSON.parse(localStorage.getItem("geonixa_valid_logins") || "{}");
        const profileData = JSON.parse(localStorage.getItem("geonixa_student_profiles") || "{}");
        
        validLogins[email] = autoPass;
        profileData[email] = { name, college, domain };
        
        localStorage.setItem("geonixa_valid_logins", JSON.stringify(validLogins));
        localStorage.setItem("geonixa_student_profiles", JSON.stringify(profileData));

        const res = await fetch('/api/auth/register', { 
           method: 'POST', 
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password: autoPass, name, college, domain })
        });
        const data = await res.json();
        
        setIsLoading(false);

        if (data.success) {
           if (data.previewUrl) {
             setSuccessLink(data.previewUrl);
           } else {
             alert(`Registration Processed!\nSince you linked a real SMTP App Password, a native Email has genuinely dispatched directly to ${email}.\nExam Password: ${autoPass}`);
             window.location.href = "/auth/login";
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
    <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-color)", fontFamily: "sans-serif", padding: "2rem" }}>
      <div style={{ padding: "3rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border-color)", width: "100%", maxWidth: "550px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        
        {!successLink ? (
          <>
            <h2 style={{ color: "var(--primary-color)", margin: "0 0 0.5rem", textAlign: "center", fontSize: "1.8rem" }}>Candidate Registration</h2>
            <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>Enter candidate metadata exactly to deploy the assessment payload.</p>
            
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                   <label style={{ fontWeight: 600 }}>Candidate Name</label>
                   <input type="text" placeholder="John Doe" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={name} onChange={e=>setName(e.target.value)} />
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                   <label style={{ fontWeight: 600 }}>College / University</label>
                   <input type="text" placeholder="Stanford Institute..." required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={college} onChange={e=>setCollege(e.target.value)} />
                 </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600 }}>Target Discipline / Domain</label>
                <select style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={domain} onChange={e=>setDomain(e.target.value)}>
                   <option value="Java">Java</option>
                   <option value="Python">Python</option>
                   <option value="Web Development">Web Development</option>
                   <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600 }}>Secure Delivery Email</label>
                <input type="email" placeholder="student@example.com" required style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)" }} value={email} onChange={e=>setEmail(e.target.value)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontWeight: 600 }}>Override Framework Password</label>
                <input type="password" placeholder="System auto-generates Pass-Key natively..." disabled style={{ width: "100%", padding: "0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "#f1f5f9" }} />
              </div>
              <button disabled={isLoading} type="submit" style={{ padding: "1.2rem", backgroundColor: isLoading ? "#94a3b8" : "var(--primary-color)", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "1rem", cursor: isLoading ? "not-allowed" : "pointer", marginTop: "1rem", transition: "0.2s linear" }}>
                {isLoading ? "Assembling MNC Email & Processing..." : "Generate Candidate File & Deliver Email"}
              </button>
            </form>
            <p style={{ marginTop: "2rem", fontSize: "0.9rem", textAlign: "center", color: "var(--text-muted)" }}>
              Already registered? <a href="/auth/login" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Access Dashboard</a>
            </p>
          </>
        ) : (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: "4px solid var(--success)", padding: "10px", margin: "0 auto 1.5rem" }}>
               <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "var(--success)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: "bold" }}>✓</div>
            </div>
            <h2 style={{ color: "var(--success)", margin: "0 0 1rem", fontSize: "2rem" }}>Candidate Bound Successfully</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "1.1rem" }}>The system has organically generated the candidate's custom MNC Invitation.</p>
            
            <a href={successLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "1.2rem", fontWeight: "bold", marginBottom: "1rem", width: "100%", fontSize: "1.2rem", backgroundColor: "#0f172a" }}>
               CLICK TO VIEW THE MNC INVITATION EMAIL
            </a>
            <a href="/auth/login" className="btn btn-outline" style={{ display: "inline-block", padding: "1rem 2rem", fontWeight: "bold", width: "100%", boxSizing: "border-box" }}>
               Return to Login Matrix
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
