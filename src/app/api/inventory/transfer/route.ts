import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const API_BASE = BASE_URL.replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromBranchId, toBranchId, productId, quantity, notes } = body;

    if (!fromBranchId) {
      return NextResponse.json(
        { error: "fromBranchId is required" },
        { status: 400 }
      );
    }

    if (!toBranchId) {
      return NextResponse.json(
        { error: "toBranchId is required" },
        { status: 400 }
      );
    }

    if (fromBranchId === toBranchId) {
      return NextResponse.json(
        { error: "source and target branch must be different" },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/api/v1/inventory/transfer`;

    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ toBranchId, productId, quantity, notes }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || "Failed to create transfer" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Inventory Transfer API POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
