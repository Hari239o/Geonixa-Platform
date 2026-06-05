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
  const sizeClasses = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
    xl: "h-48"
  }[size];

  return (
    <div className={`flex items-center ${center ? "justify-center w-full" : ""} ${className}`}>
      <img 
        src="/images/geonixa-logo.png" 
        alt="Geonixa" 
        className={`object-contain ${sizeClasses} w-auto`}
      />
    </div>
  );
}
