import { useState, useCallback } from "react";
import { tableService } from "@/services/tableService";
import { Table } from "@/types";
import toast from "react-hot-toast";
import { handleApiError } from "@/utils/errorHandler";

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = useCallback(async (depotId: number, silent = false) => {
    if (!depotId) return;
    if (!silent) setIsLoading(true);

    try {
      const data = await tableService.getAll(depotId);
      const sortedTables = data.sort((a: Table, b: Table) => {
        return a.table_number.localeCompare(b.table_number, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });

      setTables(sortedTables);
      return sortedTables;
    } catch (error) {
      handleApiError(error, "Gagal memuat daftar meja");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTableById = useCallback(async (id: string | number) => {
    setIsLoading(true);
    try {
      const data = await tableService.getById(id);
      return data;
    } catch (error) {
      handleApiError(error, "Gagal memuat detail meja");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTable = async (depotId: number, data: { table_number: string; is_active?: boolean }) => {
    try {
      await tableService.create(depotId, data);
      toast.success("Meja berhasil ditambahkan");
      await fetchTables(depotId, true);
      return true;
    } catch (error) {
      handleApiError(error, "Gagal menambah meja");
      throw error;
    }
  };

  const updateTable = async (id: number, depotId: number, data: Partial<Table>) => {
    let previousTables: Table[] = [];
    setTables((prev) => {
      previousTables = [...prev];
      return prev.map((t) => (t.id === id ? { ...t, ...data } : t));
    });
    try {
      await tableService.update(id, depotId, data); 
      fetchTables(depotId, true);
      return true;
    } catch (error) {
      setTables(previousTables);
      handleApiError(error, "Gagal memperbarui meja");
      throw error;
    }
  };

  const deleteTable = async (id: number, depotId: number) => {
    try {
      await tableService.delete(id, depotId);
      toast.success("Meja berhasil dihapus");
      await fetchTables(depotId, true);
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
    fetchTableById,
    createTable,
    updateTable,
    deleteTable,
  };
};
