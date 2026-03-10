import { useState, useEffect } from "react";
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

  const fetchDepots = async () => {
    setIsLoading(true);
    try {
      const data = await depotService.getAll();
      setDepots(data);
    } catch (error) {
      console.error("Gagal mengambil data depot:", error);
      toast.error("Gagal memuat daftar depot");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepots();
  }, []);

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

  return { 
    depots, isLoading, refetch: fetchDepots,
    toggleDepotStatus, deleteDepot, createDepot, updateDepot
   }; 
};