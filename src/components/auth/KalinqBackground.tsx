import React from "react"
import Image from "next/image"

export function KalinqBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] mix-blend-overlay">
        <div className="relative w-full h-full scale-[2.0] sm:scale-[1.5] flex items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Kalinq Watermark" 
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}
