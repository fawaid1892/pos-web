import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get("branch_id");
  const type = searchParams.get("type"); // sales | stock | profit-loss
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!branchId) {
    return NextResponse.json({ error: "branch_id is required" }, { status: 400 });
  }

  if (!type || !["sales", "stock", "profit-loss"].includes(type)) {
    return NextResponse.json(
      { error: "type must be one of: sales, stock, profit-loss" },
      { status: 400 }
    );
  }

  try {
    // Build backend URL
    let backendUrl = `${BASE_URL}/api/v1/branches/${branchId}/reports/${type}`;

    // Add date range params for sales & profit-loss
    if ((type === "sales" || type === "profit-loss") && start && end) {
      backendUrl += `?start=${start}&end=${end}`;
    }

    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(backendUrl, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || `Failed to fetch ${type} report` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
