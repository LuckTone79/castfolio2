import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  counter?: { current: number; max: number };
}

export const Input: React.FC<InputProps> = ({
  label, error, hint, counter, className = "", id, ...props
}) => {
  const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}{props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-300"} ${className}`}
        {...props}
      />
      <div className="flex justify-between">
        {(error || hint) && (
          <p className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>{error || hint}</p>
        )}
        {counter && (
          <p className={`text-xs ml-auto ${counter.current > counter.max ? "text-red-500" : "text-gray-400"}`}>
            {counter.current}/{counter.max}
          </p>
        )}
      </div>
    </div>
  );
};
