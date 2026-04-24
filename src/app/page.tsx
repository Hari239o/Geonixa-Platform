import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          </svg>
          Geonixa Platform
        </div>
        <nav>
          <Link href="/auth/login" className="btn btn-outline" style={{ marginRight: '1rem' }}>
            Login
          </Link>
          <Link href="/auth/register" className="btn btn-primary">
            Sign Up Free
          </Link>
        </nav>
      </header>

      <section className={styles.main}>
        <h1 className={styles.heroTitle}>Company-Grade AI Assessment Platform</h1>
        <p className={styles.heroSubtitle}>
          Geonixa Assessment Platform
        </p>

        <div className={styles.actionCards} style={{ display: "flex", justifyContent: "center" }}>
          <div className={styles.card} style={{ maxWidth: "500px" }}>
            <div className={styles.cardIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className={styles.cardTitle}>For Students</h2>
            <p className={styles.cardDesc}>Access your assigned assessments, view company-readiness reports, and practice coding challenges in a proctored environment.</p>
            <Link href="/auth/login?role=student" className="btn btn-primary" style={{ width: '100%' }}>
              Student Portal
            </Link>
          </div>
        </div>
        
        <div style={{ marginTop: "2rem", textAlign: "center", fontStyle: "italic", color: "var(--text-muted)" }}>
          Note: Registration completion and exam login credentials will be securely sent to your verified email address.
        </div>
      </section>
    </main>
  );
}
