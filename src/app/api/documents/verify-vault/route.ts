import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { verifyPassword } from "@/lib/auth/password";
import { vaultVerifySchema } from "@/lib/validators";
import { cookies } from "next/headers";

const VAULT_COOKIE = "vault_unlocked";
const VAULT_DURATION = 60 * 60;

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const parsed = vaultVerifySchema.safeParse(body);
    if (!parsed.success) {
      return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
    }

    const supabase = createAdminClient();
    const { data: dbUser, error } = await supabase
      .from("users")
      .select("vault_password_hash")
      .eq("id", user.id)
      .single();

    if (error || !dbUser?.vault_password_hash) {
      return badRequestResponse("Vault password not set. Configure it in Settings.");
    }

    const isValid = await verifyPassword(
      parsed.data.vaultPassword,
      dbUser.vault_password_hash
    );

    if (!isValid) {
      return NextResponse.json({ error: "Incorrect vault password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(VAULT_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: VAULT_DURATION,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverErrorResponse();
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(VAULT_COOKIE);
  return NextResponse.json({ success: true });
}
