import { type NextRequest, NextResponse } from "next/server";

import { daySchema, getDailyEngagementSummary } from "@repo/trpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const configuredSecret = process.env.ADMIN_API_KEY;

  // In local development without configured keys, permit requests with a notice
  if (!configuredSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[api/admin/daily-summary] ADMIN_API_KEY is not configured in production."
      );
      return false;
    }
    return true;
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace(/^bearer\s+/i, "").trim();
    if (token === configuredSecret) return true;
  }

  // Check x-admin-key header
  const customHeader = req.headers.get("x-admin-key");
  if (customHeader && customHeader.trim() === configuredSecret) {
    return true;
  }

  // Check URL query parameter `?key=...`
  const queryKey = req.nextUrl.searchParams.get("key");
  if (queryKey && queryKey.trim() === configuredSecret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unauthorized. Provide valid Bearer token, x-admin-key header, or key query parameter.",
      },
      { status: 401 }
    );
  }

  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date") ?? undefined;
  const parsedDate = dateParam === undefined ? undefined : daySchema.safeParse(dateParam);
  if (parsedDate && !parsedDate.success) {
    return NextResponse.json({ success: false, error: "date must be a valid YYYY-MM-DD date." }, { status: 400 });
  }
  try {
    const summary = await getDailyEngagementSummary({ date: parsedDate?.success ? parsedDate.data : undefined });
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("[api/admin/daily-summary] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unauthorized. Provide valid Bearer token, x-admin-key header, or key query parameter.",
      },
      { status: 401 }
    );
  }

  try {
    let body: {
      date?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body is acceptable; fallback to query params
    }

    const { searchParams } = req.nextUrl;
    const dateParam = body.date ?? searchParams.get("date") ?? undefined;
    const parsedDate = dateParam === undefined ? undefined : daySchema.safeParse(dateParam);
    if (parsedDate && !parsedDate.success) {
      return NextResponse.json({ success: false, error: "date must be a valid YYYY-MM-DD date." }, { status: 400 });
    }
    const summary = await getDailyEngagementSummary({ date: parsedDate?.success ? parsedDate.data : undefined });
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("[api/admin/daily-summary] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
