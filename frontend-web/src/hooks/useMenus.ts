import { useState, useCallback } from "react";
import { menuService } from "@/services/menuService";
import { Menu } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async (categoryId?: number) => {
    
    setIsLoading(true);
    try {
      const data = await menuService.getAll(categoryId);
      setMenus(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar menu");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMenu = async (formData: FormData) => {
    try {
      await menuService.create(formData);
      toast.success("Menu berhasil ditambahkan!");
      await fetchMenus(); 
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal menambah menu");
      throw error;
    }
  };

  const updateMenu = async (id: number, formData: FormData) => {
    try {
      await menuService.update(id, formData);
      toast.success("Menu berhasil diperbarui!");
      await fetchMenus();
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal memperbarui menu");
      throw error;
    }
  };

  const deleteMenu = async (id: number) => {
    try {
      await menuService.delete(id);
      toast.success("Menu berhasil dihapus permanen!");
      await fetchMenus();
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal menghapus menu");
      throw error;
    }
  };

  return {
    menus,
    isLoading,
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
  };
};