import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Runs before React hydrates to prevent theme flash (FOUC).
 * Must stay in sync with next-themes storageKey and attribute="class".
 */
export function ThemeScript() {
  const script = `
(function () {
  var key = ${JSON.stringify(THEME_STORAGE_KEY)};
  try {
    var stored = localStorage.getItem(key);
    var preference = stored ? JSON.parse(stored) : "system";
    var root = document.documentElement;
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark =
      preference === "dark" || (preference === "system" && systemDark);
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {}
})();
`.trim();

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
