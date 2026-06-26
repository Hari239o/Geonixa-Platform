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
  <html lang="en" className={`${inter.variable} h-full antialiased`}>
  <body className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-gray-50">
  <NextAuthProvider>
  {children}
  </NextAuthProvider>
  </body>
  </html>
  );
}
