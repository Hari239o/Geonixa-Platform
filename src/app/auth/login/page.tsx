"use client";
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      // Hardcoded explicit Admin Details requirement
      if (email === "talent@geonixa.com") {
        if (password === "Talent@9908") {
          localStorage.setItem("geonixa_current_user", email);
          window.location.href = "/admin/dashboard";
          return;
        } else {
          alert("CRITICAL: Invalid Secured Administrator Password!");
          return;
        }
      }

      // Match securely generated student credentials via Firebase
      const { verifyCandidateFirebase, isFirebaseConfigured } = await import('@/lib/firebase');
      const status = await verifyCandidateFirebase(email, password);

      if (status === "SUCCESS") {
        localStorage.setItem("geonixa_current_user", email);
        alert(`Authentication Confirmed.\nVerified secure pipeline for ${email}. Access authorized.`);
        window.location.href = "/exam/123";
      } else if (status === "INVALID_PASS") {
        alert("Standard authentication verification failed! Incorrect Exam Password.");
      } else {
        let errorMsg = "Email not found in registered candidates pool. Please sign up the student first.";
        if (!isFirebaseConfigured) {
           errorMsg += "\n\n⚠️ NOTE: Firebase is not configured in this environment. Credentials only work on the specific browser where the student registered.";
        }
        alert(errorMsg);
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
      <div style={{ padding: "3rem", backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)", width: "90%", maxWidth: "400px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "var(--primary-color)", margin: "0 0 2rem", textAlign: "center" }}>Secure Login Portal</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600 }}>Unique Target Email</label>
            <input type="email" placeholder="student@example.com" required style={{ width: "100%", padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600 }}>Password / Hash</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                style={{ width: "100%", padding: "0.8rem", paddingRight: "40px", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button type="submit" style={{ padding: "0.8rem", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginTop: "1rem", transition: "0.2s opacity" }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            Log In securely
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
