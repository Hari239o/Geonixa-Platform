"use client"

import React from "react"
import { motion } from "framer-motion"
import { Logo } from "../ui/Logo"
import { Button } from "../ui/button"
import Link from "next/link"

export function WelcomeScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="flex flex-col items-center justify-center w-full max-w-sm mt-12"
    >
      <Logo large={false} showText={false} className="mb-8" />
      
      <p className="text-white/90 text-center text-sm font-medium mb-12 px-4 leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
      </p>

      <div className="flex flex-col w-full gap-3 px-2">
        <Button asChild variant="yellow" className="w-full font-bold shadow-md rounded-xl h-12">
          <Link href="/auth/login">Sign In</Link>
        </Button>
        
        <Button asChild className="w-full bg-white text-[#FF4D2D] hover:bg-gray-50 font-bold shadow-md rounded-xl h-12">
          <Link href="/auth/category-selection">Sign Up</Link>
        </Button>
      </div>
    </motion.div>
  )
}
