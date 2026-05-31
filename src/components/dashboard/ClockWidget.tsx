"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Clock className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
      </div>
      <div className="min-w-0">
        {now ? (
          <>
            <p className="text-3xl font-light tracking-tight tabular-nums">
              {format(now, "h:mm")}
              <span className="text-lg text-neutral-500">{format(now, " a")}</span>
            </p>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {format(now, "EEEE")}
            </p>
            <p className="text-sm text-neutral-500">{format(now, "MMMM d, yyyy")}</p>
          </>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        )}
      </div>
    </Card>
  );
}
