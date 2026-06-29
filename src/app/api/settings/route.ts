import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:8080/api/v1/settings";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString ? `${BACKEND_URL}?${queryString}` : BACKEND_URL;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
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

    // Try to proxy to backend
    try {
      const res = await fetch(BACKEND_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
