import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { examSchema } from "@/lib/validators";
import { format } from "date-fns";

async function archivePastExams(userId: string) {
  const supabase = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");
  await supabase
    .from("exams")
    .update({ is_archived: true })
    .eq("user_id", userId)
    .lt("exam_date", today)
    .eq("is_archived", false);
}

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await archivePastExams(user.id);
    const showArchived = request.nextUrl.searchParams.get("archived") === "true";
    const supabase = createAdminClient();

    let query = supabase
      .from("exams")
      .select("*")
      .eq("user_id", user.id)
      .order("exam_date", { ascending: true });

    query = query.eq("is_archived", showArchived);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
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
    const parsed = examSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("exams")
      .insert({
        user_id: user.id,
        name: parsed.data.name,
        subject: parsed.data.subject,
        exam_date: parsed.data.exam_date,
        notes: parsed.data.notes || "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
