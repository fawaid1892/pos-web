import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Login gagal" },
        { status: res.status }
      );
    }

    // Extract token from response (support both {token,...} and {data:{token,...}})
    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user;

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan dalam respons server" },
        { status: 500 }
      );
    }

    // Build response
    const response = NextResponse.json({ token, user });

    // Set httpOnly cookie for middleware-based auth guard
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Auth login API error:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke server autentikasi" },
      { status: 500 }
    );
  }
}
