import { NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth/helpers";
import { setVaultUnlocked } from "@/lib/vault-server";

export async function POST() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return unauthorizedResponse();
  }

  await setVaultUnlocked(user.id);
  return NextResponse.json({ success: true });
}
