"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error("Privy App ID is missing. Please set NEXT_PUBLIC_PRIVY_APP_ID in environment variables.");
    return <div>Error: Privy configuration is missing. Please contact the administrator.</div>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["farcaster"],
        appearance: { theme: "light" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}