import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF5A1F",
};

export const metadata: Metadata = {
  title: "Geonixa | Enterprise Assessment Terminal",
  description: "Secure, reliable, and AI-monitored online examination platform by Geonixa Corporate Intelligence.",
  icons: {
    icon: "/favicon.ico",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-slate-900 antialiased selection:bg-[#FF5A1F] selection:text-white`}>
        {children}
        <Script id="prevent-zoom" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+')) {
                e.preventDefault();
              }
            });
            document.addEventListener('wheel', function(e) {
              if (e.ctrlKey) {
                e.preventDefault();
              }
            }, { passive: false });
          `
        }} />
      </body>
    </html>
  );
}
