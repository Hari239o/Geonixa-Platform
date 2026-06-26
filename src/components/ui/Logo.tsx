import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  large?: boolean
  textColor?: string
}

export function Logo({ className, showText = true, large = false, textColor = "text-white" }: LogoProps) {
  return (
    <div className={cn("flex flex-row items-center justify-center gap-3", className)}>
      <img 
        src="/logo.png" 
        alt="Kalinq Logo" 
        className={cn("object-contain", large ? "w-[160px] h-[160px]" : "w-10")} 
      />
      {showText && (
        <h1 className={cn(textColor, "font-bold tracking-tight", large ? "text-5xl" : "text-3xl")}>
          Kalinq
        </h1>
      )}
    </div>
  )
}
