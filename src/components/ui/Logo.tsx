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
          className={cn("bg-[#EF4423]", large ? "w-[180px] h-[60px]" : "w-[140px] h-[46px]", className)}
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
        <div 
          className={cn("bg-current", large ? "w-[160px] h-[52px]" : "w-[40px] h-[40px]", className)}
          style={{
            WebkitMaskImage: 'url(/logo.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/logo.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center'
          }}
        />
      )}
    </div>
  )
}
