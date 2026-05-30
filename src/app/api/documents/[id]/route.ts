import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { isVaultUnlocked } from "@/lib/vault-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  if (!(await isVaultUnlocked(user.id))) {
    return NextResponse.json({ error: "Vault locked" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: signedUrl, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600);

    if (urlError) throw urlError;

    return NextResponse.json({ ...doc, url: signedUrl.signedUrl });
  } catch {
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  if (!(await isVaultUnlocked(user.id))) {
    return NextResponse.json({ error: "Vault locked" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: doc } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (doc) {
      await supabase.storage.from("documents").remove([doc.file_path]);
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return serverErrorResponse();
  }
}
