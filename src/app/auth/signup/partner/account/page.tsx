"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function PartnerSignupStep3Account() {
 const router = useRouter();
 const [formData, setFormData] = useState({
 username: "",
 password: "",
 });
 const [showPassword, setShowPassword] = useState(false);

 // Load saved data from sessionStorage
 useEffect(() => {
 const saved = sessionStorage.getItem("partnerSignupData");
 if (saved) {
 try {
 const parsed = JSON.parse(saved);
 setTimeout(() => setFormData(prev => ({ ...prev, ...parsed })), 0);
 } catch {}
 }
 }, []);

 const updateFormData = (data: Partial<typeof formData>) => {
 setFormData((prev) => {
 const updated = { ...prev, ...data };
 sessionStorage.setItem("partnerSignupData", JSON.stringify(updated));
 return updated;
 });
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 console.log("Final Partner Signup Data:", JSON.parse(sessionStorage.getItem("partnerSignupData") || "{}"));
 
 // Wait to simulate network
 setTimeout(() => {
 router.push("/auth/login");
 }, 1500);
 };

 return (
 <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col h-full justify-between">
 <div className="flex flex-col gap-4">
 
 {/* Username */}
 <div className="flex flex-col gap-1.5">
 <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Username</Label>
 <Input 
 required
 placeholder="loisbecket@gmail.com" 
 value={formData.username || ""}
 onChange={(e) => updateFormData({ username: e.target.value })}
 className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm"
 />
 </div>

 {/* Password */}
 <div className="flex flex-col gap-1.5">
 <Label className="text-[11px] text-[#A0A0A0] font-medium ml-1">Password</Label>
 <div className="relative">
 <Input 
 required
 type={showPassword ? "text" : "password"}
 placeholder="********" 
 value={formData.password || ""}
 onChange={(e) => updateFormData({ password: e.target.value })}
 className="bg-[#F8F8F8] border-transparent rounded-[14px] h-[52px] px-4 pr-10 text-[14px] text-[#333333] font-medium placeholder:text-[#333333] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-[#FF4D2D] focus-visible:border-[#FF4D2D] shadow-sm tracking-widest"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF4D2D] hover:text-[#FF4D2D]/80 focus:outline-none"
 >
 {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
 </button>
 </div>
 </div>

 </div>

 <div className="mt-2 flex flex-col">
 <Button 
 type="submit" 
 className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-[14px] h-[52px] text-[15px] font-semibold shadow-[0_4px_14px_0_rgba(255,77,45,0.39)] transition-all active:scale-[0.98]"
 >
 Sign Up
 </Button>
 </div>
 </form>
 );
}
