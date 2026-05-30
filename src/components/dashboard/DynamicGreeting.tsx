"use client";

import { useEffect, useState } from "react";
import { getTimeGreeting } from "@/lib/greeting";

interface DynamicGreetingProps {
  name: string;
}

export function DynamicGreeting({ name }: DynamicGreetingProps) {
  const [greeting, setGreeting] = useState(() => getTimeGreeting(new Date().getHours()));

  useEffect(() => {
    const update = () => setGreeting(getTimeGreeting(new Date().getHours()));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const firstName = name.split(" ")[0] || name;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        {greeting.text}, {firstName} {greeting.emoji}
      </h1>
      <p className="mt-1 text-neutral-500">Welcome back to Control Center</p>
    </div>
  );
}
