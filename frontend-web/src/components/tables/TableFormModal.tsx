"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Table } from "@/types";

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Table | null;
  onSubmit: (tableNumber: string) => Promise<boolean>;
}

export default function TableFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: TableFormModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSubmitting(false);
      setTableNumber(initialData?.table_number || "");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmit(tableNumber); 

      if (!res) {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Meja" : "Tambah Meja Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor / Nama Meja <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Contoh: 1, 5A..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !tableNumber.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
              isSubmitting || !tableNumber.trim()
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? "Simpan Perubahan"
                : "Tambah Meja"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
