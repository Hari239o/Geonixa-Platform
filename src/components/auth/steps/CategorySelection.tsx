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
          className="col-span-1 aspect-square bg-primary-red rounded-3xl p-4 flex flex-col justify-center items-start text-left relative overflow-hidden group hover:opacity-90 transition-opacity"
        >
          <span className="text-white font-bold text-2xl leading-tight z-10">Join<br/><span className="text-sm font-medium">as a</span><br/>Creator</span>
          {/* Subtle decoration */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
        </button>

        {/* Top Right Decorative Image (from Figma) */}
        <div className="col-span-1 aspect-square rounded-3xl overflow-hidden bg-gray-100 relative">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200" alt="Model" className="w-full h-full object-cover" />
          {/* Subtle white line decoration matching Figma */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <line x1="0" y1="100" x2="100" y2="0" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
          </svg>
        </div>

        {/* Center Logos Row (Brands) */}
        <div className="col-span-2 flex items-center justify-between py-2 px-2 opacity-60">
           <span className="font-bold text-lg">CHANEL</span>
           <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M24 4.091c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
           <span className="font-bold text-lg text-red-600">Levi&apos;s</span>
           <span className="font-bold text-sm text-pink-400">PINK</span>
        </div>

        {/* Brand Card */}
        <button
          onClick={() => onSelect("Brand")}
          className="col-span-1 aspect-square bg-primary-red rounded-3xl p-4 flex flex-col justify-center items-start text-left relative overflow-hidden group hover:opacity-90 transition-opacity"
        >
          <span className="text-white font-bold text-2xl leading-tight z-10">Join<br/><span className="text-sm font-medium">as a</span><br/>Brand</span>
        </button>

        {/* Partners / Agency Card */}
        <button
          onClick={() => onSelect("Partners / Agency")}
          className="col-span-1 aspect-[1.1] bg-primary-red rounded-3xl p-4 flex flex-col justify-center items-start text-left relative overflow-hidden group hover:opacity-90 transition-opacity"
        >
          <span className="text-white font-bold text-2xl leading-tight z-10">Join<br/><span className="text-sm font-medium">as a</span><br/>Partners /<br/>Agency</span>
        </button>

        {/* Bottom Right Decorative Image */}
        <div className="col-span-1 aspect-square rounded-3xl overflow-hidden bg-gray-100 relative mt-[-20%]">
          <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=200" alt="Photographer" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  )
}
