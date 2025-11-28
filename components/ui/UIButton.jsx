"use client";

import React from "react";
import clsx from "clsx";

export default function UIButton({
  label,
  onClick,
  gradientFrom = "blue-500",
  gradientTo = "indigo-500",
  icon: Icon,
  size = "md",
  disabled = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex items-center justify-center rounded-xl font-semibold text-white shadow-md transition-transform transform hover:scale-105",
        `bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`,
        sizeClasses[size],
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg",
        className
      )}
    >
      {Icon && <Icon className="ml-2 h-5 w-5" />}
      {label}
    </button>
  );
}
