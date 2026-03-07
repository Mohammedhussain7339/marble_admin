"use client";

import { AlertCircle, Loader2, X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
  <div
    className="
      w-full max-w-md
      rounded-3xl
      bg-white
      shadow-[0_40px_120px_rgba(0,0,0,0.35)]
      overflow-hidden
      animate-scaleIn
    "
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="text-red-600" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <button
        onClick={onCancel}
        disabled={loading}
        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition"
      >
        <X size={18} />
      </button>
    </div>

    {/* Body */}
    <div className="px-6 pb-6 flex justify-center">
      <p className="text-md leading-relaxed">
        {description}
      </p>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-100" />

    {/* Footer */}
    <div className="px-6 py-5 flex gap-3 justify-end bg-gray-50">
      <button
        onClick={onCancel}
        disabled={loading}
        className="
          px-5 py-2.5
          rounded-xl
          text-sm font-medium
          border
          text-gray-700
          hover:bg-gray-100
          transition
          cursor-pointer
        "
      >
        {cancelText}
      </button>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="
          px-6 py-2.5
          rounded-xl
          text-sm font-semibold
          bg-red-600 text-white
          hover:bg-red-700
          disabled:opacity-60
          flex items-center gap-2
          transition
          cursor-pointer
        "
      >
        {loading && (
          <Loader2 size={16} className="animate-spin" />
        )}
        {loading ? "Processing..." : confirmText}
      </button>
    </div>
  </div>
</div>

  );
}
