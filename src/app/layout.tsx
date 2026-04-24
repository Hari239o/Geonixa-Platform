import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geonixa Official Assessment",
  description: "Secure, reliable, and AI-monitored online examination platform by Geonixa Corporate Intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Dynamic Static Company Corporate Navigation Overlay Layer */}
        <header style={{ padding: "1.2rem 2.5rem", backgroundColor: "#0f172a", display: "flex", alignItems: "center", gap: "0.8rem", borderBottom: "1px solid #1e293b", zIndex: 100, position: "relative" }}>
          <div style={{ width: "35px", height: "35px", backgroundColor: "#3b82f6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", animation: "floatLogo 4s ease-in-out infinite", flexShrink: 0 }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
               <polyline points="2 17 12 22 22 17"></polyline>
               <polyline points="2 12 12 17 22 12"></polyline>
             </svg>
          </div>
          <div>
            <h1 style={{ color: "white", fontSize: "1.4rem", margin: 0, letterSpacing: "1px", fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>GEONIXA</h1>
            <p style={{ color: "#94a3b8", fontSize: "0.6rem", margin: 0, textTransform: "uppercase", letterSpacing: "1.5px" }}>Corporate Systems</p>
          </div>
        </header>

        <main style={{ flex: 1, position: "relative" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
