import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const API_BASE = BASE_URL.replace(/\/+$/, "");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const branchId = searchParams.get("branch_id");
  const format = searchParams.get("format"); // pdf | xlsx | csv
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!branchId) {
    return NextResponse.json({ error: "branch_id is required" }, { status: 400 });
  }

  if (!format || !["pdf", "xlsx", "csv"].includes(format)) {
    return NextResponse.json(
      { error: "format must be one of: pdf, xlsx, csv" },
      { status: 400 }
    );
  }

  try {
    let backendUrl = `${API_BASE}/api/v1/branches/${branchId}/reports/sales/export?format=${format}`;
    if (start) backendUrl += `&start=${start}`;
    if (end) backendUrl += `&end=${end}`;

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
        { error: errorData?.error || "Failed to export report" },
        { status: res.status }
      );
    }

    // Return the blob/response from backend
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const blob = await res.blob();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          res.headers.get("content-disposition") ||
          `attachment; filename=sales-report.${format}`,
      },
    });
  } catch (error) {
    console.error("Reports export API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
