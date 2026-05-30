"use client";

import { Command } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_SRC = process.env.NEXT_PUBLIC_LOGO_URL?.trim() || "";

interface LogoProps {
  size?: number;
  className?: string;
}

function LogoFallback({ size, className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Command
        className="text-white dark:text-neutral-900"
        style={{ width: (size ?? 32) * 0.5, height: (size ?? 32) * 0.5 }}
      />
    </div>
  );
}

export function Logo({ size = 32, className }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!LOGO_SRC || hasError) {
    return <LogoFallback size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="Control Center logo"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-lg object-contain", className)}
      onError={() => setHasError(true)}
    />
  );
}
