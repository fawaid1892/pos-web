import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/v1`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, productId, type, quantity, notes } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
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

    const url = `${BACKEND_URL}/branches/${branchId}/inventory/adjustment`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, type, quantity, notes }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || "Failed to create adjustment" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Inventory Adjustment API POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
