import { useState, useCallback } from "react";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types";
import toast from "react-hot-toast";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
      toast.error("Gagal memuat daftar kategori");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = async (data: { name: string; type: string }) => {
    try {
      await categoryService.create(data);
      toast.success("Kategori berhasil ditambahkan!");
      await fetchCategories();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menambah kategori");
      return false;
    }
  };

  const updateCategory = async (id: number, data: { name: string; type: string }) => {
    try {
      await categoryService.update(id, data);
      toast.success("Kategori berhasil diperbarui!");
      await fetchCategories();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal memperbarui kategori");
      return false;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.delete(id);
      toast.success("Kategori berhasil dihapus!");
      await fetchCategories();
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ||
          "Kategori tidak bisa dihapus (Mungkin sedang dipakai Menu)",
      );
      return false;
    }
  };

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
