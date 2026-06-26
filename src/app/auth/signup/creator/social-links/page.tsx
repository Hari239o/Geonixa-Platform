"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreatorSignupStep3Socials() {
 const router = useRouter();
 const [formData, setFormData] = useState({
 instagram: "",
 x: "",
 behance: "",
 portfolioUrl: "",
 });

 // Load saved data from sessionStorage
 useEffect(() => {
 const saved = sessionStorage.getItem("creatorSignupData");
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
 sessionStorage.setItem("creatorSignupData", JSON.stringify(updated));
 return updated;
 });
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 console.log("Final Creator Signup Data:", JSON.parse(sessionStorage.getItem("creatorSignupData") || "{}"));
 // Wait to simulate network
 setTimeout(() => {
 router.push("/auth/login");
 }, 1500);
 };

 return (
 <form onSubmit={handleSubmit} className="w-full p-5 sm:p-6 flex flex-col h-full justify-between">
 
 <div className="flex flex-col gap-4">
 <Label className="text-sm font-semibold text-slate-700 mb-4">Social links</Label>
 
 <div className="flex flex-col gap-4">
 <Input 
 placeholder="Instagram" 
 value={formData.instagram || ""}
 onChange={(e) => updateFormData({ instagram: e.target.value })}
 className="bg-[#F5F5F5] border-slate-200 rounded-xl h-12 shadow-sm focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
 />
 <Input 
 placeholder="X (Twitter)" 
 value={formData.x || ""}
 onChange={(e) => updateFormData({ x: e.target.value })}
 className="bg-[#F5F5F5] border-slate-200 rounded-xl h-12 shadow-sm focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
 />
 <Input 
 placeholder="Behance" 
 value={formData.behance || ""}
 onChange={(e) => updateFormData({ behance: e.target.value })}
 className="bg-[#F5F5F5] border-slate-200 rounded-xl h-12 shadow-sm focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
 />
 <Input 
 placeholder="Portfolio URL" 
 value={formData.portfolioUrl || ""}
 onChange={(e) => updateFormData({ portfolioUrl: e.target.value })}
 className="bg-[#F5F5F5] border-slate-200 rounded-xl h-12 shadow-sm focus-visible:ring-[#FF4D2D]/20 focus-visible:border-[#FF4D2D]"
 />
 </div>
 </div>

 <div className="pt-2">
 <Button 
 type="submit" 
 className="w-full bg-[#FF4D2D] hover:bg-[#FF4D2D]/90 text-white rounded-xl h-12 text-base font-semibold shadow-md shadow-[#FF4D2D]/20"
 >
 Next
 </Button>
 </div>
 </form>
 );
}
