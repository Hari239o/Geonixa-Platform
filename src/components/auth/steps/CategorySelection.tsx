"use client"

import React from "react"

interface CategorySelectionProps {
  onSelect: (category: string) => void
}

export function CategorySelection({ onSelect }: CategorySelectionProps) {
  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="grid grid-cols-2 gap-4">
        {/* Creator Card */}
        <button
          onClick={() => onSelect("Creator")}
          className="col-span-1 aspect-square bg-white border border-gray-100 rounded-[28px] p-6 flex flex-col justify-center items-start text-left relative overflow-hidden group hover:shadow-lg transition-all"
        >
          <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-1">As a</span>
          <span className="text-black font-extrabold text-2xl z-10">Creator</span>
        </button>

        {/* Top Right Decorative Image (from Figma) */}
        <div className="col-span-1 aspect-square rounded-[28px] overflow-hidden bg-gray-100 relative">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200" alt="Model" className="w-full h-full object-cover" />
          {/* Subtle white line decoration matching Figma */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          </svg>
        </div>

        {/* Center Logos Row (Brands) */}
        <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-[28px]">
           <div className="flex w-full items-center justify-center gap-2 mb-4">
             <span className="font-serif font-bold text-sm tracking-widest">CHANEL</span>
             <svg className="w-6 h-6 stroke-gray-300" viewBox="0 0 24 24" fill="none"><path d="M4 20L20 4" strokeWidth="1"/></svg>
           </div>
           <div className="flex w-full items-center justify-between px-2">
             <span className="font-bold text-sm text-red-600">Levi&apos;s</span>
             <span className="font-bold text-xs text-pink-400">PINK</span>
           </div>
        </div>

        {/* Brand Card */}
        <button
          onClick={() => onSelect("Brand")}
          className="col-span-1 aspect-square bg-white border border-gray-100 rounded-[28px] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:shadow-lg transition-all"
        >
          <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-1">As a</span>
          <span className="text-black font-extrabold text-2xl z-10">Brand</span>
        </button>

        {/* Partners / Agency Card */}
        <button
          onClick={() => onSelect("Partners / Agency")}
          className="col-span-1 aspect-square bg-white border border-gray-100 rounded-[28px] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:shadow-lg transition-all"
        >
          <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-1">As a</span>
          <span className="text-black font-extrabold text-[20px] leading-tight z-10">Partners /<br/>Agency</span>
        </button>

        {/* Bottom Right Decorative Image */}
        <div className="col-span-1 aspect-square rounded-[28px] overflow-hidden bg-gray-100 relative">
          <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=200" alt="Photographer" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  )
}
