import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  large?: boolean
}

export function Logo({ className, showText = true, large = false }: LogoProps) {
  return (
    <div className={cn("flex flex-row items-center justify-center gap-2", className)}>
      <img 
        src="/logo.png" 
        alt="Kalinq Logo Icon" 
        className={cn("object-contain", large ? "h-14 sm:h-16 w-auto" : "h-8 w-auto")} 
      />
      {showText && (
        <h1 className={cn(
          "font-bold text-white tracking-wide font-space-grotesk mt-1",
          large ? "text-[48px] sm:text-[56px]" : "text-2xl"
        )}>
          Kalinq
        </h1>
      )}
    </div>
  )
}
