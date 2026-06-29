import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const API_BASE = BACKEND_URL.replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Token refresh failed" },
        { status: res.status }
      );
    }

    // Extract token + refresh_token (support both flat and nested {data:...} formats)
    const token = data?.token || data?.data?.token;
    const refresh_token = data?.refresh_token || data?.data?.refresh_token;
    const user = data?.user || data?.data?.user;

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan dalam respons server" },
        { status: 500 }
      );
    }

    // Build response — include refresh_token so the client can store it
    const response = NextResponse.json({ token, refresh_token, user });

    // Update httpOnly cookie for middleware-based auth guard
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Auth refresh API error:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke server autentikasi" },
      { status: 500 }
    );
  }
}
