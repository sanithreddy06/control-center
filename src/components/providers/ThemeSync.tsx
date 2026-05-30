"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

export function ThemeSync() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (status !== "authenticated") return;

    const themeFromSession = session?.user?.theme;
    if (themeFromSession) {
      setTheme(themeFromSession);
    }

    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.theme) setTheme(data.theme);
      })
      .catch(() => {});
  }, [status, session?.user?.theme, setTheme]);

  return null;
}
