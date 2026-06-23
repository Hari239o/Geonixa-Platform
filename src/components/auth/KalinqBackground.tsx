import React from "react"

export function KalinqBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#FF4D2D] pointer-events-none">
      
      {/* 1. Large Rounded Abstract Blocks */}
      {/* Top Left / Center shape */}
      <div 
        className="absolute top-[-10%] left-[-20%] w-[80%] h-[70%] bg-[#FF4D2D] rounded-[100px] opacity-80 mix-blend-normal transform rotate-12" 
        style={{ filter: "blur(20px)" }} 
      />
      
      {/* Bottom Right shape */}
      <div 
        className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[60%] bg-[#FF4D2D] rounded-[80px] opacity-80 mix-blend-normal transform -rotate-[15deg]" 
        style={{ filter: "blur(20px)" }}
      />
      
      {/* 2. Diagonal Translucent Stripe */}
      <div 
        className="absolute top-[20%] left-[-30%] w-[160%] h-[25%] bg-[#FF7A5D] opacity-40 transform -rotate-[35deg]" 
        style={{ filter: "blur(10px)" }}
      />
      
      {/* 3. Subtle Grid Pattern */}
      {/* Base grid using linear-gradient */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(to right, #FFFFFF 1px, transparent 1px),
            linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* 4. Light Particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[15%] left-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_4px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-[45%] right-[25%] w-2 h-2 bg-white rounded-full shadow-[0_0_10px_5px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-[30%] left-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_6px_3px_rgba(255,255,255,0.4)]" />
        <div className="absolute bottom-[20%] right-[40%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_4px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-[10%] right-[10%] w-1 h-1 bg-white rounded-full shadow-[0_0_6px_3px_rgba(255,255,255,0.4)]" />
        <div className="absolute top-[60%] left-[5%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_4px_rgba(255,255,255,0.4)]" />
      </div>

      {/* Top gradient overlay to blend colors smoothly */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF4D2D]/10 to-transparent mix-blend-overlay" />
    </div>
  )
}
