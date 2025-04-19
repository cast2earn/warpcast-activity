import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Logika autentikasi (sesuaikan dengan kode asli kamu)
    return NextResponse.json({ success: true });
  } catch {
    // Hapus '_error' karena tidak digunakan
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}