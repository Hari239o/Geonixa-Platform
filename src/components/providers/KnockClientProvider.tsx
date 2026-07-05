"use client";

import React, { useEffect, useState } from "react";
import { KnockProvider, KnockFeedProvider } from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";

export function KnockClientProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Generate a permanent mock user ID for this browser if it doesn't exist
    // In a real app, this would come from your auth provider (e.g. NextAuth session.user.id)
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

  // We only initialize Knock once we have a userId to avoid errors
  if (!userId) {
    return <>{children}</>;
  }

  return (
    <KnockProvider apiKey={knockPublicKey} userId={userId}>
      <KnockFeedProvider feedId={knockFeedChannelId}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}
