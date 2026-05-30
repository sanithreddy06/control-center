"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, CheckSquare, StickyNote, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatFileSize } from "@/lib/utils";

interface SummaryData {
  exams: Array<{ id: string; name: string; subject: string; daysLeft: number }>;
  todos: { pending: number; completed: number; todayCount: number; todayTasks: Array<{ id: string; title: string }> };
  notes: { total: number; recent: Array<{ id: string; title: string }> };
  storage: { usedBytes: number; totalBytes: number; usedPercent: number };
}

export function DashboardSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <GraduationCap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="font-medium">Upcoming Exams</h3>
        </div>
        {data.exams.length === 0 ? (
          <p className="text-sm text-neutral-500">No upcoming exams</p>
        ) : (
          <ul className="space-y-2">
            {data.exams.map((exam) => (
              <li key={exam.id} className="text-sm">
                <span className="font-medium">{exam.name}</span>
                <span className="text-neutral-500"> — {exam.daysLeft === 0 ? "Today" : `${exam.daysLeft} days left`}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/exams" className="mt-3 inline-block text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          View all →
        </Link>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium">Todo Summary</h3>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-neutral-500">Pending:</span> <span className="font-medium">{data.todos.pending}</span></p>
          <p><span className="text-neutral-500">Completed:</span> <span className="font-medium">{data.todos.completed}</span></p>
          <p><span className="text-neutral-500">Today&apos;s Tasks:</span> <span className="font-medium">{data.todos.todayCount}</span></p>
        </div>
        {data.todos.todayTasks.length > 0 && (
          <ul className="mt-2 space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
            {data.todos.todayTasks.map((t) => (
              <li key={t.id} className="truncate text-xs text-neutral-500">{t.title}</li>
            ))}
          </ul>
        )}
        <Link href="/todos" className="mt-3 inline-block text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          View all →
        </Link>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/10 p-2">
            <StickyNote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-medium">Notes</h3>
        </div>
        <p className="mb-2 text-sm">
          <span className="text-neutral-500">Total:</span> <span className="font-medium">{data.notes.total}</span>
        </p>
        {data.notes.recent.length === 0 ? (
          <p className="text-sm text-neutral-500">No notes yet</p>
        ) : (
          <ul className="space-y-1">
            {data.notes.recent.map((note) => (
              <li key={note.id} className="truncate text-sm text-neutral-600 dark:text-neutral-400">
                {note.title}
              </li>
            ))}
          </ul>
        )}
        <Link href="/notes" className="mt-3 inline-block text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
          View all →
        </Link>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <HardDrive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-medium">Storage Used</h3>
        </div>
        <p className="text-lg font-light">
          {formatFileSize(data.storage.usedBytes)}{" "}
          <span className="text-sm text-neutral-500">/ {formatFileSize(data.storage.totalBytes)}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all dark:bg-white"
            style={{ width: `${data.storage.usedPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">{data.storage.usedPercent}% used</p>
      </Card>
    </div>
  );
}
