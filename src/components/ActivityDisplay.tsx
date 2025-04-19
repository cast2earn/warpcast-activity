"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Press_Start_2P } from "next/font/google";
import { sdk } from "@farcaster/frame-sdk";

// Konfigurasi font Press Start 2P
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface ActivityData {
  totalCasts: number;
  totalLikesSent: number;
  totalRecastsSent: number;
  totalRepliesSent: number;
  totalLikesReceived: number;
  totalRecastsReceived: number;
  totalRepliesReceived: number;
}

const calculateTotalPoints = (data: ActivityData): number => {
  return (
    data.totalCasts * 5 +
    data.totalLikesSent * 1 +
    data.totalLikesReceived * 2 +
    data.totalRecastsSent * 3 +
    data.totalRecastsReceived * 5 +
    data.totalRepliesSent * 3 +
    data.totalRepliesReceived * 5
  );
};

export default function ActivityDisplay({ fid }: { fid: string }) {
  const { user } = usePrivy();
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [referralPoints, setReferralPoints] = useState(0);
  const [userInviteCode, setUserInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    // Fetch data aktivitas dan referral
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch aktivitas
        const activityResponse = await fetch(`/api/activity?fid=${fid}`);
        if (!activityResponse.ok) throw new Error("Failed to fetch activity");
        const activityData = await activityResponse.json();
        setData(activityData);

        // Fetch atau buat kode invite pengguna
        const inviteResponse = await fetch(`/api/referral?fid=${fid}`);
        if (!inviteResponse.ok) throw new Error("Failed to fetch invite code");
        const inviteData = await inviteResponse.json();
        setUserInviteCode(inviteData.inviteCode || "");
        setReferralPoints(inviteData.referralPoints || 0);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Cek apakah popup Add Frame sudah ditampilkan di sesi ini
    const triggerAddFrame = async () => {
      const hasShownAddFrame = sessionStorage.getItem("hasShownAddFrame");
      if (!hasShownAddFrame && user?.farcaster?.fid) {
        try {
          await sdk.actions.addFrame();
          console.log("Add Frame popup displayed successfully");
          sessionStorage.setItem("hasShownAddFrame", "true");
        } catch (_err) {
          console.error("Add Frame error:", _err);
          if (_err instanceof Error && _err.message.includes("rejected_by_user")) {
            console.log("User rejected Add Frame prompt");
          }
          sessionStorage.setItem("hasShownAddFrame", "true");
        }
      }
    };

    if (user?.farcaster?.fid) {
      fetchData();
      triggerAddFrame();
    } else {
      setLoading(false);
    }
  }, [fid, user]);

  const handleShareApp = () => {
    if (!data) return;

    setIsSharing(true);
    try {
      const intentUrl = `https://warpcast.com/~/compose?text=A%20new%20ways%20to%20interact%20on%20Warpcast%20by%20%40cast2earn%20%F0%9F%94%A5%20%F0%9F%94%A5%20%F0%9F%94%A5%0ATurn%20your%20activity%20on%20warpcast%20into%20point%20%3D%20rewards%20%F0%9F%91%8C&embeds[]=https%3A%2F%2Fwww.cast2earn.fun`;
      window.open(intentUrl, "_blank");
    } catch (error) {
      console.error("Error sharing app:", error);
      alert("Failed to share app. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSubmitInvite = async () => {
    if (!inviteCode || !user?.farcaster?.fid) return;

    try {
      const response = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, fid: user.farcaster.fid }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }

      const result = await response.json();
      setReferralPoints(result.referralPoints || 0);
      setInviteSuccess("Invite code applied! You and your friend earned 100 points.");
      setInviteError("");
      setInviteCode("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to apply invite code.";
      setInviteError(message);
      setInviteSuccess("");
    }
  };

  if (loading) {
    return (
      <div
        className={`w-full max-w-[400px] mx-auto p-4 bg-gray-100 rounded-lg shadow-lg border-4 border-black font-pixel overflow-y-auto max-h-[650px] ${pressStart2P.className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full max-w-[400px] mx-auto p-4 bg-gray-100 rounded-lg shadow-lg border-4 border-black font-pixel overflow-y-auto max-h-[650px] ${pressStart2P.className}`}
      >
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[400px] mx-auto p-4 bg-gray-100 rounded-lg shadow-lg border-4 border-black font-pixel overflow-y-auto max-h-[650px] ${pressStart2P.className}`}
    >
      <h2 className="text-xl font-bold mb-4 text-center text-text">Your Warpcast Activity</h2>
      <div className="grid gap-3">
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Total Casts</h3>
          <p className="text-text">{data?.totalCasts}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Likes Sent</h3>
          <p className="text-text">{data?.totalLikesSent}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Recasts Sent</h3>
          <p className="text-text">{data?.totalRecastsSent}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Replies Sent</h3>
          <p className="text-text">{data?.totalRepliesSent}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Likes Received</h3>
          <p className="text-text">{data?.totalLikesReceived}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Recasts Received</h3>
          <p className="text-text">{data?.totalRecastsReceived}</p>
        </div>
        <div className="p-3 bg-white rounded-md border-2 border-black">
          <h3 className="text-base font-semibold text-text">Replies Received</h3>
          <p className="text-text">{data?.totalRepliesReceived}</p>
        </div>
        <div className="p-3 bg-yellow-200 rounded-md border-2 border-black mt-3 flex items-center gap-2 animate-fade-in">
          <span className="text-xl">🏆</span>
          <div>
            <h3 className="text-base font-semibold text-text">Total Activity Points</h3>
            <p className="text-text">{data ? calculateTotalPoints(data).toLocaleString() : 0}</p>
            <h3 className="text-base font-semibold text-text mt-2">Total Referral Points</h3>
            <p className="text-text">{referralPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold text-text">Your Invite Code</h3>
        <p className="text-text break-all">{userInviteCode || "Generating..."}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold text-text">Enter Invite Code</h3>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter friend's invite code"
          className="w-full px-2 py-1 mt-1 text-sm border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleSubmitInvite}
          disabled={!inviteCode || !data}
          className="mt-2 w-full px-4 py-2 bg-[#0052FF] text-white font-bold border-2 border-black rounded-md hover:bg-[#0033CC] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
        >
          Submit Invite Code
        </button>
        {inviteError && <p className="mt-2 text-red-600 text-sm">{inviteError}</p>}
        {inviteSuccess && <p className="mt-2 text-green-600 text-sm">{inviteSuccess}</p>}
      </div>
      <button
        onClick={handleShareApp}
        disabled={isSharing || !data}
        className="mt-4 w-full px-4 py-2 bg-[#0052FF] text-white font-bold border-2 border-black rounded-md hover:bg-[#0033CC] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black"
      >
        {isSharing ? "Sharing..." : "Share This App"}
      </button>
    </div>
  );
}