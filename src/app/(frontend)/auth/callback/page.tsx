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
          router.replace(hasProfile ? "/brand" : "/brand/setup-company");
        } else if (role === "partner") {
          router.replace(hasProfile ? "/partner" : "/partner/setup-profile");
        } else if (role === "creator") {
          router.replace(hasProfile ? "/creator" : "/setup-profile");
        } else {
          router.replace("/dashboard");
        }
      }, 500);
    }
  }, [status, session, router]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <Logo large={false} showText={false} className="mb-6 w-12 h-12 animate-pulse" />
      <h1 className="text-2xl font-bold text-text-dark mb-2">Authenticating...</h1>
      <p className="text-text-light text-sm">Please wait while we log you in.</p>
    </div>
  );
}
