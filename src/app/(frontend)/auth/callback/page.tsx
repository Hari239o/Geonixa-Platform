"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      // Small delay for smooth UX
      setTimeout(() => {
        const role = (session.user as any).role || "user";
        const hasProfile = (session.user as any).profileCompleted === true;
        
        if (role === "brand") {
          router.replace(hasProfile ? "/brand" : "/auth/brand-setup");
        } else if (role === "partner") {
          router.replace(hasProfile ? "/partner" : "/partner/setup-profile");
        } else if (role === "creator") {
          router.replace(hasProfile ? "/creator" : "/setup-profile");
        } else {
          router.replace("/auth/category-selection");
        }
      }, 500);
    }
  }, [status, session, router]);

  return (
    <div className="w-full max-w-sm bg-white p-10 rounded-[30px] shadow-2xl flex flex-col items-center justify-center min-h-[350px] mx-auto z-20 relative border border-gray-100">
      <Logo large={false} showText={false} className="mb-6 w-14 h-14 animate-pulse" />
      <h1 className="text-[22px] font-black tracking-tight text-text-dark mb-3">Authenticating...</h1>
      <p className="text-text-light text-sm font-medium text-center leading-relaxed">Please wait while we securely set up your session.</p>
    </div>
  );
}
