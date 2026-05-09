import { useState, useCallback } from "react";
import { tableService } from "@/services/tableService";
import { Table } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = useCallback(async (depotId: number) => {
    if (!depotId) return;
    setIsLoading(true);
    try {
      const data = await tableService.getAll(depotId);
      setTables(data);
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar meja");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTable = async (depotId: number, tableNumber: string) => {
    try {
      await tableService.create(depotId, tableNumber);
      toast.success(`Meja ${tableNumber} berhasil ditambahkan!`);
      await fetchTables(depotId);
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menambah meja");
      throw error;
    }
  };

  const updateTable = async (
    id: number,
    depotId: number,
    data: { table_number?: string; status?: string },
  ) => {
    try {
      await tableService.update(id, data);
      toast.success("Meja berhasil diperbarui!");
      await fetchTables(depotId);
      return true;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui meja");
      throw error;
    }
  };

  const deleteTable = async (id: number, depotId: number) => {
    try {
      await tableService.delete(id);
      toast.success("Meja berhasil dihapus!");
      await fetchTables(depotId);
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menghapus meja");
      throw error;
    }
  };

  return {
    tables,
    isLoading,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
  };
};
