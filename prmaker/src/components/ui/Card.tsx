import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", hover, ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${hover ? "hover:shadow-md transition-shadow cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>{children}</div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>{children}</div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>{children}</div>
);
