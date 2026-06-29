import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/v1`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get("branchId") || "";

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId query parameter is required" },
        { status: 400 }
      );
    }

    const url = `${BACKEND_URL}/branches/${branchId}/inventory`;
    const queryString = searchParams.toString();
    const fullUrl = queryString
      ? `${url}?${new URLSearchParams({ branchId, ...Object.fromEntries(searchParams.entries()) }).toString()}`
      : url;

    const res = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || "Failed to fetch inventory" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Inventory API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
