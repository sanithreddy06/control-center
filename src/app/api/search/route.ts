import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { SearchResult } from "@/types";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return badRequestResponse("Search query required");
  }

  try {
    const supabase = createAdminClient();
    const query = q.toLowerCase();
    const results: SearchResult[] = [];

    const [notes, todos, exams, bookmarks, documents] = await Promise.all([
      supabase.from("notes").select("*").eq("user_id", user.id),
      supabase.from("todos").select("*").eq("user_id", user.id),
      supabase.from("exams").select("*").eq("user_id", user.id).eq("is_archived", false),
      supabase.from("bookmarks").select("*").eq("user_id", user.id),
      supabase.from("documents").select("id, name, category").eq("user_id", user.id),
    ]);

    notes.data?.forEach((n) => {
      if (
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      ) {
        results.push({
          type: "note",
          id: n.id,
          title: n.title,
          subtitle: n.category,
          url: `/notes?id=${n.id}`,
        });
      }
    });

    todos.data?.forEach((t) => {
      if (
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "todo",
          id: t.id,
          title: t.title,
          subtitle: t.priority,
          url: `/todos`,
        });
      }
    });

    exams.data?.forEach((e) => {
      if (
        e.name.toLowerCase().includes(query) ||
        e.subject.toLowerCase().includes(query)
      ) {
        results.push({
          type: "exam",
          id: e.id,
          title: e.name,
          subtitle: e.subject,
          url: `/exams`,
        });
      }
    });

    bookmarks.data?.forEach((b) => {
      if (
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "bookmark",
          id: b.id,
          title: b.title,
          subtitle: b.category,
          url: `/bookmarks`,
        });
      }
    });

    documents.data?.forEach((d) => {
      if (
        d.name.toLowerCase().includes(query) ||
        d.category.toLowerCase().includes(query)
      ) {
        results.push({
          type: "document",
          id: d.id,
          title: d.name,
          subtitle: d.category,
          url: `/documents`,
        });
      }
    });

    return NextResponse.json(results);
  } catch {
    return serverErrorResponse();
  }
}
