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
        <main style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
