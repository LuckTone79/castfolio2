"use client";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  destructive?: boolean;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, children, size = "md",
  destructive, onConfirm, confirmLabel = "확인", cancelLabel = "취소",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]} mx-4 p-6`}>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        <div className="mb-6">{children}</div>
        {onConfirm && (
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm rounded-md text-white ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
