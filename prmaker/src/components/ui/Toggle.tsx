"use client";
import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
};
