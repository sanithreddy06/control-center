"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  StickyNote,
  CheckSquare,
  FileLock2,
  GraduationCap,
  Calendar,
  Bookmark,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/todos", label: "Todos", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

const moreItems = [
  { href: "/documents", label: "Docs", icon: FileLock2 },
  { href: "/exams", label: "Exams", icon: GraduationCap },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/bookmarks", label: "Links", icon: Bookmark },
];

export function BottomNav() {
  const pathname = usePathname();

  const allItems = [...mobileNavItems.slice(0, 4), ...moreItems.filter(
    (item) => pathname === item.href
  )].slice(0, 5);

  const displayItems = allItems.length >= 5
    ? allItems
    : [
        ...mobileNavItems,
        ...moreItems.filter((m) => pathname.startsWith(m.href)),
      ].slice(0, 5);

  const uniqueItems = displayItems.filter(
    (item, index, self) => self.findIndex((i) => i.href === item.href) === index
  );

  const finalItems = uniqueItems.length >= 4 ? uniqueItems : mobileNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/80 bg-white/80 backdrop-blur-lg lg:hidden dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex items-center justify-around px-2 pb-safe">
        {finalItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
