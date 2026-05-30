"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { isThemePreference } from "@/lib/theme";

/**
 * Loads theme preference from the user profile once per login session.
 * Runtime theme is owned by next-themes (localStorage). DB is the cross-device source of truth on login.
 */
export function ThemeInitializer() {
  const { status, data: session } = useSession();
  const { setTheme } = useTheme();
  const bootstrappedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      bootstrappedUserId.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;
    if (bootstrappedUserId.current === session.user.id) return;

    bootstrappedUserId.current = session.user.id;

    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isThemePreference(data?.theme)) {
          setTheme(data.theme);
        }
      })
      .catch(() => {});
  }, [status, session?.user?.id, setTheme]);

  useEffect(() => {
    document.documentElement.classList.add("theme-colors-transition");
  }, []);

  return null;
}
