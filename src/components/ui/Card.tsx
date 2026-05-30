import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm",
        "dark:border-neutral-800 dark:bg-neutral-900/50",
        hover && "cursor-pointer transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:hover:border-neutral-700",
        className
      )}
    >
      {children}
    </div>
  );
}
