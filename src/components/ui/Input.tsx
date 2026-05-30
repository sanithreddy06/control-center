import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm",
            "placeholder:text-neutral-400 transition-colors duration-200",
            "focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200",
            "dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
