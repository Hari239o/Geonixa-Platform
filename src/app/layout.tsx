import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="flex flex-col">
        <NextAuthProvider>
          {/* Main scrollable container for the entire app */}
          <main className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden touch-pan-y overscroll-none relative">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
