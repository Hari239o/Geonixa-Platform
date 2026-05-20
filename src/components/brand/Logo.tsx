"use client";
import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  center?: boolean;
  variant?: "light" | "dark";
  animated?: boolean;
}

export default function Logo({
  className = "",
  showText = true,
  size = "md",
  center = false,
  variant = "light",
  animated = true,
}: LogoProps) {
  const h = { sm: 28, md: 44, lg: 72, xl: 110 }[size];
  const orange  = "#FF6B00";
  const gray    = variant === "dark" ? "#94A3B8" : "#6B7280";
  const divider = variant === "dark" ? "rgba(148,163,184,0.4)" : "rgba(107,114,128,0.35)";
  const ink     = variant === "dark" ? "#FFFFFF" : orange;

  return (
    <div className={`flex items-center ${center ? "justify-center w-full" : ""} ${className}`} style={{ height: h }}>
      {/*
        viewBox: 820 × 200
        Symbol centred at (100,100)
        Divider at x=210
        Wordmark group translate(240,100) — letters use relative coords
      */}
      <svg viewBox="0 0 820 200" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ height: h, width: "auto", overflow: "visible" }} role="img" aria-label="Geonixa">
        <title>Geonixa</title>

        {/* ── 4 DIAGONAL CONVERGING ARROWS ── */}
        <g transform="translate(100,100)" strokeLinecap="round" strokeLinejoin="round">
          {/* TL ↘ */}
          <line x1="-60" y1="-60" x2="-18" y2="-18" stroke={gray} strokeWidth="12"/>
          <polyline points="-18,-36 -18,-18 -36,-18" stroke={gray} strokeWidth="12" fill="none"/>
          {/* TR ↙ */}
          <line x1="60" y1="-60" x2="18" y2="-18" stroke={gray} strokeWidth="12"/>
          <polyline points="36,-18 18,-18 18,-36" stroke={gray} strokeWidth="12" fill="none"/>
          {/* BR ↖ */}
          <line x1="60" y1="60" x2="18" y2="18" stroke={gray} strokeWidth="12"/>
          <polyline points="36,18 18,18 18,36" stroke={gray} strokeWidth="12" fill="none"/>
          {/* BL ↗ ORANGE */}
          <line x1="-60" y1="60" x2="-18" y2="18" stroke={orange} strokeWidth="14">
            {animated && <animate attributeName="strokeOpacity" values="1;0.5;1" dur="2.4s" repeatCount="indefinite"/>}
          </line>
          <polyline points="-18,36 -18,18 -36,18" stroke={orange} strokeWidth="14" fill="none">
            {animated && <animate attributeName="strokeOpacity" values="1;0.5;1" dur="2.4s" repeatCount="indefinite"/>}
          </polyline>
        </g>

        {/* ── DIVIDER ── */}
        {showText && <rect x="210" y="46" width="3" height="108" rx="1.5" fill={divider}/>}

        {/* ── WORDMARK ── G E O N I X A
            All letters use translate(offset,0) with coords relative to their own centre.
            Positions (offset): G=0  E=96  O=192  N=286  I=366  X=418  A=496
            Right edge of A: 496+26=522  →  abs: 240+522=762  fits in 820
        */}
        {showText && (
          <g transform="translate(240,100)" stroke={ink} strokeWidth="13.5"
             strokeLinecap="round" strokeLinejoin="round" fill="none">

            {/* ── G ── Pro MNC Letterform */}
            <g transform="translate(0,0)">
              <path d="
                M 38,-15
                C 38,-38  22,-48  0,-48
                C -22,-48 -40,-30 -40,0
                C -40,30  -22,48  0,48
                C 22,48   38,38   38,15
                L 38,0
                L 12,0
              "/>
            </g>

            {/* ── E ── */}
            <g transform="translate(98,0)">
              <line x1="-28" y1="-46" x2="-28" y2="46"/>
              <line x1="-28" y1="-46" x2="28"  y2="-46"/>
              <line x1="-28" y1="0"   x2="22"  y2="0"/>
              <line x1="-28" y1="46"  x2="28"  y2="46"/>
            </g>

            {/* ── O ── */}
            <g transform="translate(196,0)">
              <ellipse cx="0" cy="0" rx="38" ry="48"/>
            </g>

            {/* ── N ── */}
            <g transform="translate(296,0)">
              <line x1="-25" y1="46"  x2="-25" y2="-46"/>
              <line x1="-25" y1="-46" x2="25"  y2="46"/>
              <line x1="25"  y1="46"  x2="25"  y2="-46"/>
            </g>

            {/* ── I ── */}
            <g transform="translate(378,0)">
              <line x1="0" y1="-46" x2="0" y2="46"/>
            </g>

            {/* ── X ── */}
            <g transform="translate(450,0)">
              <line x1="-25" y1="-46" x2="25" y2="46"/>
              <line x1="25"  y1="-46" x2="-25" y2="46"/>
            </g>

            {/* ── A ── Clean & Symmetrical */}
            <g transform="translate(534,0)">
              <line x1="-28" y1="46"  x2="0"  y2="-48"/>
              <line x1="0"   y1="-48" x2="28" y2="46"/>
              <line x1="-16" y1="12"  x2="16" y2="12"/>
            </g>

          </g>
        )}
      </svg>
    </div>
  );
}
