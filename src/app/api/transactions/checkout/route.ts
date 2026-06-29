import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/v1/transactions/checkout`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error || "Failed to process checkout" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Checkout API POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
