"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function DualRangeSlider({ min, max, value, onChange }: DualRangeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current || !isDragging) return;

      const rect = containerRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      let newValue = Math.round(percent * (max - min) + min);

      if (isDragging === 'min') {
        newValue = Math.min(newValue, value[1] - 1);
        onChange([newValue, value[1]]);
      } else {
        newValue = Math.max(newValue, value[0] + 1);
        onChange([value[0], newValue]);
      }
    },
    [isDragging, min, max, value, onChange]
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => handleMove(e.clientX);
    const handlePointerUp = () => setIsDragging(null);

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="relative w-full h-12 flex items-center select-none touch-none" ref={containerRef}>
      {/* Track */}
      <div className="absolute left-0 right-0 h-1 bg-gray-200 rounded-full mx-1">
        {/* Active Range */}
        <div
          className="absolute h-full bg-[#EF4823] rounded-full"
          style={{
            left: `${getPercent(value[0])}%`,
            width: `${getPercent(value[1]) - getPercent(value[0])}%`,
          }}
        />
      </div>

      {/* Min Thumb */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
        style={{ left: `${getPercent(value[0])}%` }}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging('min');
        }}
      >
        <div className="w-5 h-5 bg-white border-2 border-[#EF4823] rounded-full shadow-md z-10 hover:scale-110 transition-transform"></div>
        <span className="text-[#1E1B4B] font-bold text-[11px] mt-2 absolute top-full">₹{value[0]}k</span>
      </div>

      {/* Max Thumb */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
        style={{ left: `${getPercent(value[1])}%` }}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging('max');
        }}
      >
        <div className="w-5 h-5 bg-white border-2 border-[#EF4823] rounded-full shadow-md z-10 hover:scale-110 transition-transform"></div>
        <span className="text-[#1E1B4B] font-bold text-[11px] mt-2 absolute top-full">₹{value[1]}k</span>
      </div>
    </div>
  );
}
