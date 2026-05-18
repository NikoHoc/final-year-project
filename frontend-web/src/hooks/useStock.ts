import { useState, useCallback } from "react";
import { stockService } from "@/services/stockService";
import { StockMutation, MutationPayload } from "@/types";
import { handleApiError } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export const useStock = () => {
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [activeMutations, setActiveMutations] = useState<StockMutation[]>([]);
  const [historyMutations, setHistoryMutations] = useState<StockMutation[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isActiveLoading, setIsActiveLoading] = useState(false); 
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMutations = useCallback(async (depotId: number, startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const res = await stockService.getMutations(depotId, startDate, endDate);
      setMutations(res.data || []);
      return res.data as StockMutation[];
    } catch (error) {
      handleApiError(error, "Gagal memuat data mutasi stok");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveMutations = useCallback(async (depotId: number | null) => {
    setIsActiveLoading(true);
    try {
      const res = await stockService.getActiveMutations(depotId);
      setActiveMutations(res.data || []);
      return res.data as StockMutation[];
    } catch (error) {
      handleApiError(error, "Gagal memuat data aktif");
      return [];
    } finally {
      setIsActiveLoading(false);
    }
  }, []);

  const fetchHistoryMutations = useCallback(async (depotId: number | null, startDate?: string, endDate?: string) => {
    setIsHistoryLoading(true);
    try {
      const res = await stockService.getHistoryMutations(depotId, startDate, endDate);
      setHistoryMutations(res.data || []);
      return res.data as StockMutation[];
    } catch (error) {
      handleApiError(error, "Gagal memuat riwayat");
      return [];
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const createMutation = async (data: MutationPayload) => {
    setIsProcessing(true);
    try {
      const res = await stockService.createMutation(data);
      toast.success(res.message || "Permintaan mutasi berhasil dibuat");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal membuat mutasi stok");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMutation = async (id: number, data: Partial<MutationPayload>) => {
    setIsProcessing(true);
    try {
      const res = await stockService.updateMutation(id, data);
      toast.success(res.message || "Data mutasi berhasil diperbarui");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memperbarui mutasi stok");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processMutation = async (
    id: number,
    payload: { status: 'completed' | 'rejected'; sent_quantity?: number; rejection_reason?: string }
  ) => {
    setIsProcessing(true);
    try {
      const res = await stockService.processMutation(id, payload);
      toast.success(res.message || "Permintaan berhasil diproses");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memproses permintaan mutasi");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteMutation = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await stockService.deleteMutation(id);
      toast.success(res.message || "Mutasi stok berhasil dibatalkan");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal membatalkan mutasi stok");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    mutations,
    activeMutations,
    historyMutations,
    isLoading,
    isActiveLoading, 
    isHistoryLoading,
    isProcessing,
    fetchMutations,
    fetchActiveMutations,
    fetchHistoryMutations,
    createMutation,
    updateMutation,
    processMutation,
    deleteMutation,
  };
};