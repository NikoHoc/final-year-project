"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Category } from "@/types";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Category | null;
  onSubmit: (data: { name: string; type: "food" | "drink" | "other" }) => Promise<boolean>;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"food" | "drink" | "other">("food");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setType(initialData?.type || "food");
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSubmit({ name, type });
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Kategori <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Makanan Utama, Minuman Dingin"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Kategori <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "food" | "drink" | "other")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
          >
            <option value="food">Makanan</option>
            <option value="drink">Minuman</option>
            <option value="other">Lainnya</option>
          </select>
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
            disabled={isSubmitting || !name.trim()}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
              isSubmitting || !name.trim()
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? "Simpan Perubahan"
                : "Tambah Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
