"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "warning",
}: ConfirmModalProps) {
  const isDanger = type === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Tindakan" maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full mb-4 ${isDanger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        <div className="flex w-full gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${
              isDanger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}