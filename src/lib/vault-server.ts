import { cookies } from "next/headers";
import {
  VAULT_COOKIE,
  VAULT_COOKIE_PATH,
  VAULT_INACTIVITY_SECONDS,
} from "./vault";

const LEGACY_VAULT_COOKIE_PATHS = ["/documents", "/"] as const;

function cookieBaseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
}

export async function isVaultUnlocked(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(VAULT_COOKIE)?.value === userId;
}

export async function setVaultUnlocked(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(VAULT_COOKIE, userId, {
    ...cookieBaseOptions(),
    maxAge: VAULT_INACTIVITY_SECONDS,
    path: VAULT_COOKIE_PATH,
  });
}

export async function clearVaultSession() {
  const cookieStore = await cookies();
  const base = cookieBaseOptions();

  cookieStore.set(VAULT_COOKIE, "", {
    ...base,
    maxAge: 0,
    path: VAULT_COOKIE_PATH,
  });

  for (const path of LEGACY_VAULT_COOKIE_PATHS) {
    cookieStore.set(VAULT_COOKIE, "", {
      ...base,
      maxAge: 0,
      path,
    });
  }
}
