import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { noteSchema } from "@/lib/validators";

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
    const category = request.nextUrl.searchParams.get("category");

    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    let notes = data || [];
    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(notes);
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
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: parsed.data.title || "Untitled",
        content: parsed.data.content || "",
        category: parsed.data.category || "General",
        is_pinned: parsed.data.is_pinned || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
