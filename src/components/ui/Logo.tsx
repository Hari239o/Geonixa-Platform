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
      {showText ? (
        <div 
          className={cn("bg-[#EF4823]", large ? "w-[160px] h-[54px]" : "w-[120px] h-[40px]", className)}
          style={{
            WebkitMaskImage: 'url(/kalinq-company-name-profile.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/kalinq-company-name-profile.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center'
          }}
        />
      ) : (
        <img 
          src="/logo.png" 
          alt="Kalinq Logo" 
          className={cn(
            "object-contain drop-shadow-sm", 
            large ? "w-[160px] h-auto" : "w-28 h-auto"
          )} 
        />
      )}
    </div>
  )
}
