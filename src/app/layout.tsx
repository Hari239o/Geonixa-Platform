import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Geonixa | Enterprise Assessment Terminal",
  description: "Secure, reliable, and AI-monitored online examination platform by Geonixa Corporate Intelligence.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: import("next").Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <Script id="prevent-zoom" strategy="afterInteractive">
          {\`
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
          \`}
        </Script>
      </body>
    </html>
  );
}
