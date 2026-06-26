import React from "react"
import Image from "next/image"

export function KalinqBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.15]">
        <div className="relative w-[140vh] h-[140vh] flex items-center justify-center">
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
