import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { isVaultUnlocked } from "@/lib/vault-server";

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  const vaultUnlocked = await isVaultUnlocked(user.id);

  if (!vaultUnlocked) {
    return NextResponse.json({ locked: true, documents: [] });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ locked: false, documents: data || [] });
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

  const vaultUnlocked = await isVaultUnlocked(user.id);
  if (!vaultUnlocked) {
    return NextResponse.json({ error: "Vault locked" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;

    if (!file || !name) {
      return badRequestResponse("File and name are required");
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      return badRequestResponse("File type not allowed");
    }

    if (file.size > MAX_FILE_SIZE) {
      return badRequestResponse("File too large (max 10MB)");
    }

    const supabase = createAdminClient();
    const ext = file.name.split(".").pop() || "bin";
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        name,
        category: category || "Other",
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return serverErrorResponse();
  }
}
