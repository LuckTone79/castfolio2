import React from "react";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`animate-pulse bg-gray-200 rounded h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    );
  }
  return <div className={`animate-pulse bg-gray-200 rounded ${className || "h-4 w-full"}`} />;
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton lines={3} />
    <Skeleton className="h-8 w-24" />
  </div>
);
