import React from "react";
import { cn } from "../../lib/utils";

interface UserAvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

export function UserAvatar({ name, src, size = "md", className }: UserAvatarProps) {
  const safeName = name || "User";
  const initials = safeName
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-sm flex-shrink-0 overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
