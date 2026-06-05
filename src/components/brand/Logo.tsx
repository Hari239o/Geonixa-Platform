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
}: LogoProps) {
  const sizeClasses = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-6xl"
  }[size];

  return (
    <div className={`flex flex-col items-start ${center ? "items-center text-center w-full" : ""} ${className}`}>
      <span className={`${sizeClasses} font-black tracking-[0.25em] text-slate-900 uppercase`}>Geonixa</span>
    </div>
  );
}
