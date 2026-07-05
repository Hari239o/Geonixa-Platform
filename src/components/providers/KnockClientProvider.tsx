"use client";

import React, { useEffect, useState } from "react";
import { KnockProvider, KnockFeedProvider } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";

export function KnockClientProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a fallback string for SSR so the provider doesn't unmount and break child pages
  const [userId, setUserId] = useState<string | null>("ssr-fallback");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let storedId = localStorage.getItem("kalinq_mock_user_id");
    if (!storedId) {
      storedId = "user_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("kalinq_mock_user_id", storedId);
    }
    setUserId(storedId);
  }, []);

  const knockPublicKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  const knockFeedChannelId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  if (!knockPublicKey || !knockFeedChannelId) {
    console.error("Missing Knock Environment Variables. Notifications will not work.");
    return <>{children}</>;
  }

  // During SSR, we provide the provider to prevent errors in pages that call useKnockFeed
  return (
    <KnockProvider apiKey={knockPublicKey} userId={userId || "ssr-fallback"}>
      <KnockFeedProvider feedId={knockFeedChannelId}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}
