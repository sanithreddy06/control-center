import { cookies } from "next/headers";
import { VAULT_COOKIE, VAULT_INACTIVITY_SECONDS, VAULT_PATH } from "./vault";

export async function isVaultUnlocked(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(VAULT_COOKIE)?.value === userId;
}

export async function setVaultUnlocked(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(VAULT_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: VAULT_INACTIVITY_SECONDS,
    path: VAULT_PATH,
  });
}

export async function clearVaultSession() {
  const cookieStore = await cookies();
  cookieStore.set(VAULT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: VAULT_PATH,
  });
}
