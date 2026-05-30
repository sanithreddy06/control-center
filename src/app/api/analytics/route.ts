import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const since = subDays(new Date(), days).toISOString();

    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();

    const totalVisitors = new Set(events?.map((e) => e.visitor_id) || []).size;
    const todayEvents = events?.filter(
      (e) => e.created_at >= todayStart && e.created_at <= todayEnd
    ) || [];
    const visitorsToday = new Set(todayEvents.map((e) => e.visitor_id)).size;
    const pageViews = events?.length || 0;

    const pageCounts: Record<string, number> = {};
    const domainCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    events?.forEach((e) => {
      pageCounts[e.path] = (pageCounts[e.path] || 0) + 1;
      domainCounts[e.domain] = (domainCounts[e.domain] || 0) + 1;
      const day = format(new Date(e.created_at), "yyyy-MM-dd");
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const mostVisitedPages = Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    const mostVisitedSubdomains = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    const trafficTrends = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalVisitors,
      visitorsToday,
      pageViews,
      mostVisitedPages,
      mostVisitedSubdomains,
      trafficTrends,
    });
  } catch {
    return serverErrorResponse();
  }
}
