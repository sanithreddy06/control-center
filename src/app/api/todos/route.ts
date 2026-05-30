import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { todoSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const search = request.nextUrl.searchParams.get("search");
    const filter = request.nextUrl.searchParams.get("filter");

    let query = supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("is_completed", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (filter === "completed") query = query.eq("is_completed", true);
    if (filter === "active") query = query.eq("is_completed", false);

    const { data, error } = await query;
    if (error) throw error;

    let todos = data || [];
    if (search) {
      const q = search.toLowerCase();
      todos = todos.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(todos);
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
    const parsed = todoSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || "",
        due_date: parsed.data.due_date || null,
        priority: parsed.data.priority || "medium",
        is_completed: parsed.data.is_completed || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
