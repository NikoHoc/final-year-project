import { useState, useCallback } from "react";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar kategori");
      throw error;
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
      handleApiError(error, "Gagal menambah kategori");
      throw error;
    }
  };

  const updateCategory = async (id: number, data: { name: string; type: string }) => {
    try {
      await categoryService.update(id, data);
      toast.success("Kategori berhasil diperbarui!");
      await fetchCategories();
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal memperbarui kategori");
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.delete(id);
      toast.success("Kategori berhasil dihapus!");
      await fetchCategories();
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Kategori tidak bisa dihapus (Mungkin sedang dipakai Menu)");
      throw error;
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
