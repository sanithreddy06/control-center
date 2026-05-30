import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
        {
          "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300": variant === "default",
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400": variant === "success",
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400": variant === "warning",
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": variant === "danger",
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
