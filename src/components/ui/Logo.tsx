import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  large?: boolean
}

export function Logo({ className, showText = true, large = false }: LogoProps) {
  return (
    <div className={cn("flex flex-row items-center justify-center gap-3", className)}>
      <img 
        src="/logo.png" 
        alt="Kalinq Logo" 
        className={cn("object-contain", large ? "h-16 sm:h-20 w-auto" : "h-10 w-auto")} 
      />
    </div>
  )
}
