import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-gray-900 px-3 py-2 text-sm text-white transition-colors appearance-none",
        "border-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-white/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
