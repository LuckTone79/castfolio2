import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  counter?: { current: number; max: number };
}

export const Textarea: React.FC<TextareaProps> = ({
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
      <textarea
        id={inputId}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] ${error ? "border-red-400" : "border-gray-300"} ${className}`}
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
