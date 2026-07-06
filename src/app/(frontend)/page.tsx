"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { KalinqBackground } from "@/components/auth/KalinqBackground"
import { Button } from "@/components/ui/button"

export default function WelcomeAndSplashScreen() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Show splash screen for 2.5 seconds before fading into the Welcome Screen
    const timer = setTimeout(() => {
      // Check NextAuth session
      if (status === "authenticated" && session?.user) {
        // We push to auth/callback because it already has the logic to route to /brand, /creator, etc. based on role/profile
        router.replace("/auth/callback")
        return
      }
      
      // Fallback check for local storage mock session
      const localRole = localStorage.getItem("userRole")
      if (localRole === "brand" && localStorage.getItem("kaling_brand_profile")) {
        router.replace("/brand")
        return
      } else if (localRole === "creator" && localStorage.getItem("kaling_user_profile")) {
        router.replace("/creator")
        return
      }

      // If not authenticated, show the Welcome screen (Sign In / Sign Up)
      setShowSplash(false)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [status, session, router])

 return (
 <div className="relative min-h-[100dvh] h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden bg-primary-red" style={{ backgroundColor: '#EF4823' }}>
 {/* Background shapes (Matches both screens in Figma) */}
 <KalinqBackground />

 <AnimatePresence mode="wait">
 {showSplash ? (
 /* --- SPLASH SCREEN --- */
 <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center min-h-[100dvh] w-full"
            >
              <img 
                src="/profile.png" 
                alt="Kalinq Logo" 
                className="w-48 sm:w-56 h-auto object-contain filter brightness-0 invert drop-shadow-md" 
              />
            </motion.div>
 ) : (
 /* --- WELCOME SCREEN --- */
 <motion.div
 key="welcome"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.6 }}
 className="relative z-10 w-full max-w-sm px-8 flex flex-col items-center justify-center min-h-[100dvh]"
 >
 {/* Giant Logo Animation (No Kalinq text below it) */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 transition={{ duration: 0.6, ease: "easeOut" }}
 className="flex flex-col items-center justify-center w-full mb-8"
 >
 <img 
 src="/logo.png" 
 alt="Kalinq" 
 className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl" 
 />
 
 <p className="text-white mt-6 font-medium text-[13px] leading-relaxed tracking-wide text-center max-w-[280px]">
 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
 </p>
 </motion.div>

 {/* Action Buttons */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
 className="w-full flex flex-col gap-4"
 >
 {/* Primary CTA = Sign In (Yellow) */}
 <Button 
 onClick={() => router.push("/auth/login")}
 className="w-full h-14 bg-button-yellow text-text-dark hover:bg-button-yellow/90 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
 >
 Sign In
 </Button>

 {/* Secondary CTA = Sign Up (White) */}
 <Button 
 onClick={() => router.push("/auth/category-selection")}
 className="w-full h-14 bg-white text-primary-red hover:bg-white/90 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
 >
 Sign Up
 </Button>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
