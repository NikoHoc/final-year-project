import React, { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import { Category, Menu } from "@/types";
import Image from "next/image";

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<boolean>; 
  categories: Category[];
  initialData?: Menu | null;
}

export default function MenuFormModal({
  isOpen, onClose, onSubmit, categories, initialData,
}: MenuFormModalProps) {
  const [formData, setFormData] = useState({
    name: "", price: "", half_price: "", category_id: "", description: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData?.name || "",
        price: initialData?.price?.toString() || "",
        half_price: initialData?.half_price?.toString() || "",
        category_id: initialData?.category_id?.toString() || (categories.length > 0 ? categories[0].id.toString() : ""),
        description: initialData?.description || "",
      });
      setImageFile(null);
      setImagePreview(initialData?.image_url || null);
    }
  }, [isOpen, initialData, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(initialData?.image_url || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("category_id", formData.category_id);
    submitData.append("name", formData.name);
    submitData.append("price", formData.price);
    if (formData.half_price) submitData.append("half_price", formData.half_price);
    if (formData.description) submitData.append("description", formData.description);
    if (imageFile) submitData.append("image", imageFile);

    try {
      const success = await onSubmit(submitData);
      if (success) onClose();
    } catch (error) {
      console.error("Gagal menyimpan data user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={initialData ? "Edit Master Menu" : "Tambah Master Menu"} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Menu</label>
            <input type="text" placeholder="Mie ayam..." required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
            <input type="number" placeholder="30000" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Harga 1/2 Porsi (Opsional)</label>
            <input type="number" placeholder="27000" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={formData.half_price} onChange={(e) => setFormData({ ...formData, half_price: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
          <textarea placeholder="Mie asin gurih dengan topping ayam.." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto Menu</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {imagePreview && (
            <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
              <Image 
                src={imagePreview} 
                alt="Preview" 
                fill 
                className="object-cover" 
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md">Batal</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 rounded-md">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}