import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <div style={{ padding: "3rem", backgroundColor: "var(--bg-color)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "var(--primary-color)" }}>Student Portal</h1>
      <div style={{ marginTop: "2rem", backgroundColor: "var(--card-bg)", padding: "3rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "100%", maxWidth: "600px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h2>Available Assessments</h2>
        <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>You have 1 pending mock examination ready. It features dynamic AI-fetched Leetcode questions.</p>
        <Link href="/exam/123" style={{ display: "inline-block", padding: "1rem 2rem", backgroundColor: "var(--primary-color)", color: "white", textDecoration: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "1.1rem", transition: "transform 0.2s" }}>
          Start Mock Assessment
        </Link>
      </div>
    </div>
  );
}
