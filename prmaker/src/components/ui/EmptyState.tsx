import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon = "📋" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
