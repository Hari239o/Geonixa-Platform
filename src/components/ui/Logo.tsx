import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  large?: boolean
}

export function Logo({ className, showText = true, large = false }: LogoProps) {
  return (
    <div className={cn("flex flex-row items-center justify-center", className)}>
      <img 
        src={showText ? "/profile.png" : "/logo.png"} 
        alt="Kalinq Logo" 
        className={cn(
          "object-contain", 
          large ? "w-[160px] h-auto" : "w-28 h-auto",
          "drop-shadow-sm"
        )} 
      />
    </div>
  )
}
