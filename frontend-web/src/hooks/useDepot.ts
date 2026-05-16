import { useState, useCallback } from "react";
import { depotService } from "@/services/depotService";
import { Depot } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useDepots = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepots = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await depotService.getAll();
      if (response) {
        setDepots(response);
      }
    } catch (error) {
      handleApiError(error, "Gagal memuat list depot");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDepotById = useCallback(async (id: number) => {
    try {
      const res = await depotService.getById(id);
      return res.data || res;
    } catch (error) {
      handleApiError(error, "Gagal memuat data cabang");
      throw error;
    }
  }, []);

  const toggleDepotStatus = async (id: number, nextStatus: boolean) => {
    setIsLoading(true);
    try {
      await depotService.toggleStatus(id, nextStatus);
      toast.success(`Depot berhasil di${nextStatus ? "buka" : "tutup"}`);
    } catch (error) {
      handleApiError(error, "Gagal mengubah status operasional depot");
      throw error;
    }
  };

  const deleteDepot = async (id: number) => {
    try {
      await depotService.delete(id);
      toast.success("Depot berhasil dihapus!");
      fetchDepots();
    } catch (error) {
      handleApiError(error, "Gagal menghapus depot. Pastikan depot tidak terhubung ke data lain.");
      throw error;
    }
  };

  const createDepot = async (data: { name: string; address: string; phone_number: string }) => {
    try {
      await depotService.create(data);
      toast.success("Cabang baru berhasil ditambahkan!");
      fetchDepots();
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menambahkan cabang baru");
      throw error;
    }
  };

  const updateDepot = async (id: number, data: { name: string; address: string; phone_number: string }) => {
    try {
      await depotService.update(id, data);
      toast.success("Data cabang berhasil diperbarui!");
      fetchDepots();
      return true;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui data depot");
      throw error;
    }
  };

  const setupPaymentConfig = async (id: number, data: { merchant_id: string; midtrans_client_key: string; midtrans_server_key: string }) => {
    try {
      await depotService.setupPayment(id, data);
      toast.success("Kredensial Midtrans berhasil disimpan!");
      fetchDepots();
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menyimpan konfigurasi Midtrans");
      throw error;
    }
  };

  const getDepotMenus = useCallback(async (id: number) => {
    try {
      return await depotService.getMenus(id);
    } catch (error) {
      handleApiError(error, "Gagal mengambil menu depot");
      throw error;
    }
  }, []);

  const assignDepotMenus = useCallback(async (id: number, menuIds: number[]) => {
    setIsLoading(true);
    try {
      await depotService.assignMenus(id, menuIds);
      toast.success("Menu depot berhasil diperbarui!");
      return true;
    } catch (error: unknown) {
      handleApiError(error, "Gagal mengatur menu depot");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMenuStatus = useCallback(async (depotId: number, menuId: number, isAvailable: boolean) => {
    try {
      await depotService.updateMenuStatus(depotId, menuId, isAvailable);
      return true;
    } catch (error) {
      handleApiError(error, "Gagal update status menu");
      throw error;
    }
  }, []);

  return { 
    depots, isLoading, fetchDepots, fetchDepotById,
    toggleDepotStatus, deleteDepot, createDepot, updateDepot, setupPaymentConfig,
    getDepotMenus, assignDepotMenus, updateMenuStatus
   }; 
};