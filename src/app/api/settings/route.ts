import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString
      ? `${BASE_URL}/api/v1/settings?${queryString}`
      : `${BASE_URL}/api/v1/settings`;

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      // If backend is not available, return empty defaults
      // Client will fall back to localStorage
      return NextResponse.json({
        success: true,
        data: {},
        _source: "local",
      });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data, _source: "backend" });
  } catch (error) {
    // Backend unavailable — client will use localStorage
    return NextResponse.json({
      success: true,
      data: {},
      _source: "local",
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Try to proxy to backend
    try {
      const res = await fetch(`${BASE_URL}/api/v1/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data, _source: "backend" });
      }
    } catch {
      // Backend unavailable, acknowledge save locally
    }

    // Fallback: acknowledge the save — frontend already saved to localStorage
    return NextResponse.json({
      success: true,
      data: body,
      _source: "local",
    });
  } catch (error) {
    console.error("Settings API PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
