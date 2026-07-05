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
        if (role === "brand") {
          router.replace("/brand");
        } else if (role === "partner") {
          router.replace("/partner");
        } else if (role === "creator") {
          router.replace("/home");
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
