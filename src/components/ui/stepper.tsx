import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepperProps {
  steps: string[];
  current: number; // 0-based index
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium border transition-colors",
                  done && "bg-emerald-600 border-emerald-600 text-white",
                  active && "bg-white border-white text-gray-900",
                  !done && !active && "bg-gray-800 border-gray-700 text-gray-500",
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs text-center whitespace-nowrap",
                  active ? "text-white font-medium" : "text-gray-500",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 mt-[-18px]",
                  done ? "bg-emerald-600" : "bg-gray-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
