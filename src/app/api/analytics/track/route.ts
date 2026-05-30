import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/client";
import { z } from "zod";

const trackSchema = z.object({
  domain: z.string().min(1).max(255),
  path: z.string().max(500).default("/"),
  visitorId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { domain, path, visitorId } = parsed.data;

    await supabase.from("analytics_events").insert({
      domain,
      path,
      visitor_id: visitorId,
      event_type: "pageview",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
