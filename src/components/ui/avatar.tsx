import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
} as const;

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover bg-gray-800", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gray-700 flex items-center justify-center font-medium text-gray-300",
        sizeMap[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
