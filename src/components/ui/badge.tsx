import { cn } from "@/lib/utils";

const colorMap = {
  gray: "bg-gray-800 text-gray-300 border-gray-700",
  green: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  yellow: "bg-amber-900/50 text-amber-400 border-amber-800",
  red: "bg-red-900/50 text-red-400 border-red-800",
  blue: "bg-blue-900/50 text-blue-400 border-blue-800",
  purple: "bg-purple-900/50 text-purple-400 border-purple-800",
} as const;

export interface BadgeProps {
  children: React.ReactNode;
  color?: keyof typeof colorMap;
  className?: string;
}

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorMap[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
