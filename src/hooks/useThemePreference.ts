"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { isThemePreference, type ThemePreference } from "@/lib/theme";

export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const { update } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setPreference = useCallback(
    (preference: ThemePreference) => {
      if (!isThemePreference(preference)) return;

      // Single runtime update — next-themes toggles the html class only (no app re-render)
      setTheme(preference);

      // Persist to profile for cross-device sync (fire-and-forget)
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "theme", theme: preference }),
      }).catch(() => {});

      update({ theme: preference });
    },
    [setTheme, update]
  );

  return {
    mounted,
    theme: mounted ? (theme as ThemePreference | undefined) : undefined,
    setPreference,
  };
}
