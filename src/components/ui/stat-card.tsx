import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-800 bg-gray-900 p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend && (
        <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend.value >= 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
