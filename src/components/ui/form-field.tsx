import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, required, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
