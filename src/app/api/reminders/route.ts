import { NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { format, differenceInDays } from "date-fns";

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

    const [todosRes, examsRes] = await Promise.all([
      supabase
        .from("todos")
        .select("id, title, due_date")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .eq("due_date", today),
      supabase
        .from("exams")
        .select("id, name, subject, exam_date")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .gte("exam_date", today)
        .order("exam_date", { ascending: true }),
    ]);

    const todosDueToday = todosRes.data || [];
    const exams = (examsRes.data || [])
      .filter((e) => {
        const days = differenceInDays(new Date(e.exam_date), new Date());
        return days === 0 || days === 1 || days === 3 || days === 7;
      })
      .map((e) => ({
        id: e.id,
        name: e.name,
        subject: e.subject,
        exam_date: e.exam_date,
        daysLeft: differenceInDays(new Date(e.exam_date), new Date()),
      }));

    return NextResponse.json({ todosDueToday, exams });
  } catch {
    return serverErrorResponse();
  }
}
