"use client";
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      const { verifyCandidateFirebase } = await import('@/lib/firebase');
      const status = await verifyCandidateFirebase(email, password);

      if (status === "SUCCESS") {
        localStorage.setItem("geonixa_current_user", email);
        alert(`Authentication Confirmed.\nVerified secure pipeline for ${email}. Access authorized.`);
        window.location.href = "/exam/123";
      } else if (status === "INVALID_PASS") {
        alert("Standard authentication verification failed! Incorrect Exam Password.");
      } else {
        alert("Email not found in registered candidates pool. Please sign up the student first.");
      }
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-color)", fontFamily: "sans-serif" }}>
      <div style={{ padding: "3rem", backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)", width: "350px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "var(--primary-color)", margin: "0 0 2rem" }}>Secure Login Portal</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600 }}>Unique Target Email</label>
            <input type="email" placeholder="student@example.com" required style={{ width: "100%", padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: 600 }}>Password / Hash</label>
            <input type="password" placeholder="••••••••" required style={{ width: "100%", padding: "0.8rem", borderRadius: "4px", border: "1px solid var(--border-color)" }} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ padding: "0.8rem", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginTop: "1rem" }}>
            Log In securely
          </button>
        </form>
      </div>
    </div>
  );
}
