import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { bookmarkSchema } from "@/lib/validators";

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
    const favorites = request.nextUrl.searchParams.get("favorites");

    let query = supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "all") query = query.eq("category", category);
    if (favorites === "true") query = query.eq("is_favorite", true);

    const { data, error } = await query;
    if (error) throw error;

    let bookmarks = data || [];
    if (search) {
      const q = search.toLowerCase();
      bookmarks = bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(bookmarks);
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
    const parsed = bookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        url: parsed.data.url,
        category: parsed.data.category || "Websites",
        description: parsed.data.description || "",
        is_favorite: parsed.data.is_favorite || false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
