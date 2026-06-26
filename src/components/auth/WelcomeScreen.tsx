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
 <Logo large={true} showText={false} className="mb-12" />
 
 <p className="text-white/90 text-center text-sm font-medium mb-12 px-4 leading-relaxed">
 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.
 </p>

 <div className="flex flex-col w-full gap-4">
 <Button asChild variant="yellow" size="lg" className="w-full font-bold shadow-lg">
 <Link href="/auth/login">Sign In</Link>
 </Button>
 
 <Button asChild variant="default" size="lg" className="w-full bg-white text-primary-red hover:bg-gray-50 font-bold shadow-lg">
 <Link href="/auth/signup">Sign Up</Link>
 </Button>
 </div>
 </motion.div>
 )
}
