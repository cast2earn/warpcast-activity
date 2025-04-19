import { NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { Redis } from "@upstash/redis";

// Tipe kustom untuk cast
interface NeynarCast {
  hash: string;
  parent_hash: string | null;
  reactions: {
    likes?: Array<{ fid: number }>;
    recasts?: Array<{ fid: number }>;
  };
  replies: {
    count: number;
  };
}

// Tipe kustom untuk reaksi
interface NeynarReaction {
  reaction_type: "like" | "recast"; // Sesuaikan dengan nilai API (huruf kecil)
  cast?: {
    hash: string;
  };
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const client = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY! });
const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL!,
  token: UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "FID is required" }, { status: 400 });
  }

  // Cek cache terlebih dahulu
  const cacheKey = `activity:${fid}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache hit for FID:", fid);
    return NextResponse.json(cached);
  }

  try {
    // Ambil semua cast dengan pagination
    let allCasts: NeynarCast[] = [];
    let cursor: string | undefined;
    do {
      const response = await client.fetchCastsForUser({
        fid: Number(fid),
        limit: 100,
        cursor,
      });
      allCasts = allCasts.concat(response.casts as NeynarCast[]);
      cursor = response.next?.cursor ?? undefined;
    } while (cursor);

    const totalCasts = allCasts.length;
    const totalRepliesSent = allCasts.filter((cast) => cast.parent_hash).length;

    // Ambil likes yang dikirim dengan pagination
    let allLikesSent: NeynarReaction[] = [];
    cursor = undefined;
    do {
      const response = await client.fetchUserReactions({
        fid: Number(fid),
        type: "likes",
        limit: 100,
        cursor,
      });
      allLikesSent = allLikesSent.concat(response.reactions as NeynarReaction[]);
      cursor = response.next?.cursor ?? undefined;
    } while (cursor);

    // Ambil recasts yang dikirim dengan pagination
    let allRecastsSent: NeynarReaction[] = [];
    cursor = undefined;
    do {
      const response = await client.fetchUserReactions({
        fid: Number(fid),
        type: "recasts",
        limit: 100,
        cursor,
      });
      allRecastsSent = allRecastsSent.concat(response.reactions as NeynarReaction[]);
      cursor = response.next?.cursor ?? undefined;
    } while (cursor);

    const totalLikesSent = allLikesSent.length;
    const totalRecastsSent = allRecastsSent.length;

    // Ambil reaksi yang diterima (likes dan recasts received)
    let totalLikesReceived = 0;
    let totalRecastsReceived = 0;
    let totalRepliesReceived = 0;
    for (const cast of allCasts) {
      totalLikesReceived += cast.reactions?.likes?.length || 0;
      totalRecastsReceived += cast.reactions?.recasts?.length || 0;
      totalRepliesReceived += cast.replies?.count || 0;
    }

    const result = {
      totalCasts,
      totalLikesSent,
      totalRecastsSent,
      totalRepliesSent,
      totalLikesReceived,
      totalRecastsReceived,
      totalRepliesReceived,
    };

    // Simpan hasil ke cache dengan TTL 1 jam (3600 detik)
    await redis.set(cacheKey, result, { ex: 3600 });
    console.log("Cache set for FID:", fid);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}