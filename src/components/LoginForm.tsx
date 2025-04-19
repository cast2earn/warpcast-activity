"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function LoginForm({
  onLoginAction,
}: {
  onLoginAction: (fid: string) => void;
}) {
  const { login, user, ready } = usePrivy();

  useEffect(() => {
    if (ready && user?.farcaster?.fid) {
      onLoginAction(user.farcaster.fid.toString());
    }
  }, [ready, user, onLoginAction]);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg border-4 border-black font-pixel">
      <h2 className="text-2xl font-bold mb-6 text-center text-text">Login with Warpcast</h2>
      <button
        onClick={login}
        disabled={!ready}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border-2 border-black"
      >
        Login with Warpcast
      </button>
    </div>
  );
}