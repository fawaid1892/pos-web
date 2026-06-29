import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const API_BASE = BASE_URL.replace(/\/+$/, "");

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

    const url = `${API_BASE}/api/v1/branches/${branchId}/inventory`;
    const queryString = searchParams.toString();
    const fullUrl = queryString
      ? `${url}?${new URLSearchParams({ branchId, ...Object.fromEntries(searchParams.entries()) }).toString()}`
      : url;

    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(fullUrl, {
      headers,
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
