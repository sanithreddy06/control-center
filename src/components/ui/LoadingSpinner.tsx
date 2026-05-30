import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
