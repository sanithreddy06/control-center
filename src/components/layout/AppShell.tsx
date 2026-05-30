"use client";

import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { QuickAddFAB } from "./QuickAddFAB";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 pb-28 lg:pb-8">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <Footer />
        <BottomNav />
        <QuickAddFAB />
      </div>
    </div>
  );
}
