"use client";
import React, { useEffect } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message, variant = "info", onClose, duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variants = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border rounded-lg shadow-md ${variants[variant]}`}>
      <span className="font-bold">{icons[variant]}</span>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-sm opacity-60 hover:opacity-100">✕</button>
    </div>
  );
};

// Toast Context
import { createContext, useContext, useState, useCallback } from "react";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, variant }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} variant={t.variant} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
