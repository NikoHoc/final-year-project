"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { Menu } from "@/types";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Menu | null;
  onSubmit: (formData: FormData) => Promise<boolean>;
}

export default function MenuFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: MenuFormModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [halfPrice, setHalfPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData?.name || "");
      setPrice(initialData?.price || "");
      setHalfPrice(initialData?.half_price || "");
      setDescription(initialData?.description || "");
      setIsAvailable(initialData?.is_available ?? true);
      setImageFile(null);
      setImagePreview(initialData?.image_url || null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("is_available", String(isAvailable));

    if (halfPrice) formData.append("half_price", halfPrice.toString());
    if (description) formData.append("description", description);

    if (imageFile) {
      formData.append("image", imageFile); 
    }

    const success = await onSubmit(formData);

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Menu Makanan" : "Tambah Menu Baru"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Menu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Mie Bakso"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga 1/2
                </label>
                <input
                  type="number"
                  min="0"
                  value={halfPrice}
                  onChange={(e) =>
                    setHalfPrice(e.target.value ? Number(e.target.value) : "")
                  }
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Mie rasa asin gurih dengan bakso 5 biji..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-black resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Makanan
            </label>

            <div
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl overflow-hidden relative transition-colors ${imagePreview ? "border-blue-300 bg-blue-50/50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-lg shadow-lg hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Upload size={16} /> Ganti Foto
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className="text-center p-6 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Klik untuk unggah foto
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-5 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name || !price}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${isSubmitting || !name || !price ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? "Simpan Perubahan"
                : "Tambah Menu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
