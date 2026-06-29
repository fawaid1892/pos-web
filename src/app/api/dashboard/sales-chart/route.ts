import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const API_BASE = BASE_URL.replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get("branch_id");
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  if (!branchId) {
    return NextResponse.json({ error: "branch_id is required" }, { status: 400 });
  }

  try {
    const url = `${API_BASE}/api/v1/dashboard/sales-chart?start=${start}&end=${end}&branch_id=${branchId}`;

    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || "Failed to fetch sales chart" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sales chart API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
