"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  StickyNote,
  CheckSquare,
  FileLock2,
  GraduationCap,
  Calendar,
  Bookmark,
  BarChart3,
  Settings,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MODULE_CARDS } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  StickyNote,
  CheckSquare,
  FileLock2,
  GraduationCap,
  Calendar,
  Bookmark,
  BarChart3,
  Settings,
};

export function ModuleCards() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const modules = MODULE_CARDS.filter(
    (m) => !("adminOnly" in m && m.adminOnly) || isAdmin
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {modules.map((module) => {
        const Icon = iconMap[module.icon];
        return (
          <Link key={module.href} href={module.href}>
            <Card hover className="h-full">
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${module.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{module.label}</h3>
              <p className="mt-0.5 text-xs text-neutral-500">{module.description}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
