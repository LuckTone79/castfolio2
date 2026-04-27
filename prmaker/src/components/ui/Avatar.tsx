import React from "react";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center`}>
      {initials}
    </div>
  );
};
