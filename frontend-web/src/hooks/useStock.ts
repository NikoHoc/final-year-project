import { useState, useCallback } from "react";
import { stockService } from "@/services/stockService";
import { StockMutation, MutationPayload } from "@/types";
import { handleApiError } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export const useStock = () => {
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMutations = useCallback(async (depotId: number) => {
    setIsLoading(true);
    try {
      const res = await stockService.getMutations(depotId);
      setMutations(res.data || []);
      return res.data as StockMutation[];
    } catch (error) {
      handleApiError(error, "Gagal memuat data mutasi stok");
      return [];
    } finally {
      setIsLoading(false);
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
    isLoading,
    isProcessing,
    fetchMutations,
    createMutation,
    updateMutation,
    processMutation,
    deleteMutation,
  };
};