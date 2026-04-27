import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors",
        "border-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-white/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
