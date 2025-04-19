import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fid = url.searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "Missing fid" }, { status: 400 });
  }

  try {
    // Ambil atau buat kode invite
    let inviteCode = await redis.hget(`user:${fid}`, "inviteCode");
    if (!inviteCode) {
      inviteCode = randomUUID().slice(0, 8); // Kode unik 8 karakter
      await redis.hset(`user:${fid}`, { inviteCode });
      await redis.set(`invite:${inviteCode}`, fid);
    }

    // Ambil poin referral
    const referralPoints = Number(await redis.hget(`user:${fid}`, "referralPoints")) || 0;

    return NextResponse.json({ inviteCode, referralPoints });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { inviteCode, fid } = await request.json();

    if (!inviteCode || !fid) {
      return NextResponse.json(
        { error: "Missing inviteCode or fid" },
        { status: 400 }
      );
    }

    // Cek apakah pengguna sudah menggunakan kode invite
    const hasUsedInvite = await redis.get(`user:${fid}:usedInvite`);
    if (hasUsedInvite) {
      return NextResponse.json(
        { error: "User has already used an invite code" },
        { status: 400 }
      );
    }

    // Validasi kode invite
    const referrerFid = await redis.get(`invite:${inviteCode}`);
    if (!referrerFid || referrerFid === fid) {
      return NextResponse.json(
        { error: "Invalid or self-referral invite code" },
        { status: 400 }
      );
    }

    // Tambahkan 100 poin ke referee
    await redis.hincrby(`user:${fid}`, "referralPoints", 100);
    await redis.set(`user:${fid}:usedInvite`, true);

    // Tambahkan 100 poin ke referrer dan catat referee
    await redis.hincrby(`user:${referrerFid}`, "referralPoints", 100);
    await redis.sadd(`referrals:${referrerFid}`, fid);

    // Ambil poin referral terbaru
    const referralPoints = Number(await redis.hget(`user:${fid}`, "referralPoints")) || 0;

    return NextResponse.json({ success: true, referralPoints });
  } catch (error) {
    console.error("Error processing referral:", error);
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    );
  }
}