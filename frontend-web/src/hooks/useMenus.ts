import { useState, useCallback } from "react";
import { menuService } from "@/services/menuService";
import { Menu } from "@/types";
import toast from "react-hot-toast";

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMenus = useCallback(async (depotId: number, categoryId?: number) => {
    if (!depotId || isNaN(depotId)) return;
    
    setIsLoading(true);
    try {
      const data = await menuService.getAll(depotId, categoryId);
      setMenus(data);
    } catch (error) {
      console.error("Gagal mengambil menu:", error);
      toast.error("Gagal memuat daftar menu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMenu = async (depotId: number, categoryId: number, formData: FormData) => {
    try {
      await menuService.create(formData);
      toast.success("Menu berhasil ditambahkan!");
      await fetchMenus(depotId, categoryId); 
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menambah menu");
      return false;
    }
  };

  const updateMenu = async (id: number, depotId: number, categoryId: number, formData: FormData) => {
    try {
      await menuService.update(id, formData);
      toast.success("Menu berhasil diperbarui!");
      await fetchMenus(depotId, categoryId);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal memperbarui menu");
      return false;
    }
  };

  const deleteMenu = async (id: number, depotId: number, categoryId: number) => {
    try {
      await menuService.delete(id);
      toast.success("Menu berhasil dihapus permanen!");
      await fetchMenus(depotId, categoryId);
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal menghapus menu");
      return false;
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