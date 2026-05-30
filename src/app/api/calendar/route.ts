import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { calendarEventSchema } from "@/lib/validators";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const month = request.nextUrl.searchParams.get("month");
    const year = request.nextUrl.searchParams.get("year");

    const events: Array<{
      id: string;
      title: string;
      event_type: string;
      event_date: string;
      description: string;
      source: string;
    }> = [];

    const { data: calendarEvents } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id);

    calendarEvents?.forEach((e) => {
      events.push({ ...e, source: "event" });
    });

    const { data: exams } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false);

    exams?.forEach((e) => {
      events.push({
        id: e.id,
        title: e.name,
        event_type: "event",
        event_date: e.exam_date,
        description: e.subject,
        source: "exam",
      });
    });

    const { data: todos } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .not("due_date", "is", null);

    todos?.forEach((t) => {
      events.push({
        id: t.id,
        title: t.title,
        event_type: "reminder",
        event_date: t.due_date!,
        description: t.description || "",
        source: "todo",
      });
    });

    let filtered = events;
    if (month && year) {
      const prefix = `${year}-${month.padStart(2, "0")}`;
      filtered = events.filter((e) => e.event_date.startsWith(prefix));
    }

    return NextResponse.json(filtered);
  } catch {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsed = calendarEventSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        event_type: parsed.data.event_type || "event",
        event_date: parsed.data.event_date,
        description: parsed.data.description || "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
