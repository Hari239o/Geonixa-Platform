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
      const handleRedirect = async () => {
        const role = (session.user as any).role || "user";
        let hasProfile = (session.user as any).profileCompleted === true;
        
        if (role === "brand") {
          if (!hasProfile) {
            router.replace("/auth/brand-setup");
          } else {
            let brandType = "individual";
            try {
              const res = await fetch("/api/user/complete-profile");
              if (res.ok) {
                const data = await res.json();
                if (data.profile?.brandType) {
                  brandType = data.profile.brandType;
                } else {
                  // Fallback to local storage if DB is missing brandType
                  const profile = localStorage.getItem("kaling_brand_profile");
                  if (profile) {
                    const parsed = JSON.parse(profile);
                    if (parsed.type === "company" || parsed.brandType === "company") {
                      brandType = "company";
                    }
                  }
                }
              }
            } catch (e) {
              console.error("Failed to fetch profile in callback", e);
            }
            router.replace(brandType === "company" ? "/brand/company" : "/brand");
          }
        } else if (role === "partner") {
          router.replace(hasProfile ? "/partner" : "/partner/setup-profile");
        } else if (role === "creator") {
          router.replace(hasProfile ? "/creator" : "/setup-profile");
        } else {
          router.replace("/auth/category-selection");
        }
      };

      // Small delay for smooth UX
      setTimeout(() => {
        handleRedirect();
      }, 500);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-primary-red p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <img src="/logo.png" alt="Kalinq Logo" className="mb-8 w-32 sm:w-40 h-auto object-contain animate-pulse" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center tracking-tight drop-shadow-md">Setting up your experience...</h2>
        <p className="text-white/80 text-sm sm:text-base font-medium text-center">Please wait while we securely log you in.</p>
        <div className="mt-8 flex gap-2">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
