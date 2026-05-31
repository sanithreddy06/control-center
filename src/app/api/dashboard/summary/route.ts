import { NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { calendarDaysUntil } from "@/lib/dates";

const STORAGE_LIMIT_BYTES =
  parseInt(process.env.STORAGE_LIMIT_BYTES || "", 10) || 5 * 1024 * 1024 * 1024;

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const today = format(new Date(), "yyyy-MM-dd");

    const [examsRes, todosRes, notesRes, docsRes, notesCountRes] = await Promise.all([
      supabase
        .from("exams")
        .select("id, name, subject, exam_date")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .gte("exam_date", today)
        .order("exam_date", { ascending: true })
        .limit(3),
      supabase.from("todos").select("id, title, is_completed, due_date").eq("user_id", user.id),
      supabase
        .from("notes")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase.from("documents").select("file_size").eq("user_id", user.id),
      supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    const exams = (examsRes.data || []).map((e) => ({
      id: e.id,
      name: e.name,
      subject: e.subject,
      exam_date: e.exam_date,
      daysLeft: calendarDaysUntil(e.exam_date),
    }));

    const todos = todosRes.data || [];
    const pending = todos.filter((t) => !t.is_completed).length;
    const completed = todos.filter((t) => t.is_completed).length;
    const todayTasks = todos.filter(
      (t) => !t.is_completed && t.due_date === today
    );

    const usedBytes = (docsRes.data || []).reduce((sum, d) => sum + (d.file_size || 0), 0);

    return NextResponse.json({
      exams,
      todos: {
        pending,
        completed,
        todayCount: todayTasks.length,
        todayTasks: todayTasks.slice(0, 5).map((t) => ({ id: t.id, title: t.title })),
      },
      notes: {
        total: notesCountRes.count || 0,
        recent: (notesRes.data || []).map((n) => ({ id: n.id, title: n.title })),
      },
      storage: {
        usedBytes,
        totalBytes: STORAGE_LIMIT_BYTES,
        usedPercent: Math.min(100, Math.round((usedBytes / STORAGE_LIMIT_BYTES) * 100)),
      },
    });
  } catch {
    return serverErrorResponse();
  }
}
