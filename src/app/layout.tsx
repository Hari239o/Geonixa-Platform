import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Kalinq",
 description: "SaaS Platform for Creators and Brands",
};

export const viewport: import("next").Viewport = {
 width: "device-width",
 initialScale: 1,
 maximumScale: 1,
 userScalable: false,
};

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { KnockClientProvider } from "@/components/providers/KnockClientProvider";

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-[#F8F9FB]`}>
      <body className="flex flex-col min-h-[100dvh] w-full overflow-hidden bg-white">
        <NextAuthProvider>
          <KnockClientProvider>
            {/* Main container for the entire app, fills screen fully */}
            <main className="w-full h-[100dvh] bg-white overflow-hidden relative flex flex-col flex-1">
              {children}
            </main>
          </KnockClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
