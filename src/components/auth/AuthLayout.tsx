import React from "react"
import { KalinqBackground } from "./KalinqBackground"

interface AuthLayoutProps {
 children: React.ReactNode
 showPattern?: boolean
}

export function AuthLayout({ children, showPattern = true }: AuthLayoutProps) {
 return (
 <div className="min-h-screen w-full bg-primary-red flex flex-col justify-center items-center relative overflow-hidden">
 {/* Reusable Kalinq Background */}
 {showPattern && <KalinqBackground />}

 {/* Main Content Area */}
 <div className="z-10 w-full px-6 flex flex-col items-center">
 {children}
 </div>
 </div>
 )
}
