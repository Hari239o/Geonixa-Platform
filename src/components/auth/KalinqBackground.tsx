import React from "react"
import Image from "next/image"

export function KalinqBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#EF4823] pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] mix-blend-overlay">
        <div className="relative w-[150vh] h-[150vh] flex items-center justify-center">
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
