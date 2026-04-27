"use client";
import React, { useState } from "react";

interface Tab {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (key: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key);

  const handleChange = (key: string) => {
    setActive(key);
    onChange?.(key);
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.find(t => t.key === active)?.content}
      </div>
    </div>
  );
};
