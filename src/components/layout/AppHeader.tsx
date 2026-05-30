"use client";

import { GlobalSearch } from "./GlobalSearch";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80 sm:px-6 lg:px-8">
      <GlobalSearch />
    </header>
  );
}
