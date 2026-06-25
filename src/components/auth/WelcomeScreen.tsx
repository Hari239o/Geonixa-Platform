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
      className="flex flex-col items-center justify-center w-full mt-[15vh] px-8"
    >
      <Logo large={true} showText={false} className="mb-10" />
      
      <p className="text-white text-center text-[12px] font-medium mb-10 leading-tight tracking-wide">
        Lorem ipsum dolor sit amet, consectetur<br/>adipiscing elit, sed do eiusmod.
      </p>

      <div className="flex flex-col w-full max-w-[240px] gap-3">
        <Link 
          href="/auth/login" 
          className="w-full bg-[#DFEA50] text-[#EF4823] hover:bg-[#D4E03B] h-11 rounded-[10px] flex items-center justify-center font-bold text-[15px] shadow-sm transition-colors"
        >
          Sign In
        </Link>
        
        <Link 
          href="/auth/category-selection" 
          className="w-full bg-[#FAF1DF] text-[#EF4823] hover:bg-[#EBE2D3] h-11 rounded-[10px] flex items-center justify-center font-bold text-[15px] shadow-sm transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </motion.div>
  )
}
