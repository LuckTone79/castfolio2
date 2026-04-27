"use client";
import React, { useState, useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = "right" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={`absolute z-50 mt-1 w-48 bg-white rounded-md border border-gray-200 shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.onClick(); setOpen(false); }}
              disabled={item.disabled}
              className={`w-full text-left px-4 py-2 text-sm ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
