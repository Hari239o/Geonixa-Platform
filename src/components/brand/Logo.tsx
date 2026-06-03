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
  const h = { sm: 70, md: 110, lg: 180, xl: 275 }[size];

  return (
    <div className={`flex items-center ${center ? "justify-center w-full" : ""} ${className}`} style={{ height: h }}>
      <img 
        src="/images/geonixa-logo.png" 
        alt="Geonixa" 
        style={{ height: h, width: "auto" }} 
        className="object-contain" 
      />
    </div>
  );
}
