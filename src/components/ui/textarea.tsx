import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors resize-y",
        "border-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-white/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
