"use client";

import { useEffect } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import ActivityDisplay from "@/components/ActivityDisplay";
import { sdk } from "@farcaster/frame-sdk";

export default function Home() {
  const { authenticated, user } = usePrivy();
  const { login } = useLogin({
    onComplete: ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
      console.log("Login completed:", { user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount });
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
  const fid = user?.farcaster?.fid;

  // Inisialisasi Mini App
  useEffect(() => {
    async function initializeMiniApp() {
      try {
        await sdk.actions.ready();
        console.log("Mini App ready for Warpcast");
      } catch (error) {
        console.error("Failed to initialize Mini App:", error);
      }
    }
    initializeMiniApp();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100 font-pixel">
      {authenticated && fid ? (
        <ActivityDisplay fid={fid.toString()} />
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-text">Farcaster Activity</h1>
          <p className="text-text mb-4">Please log in with Warpcast to view your activity.</p>
          <button
            onClick={login}
            className="px-4 py-2 bg-yellow-200 text-text font-bold border-2 border-black rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Login with Warpcast
          </button>
        </div>
      )}
    </main>
  );
}