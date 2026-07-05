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
      <body className="flex flex-col items-center justify-center min-h-[100dvh] w-full overflow-hidden">
        <NextAuthProvider>
          <KnockClientProvider>
            {/* Main scrollable container for the entire app, restricted to mobile width on large screens */}
            <main className="w-full h-[100dvh] max-w-[480px] bg-white overflow-hidden relative flex flex-col sm:border-x sm:border-gray-100 sm:shadow-2xl">
              {children}
            </main>
          </KnockClientProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
