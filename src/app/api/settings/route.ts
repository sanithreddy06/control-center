import { NextRequest, NextResponse } from "next/server";
import { requireAuth, serverErrorResponse, unauthorizedResponse, badRequestResponse } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/client";
import { profileSchema, passwordChangeSchema, vaultPasswordSchema } from "@/lib/validators";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, theme, vault_password_hash")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...data,
      hasVaultPassword: !!data.vault_password_hash,
      vault_password_hash: undefined,
    });
  } catch {
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { action, ...data } = body;

    const supabase = createAdminClient();

    if (action === "profile") {
      const parsed = profileSchema.safeParse(data);
      if (!parsed.success) {
        return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
      }

      const { data: updated, error } = await supabase
        .from("users")
        .update({ name: parsed.data.name, email: parsed.data.email.toLowerCase() })
        .eq("id", user.id)
        .select("id, email, name, role, theme")
        .single();

      if (error) throw error;
      return NextResponse.json(updated);
    }

    if (action === "theme") {
      const theme = data.theme;
      if (!["light", "dark", "system"].includes(theme)) {
        return badRequestResponse("Invalid theme");
      }

      const { error } = await supabase
        .from("users")
        .update({ theme })
        .eq("id", user.id);

      if (error) throw error;
      return NextResponse.json({ theme });
    }

    if (action === "password") {
      const parsed = passwordChangeSchema.safeParse(data);
      if (!parsed.success) {
        return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", user.id)
        .single();

      if (!dbUser) return badRequestResponse("User not found");

      const isValid = await verifyPassword(
        parsed.data.currentPassword,
        dbUser.password_hash
      );
      if (!isValid) {
        return badRequestResponse("Current password is incorrect");
      }

      const newHash = await hashPassword(parsed.data.newPassword);
      await supabase
        .from("users")
        .update({ password_hash: newHash })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    if (action === "vault-password") {
      const parsed = vaultPasswordSchema.safeParse(data);
      if (!parsed.success) {
        return badRequestResponse(parsed.error.issues[0]?.message || "Invalid data");
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("vault_password_hash")
        .eq("id", user.id)
        .single();

      if (dbUser?.vault_password_hash && parsed.data.currentPassword) {
        const isValid = await verifyPassword(
          parsed.data.currentPassword,
          dbUser.vault_password_hash
        );
        if (!isValid) {
          return badRequestResponse("Current vault password is incorrect");
        }
      }

      const newHash = await hashPassword(parsed.data.newPassword);
      await supabase
        .from("users")
        .update({ vault_password_hash: newHash })
        .eq("id", user.id);

      return NextResponse.json({ success: true });
    }

    return badRequestResponse("Invalid action");
  } catch {
    return serverErrorResponse();
  }
}
