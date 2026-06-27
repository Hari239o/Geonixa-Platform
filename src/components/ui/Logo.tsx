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
        className={cn("object-contain", large ? "w-[160px] h-[160px]" : "w-10")} 
      />
      {showText && (
        <h1 className={cn(
          "font-bold text-white tracking-wide font-space-grotesk mt-1",
          large ? "text-7xl" : "text-2xl"
        )}>
          Kalinq
        </h1>
      )}
    </div>
  )
}
