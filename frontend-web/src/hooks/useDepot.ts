import { useState, useEffect, useCallback } from "react";
import { depotService } from "@/services/depotService";
import { Depot } from "@/types";
import toast from "react-hot-toast";

export const useDepot = (depotId?: number | null) => {
  const [depotName, setDepotName] = useState<string | null>(null);
  const [isLoadingDepot, setIsLoadingDepot] = useState(false);

  useEffect(() => {
    if (!depotId) return;

    const fetchDepotName = async () => {
      setIsLoadingDepot(true);
      try {
        const res = await depotService.getById(depotId);

        if (res.status && res.data) {
          setDepotName(res.data.name); 
        }
      } catch (error) {
        console.error("Gagal mengambil data depot:", error);
        setDepotName("Depot POS");
      } finally {
        setIsLoadingDepot(false);
      }
    };

    fetchDepotName();
  }, [depotId]);

  return { depotName, isLoadingDepot };
};

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
      console.error("Gagal mengambil daftar depot:", error);
      toast.error("Gagal memuat daftar cabang");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepots();
  }, [fetchDepots]);

  const toggleDepotStatus = async (id: number, currentStatus: boolean) => {
    try {
      await depotService.toggleStatus(id, !currentStatus);
      toast.success(
        !currentStatus ? "Depot berhasil DIBUKA!" : "Depot berhasil DITUTUP!"
      );
      fetchDepots();
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      toast.error("Gagal mengubah status operasional depot");
    }
  };

  const deleteDepot = async (id: number) => {
    try {
      await depotService.delete(id);
      toast.success("Depot berhasil dihapus!");
      fetchDepots();
    } catch (error) {
      console.error("Gagal menghapus depot:", error);
      toast.error("Gagal menghapus depot. Pastikan depot tidak terhubung ke data lain.");
    }
  };

  const createDepot = async (data: { name: string; address: string; phone_number: string }) => {
    try {
      await depotService.create(data);
      toast.success("Cabang baru berhasil ditambahkan!");
      fetchDepots();
      return true;
    } catch (error) {
      console.error("Gagal menambah depot:", error);
      toast.error("Gagal menambahkan cabang baru");
      return false;
    }
  };

  const updateDepot = async (id: number, data: { name: string; address: string; phone_number: string }) => {
    try {
      await depotService.update(id, data);
      toast.success("Data cabang berhasil diperbarui!");
      fetchDepots();
      return true;
    } catch (error) {
      console.error("Gagal mengupdate depot:", error);
      toast.error("Gagal memperbarui data cabang");
      return false;
    }
  };

  const setupPaymentConfig = async (id: number, data: { merchant_id: string; midtrans_client_key: string; midtrans_server_key: string }) => {
    try {
      await depotService.setupPayment(id, data);
      toast.success("Kredensial Midtrans berhasil disimpan!");
      fetchDepots();
      return true;
    } catch (error) {
      console.error("Gagal setup payment:", error);
      toast.error("Gagal menyimpan konfigurasi Midtrans");
      return false;
    }
  };

  const getDepotMenus = async (id: number) => {
    try {
      return await depotService.getMenus(id);
    } catch (error) {
      console.error("Gagal mengambil menu depot:", error);
      toast.error("Gagal mengambil menu");
      return [];
    }
  };

  const assignDepotMenus = async (id: number, menuIds: number[]) => {
    setIsLoading(true);
    try {
      await depotService.assignMenus(id, menuIds);
      toast.success("Menu depot berhasil diperbarui!");
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Gagal mengatur menu depot");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    depots, isLoading, fetchDepots,
    toggleDepotStatus, deleteDepot, createDepot, updateDepot, setupPaymentConfig,
    getDepotMenus, assignDepotMenus
   }; 
};