import { useState, useCallback } from "react";
import { settlementService } from "@/services/settlementService";
import { DailySettlement, TodaySettlementResponse, SettlementSummary } from "@/types";
import { handleApiError } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export const useSettlement = () => {
  const [settlements, setSettlements] = useState<DailySettlement[]>([]);
  const [todayData, setTodayData] = useState<TodaySettlementResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTodaySummary = useCallback(async (depotId: number) => {
    setIsLoading(true);
    try {
      const res = await settlementService.getTodaySummary(depotId);
      setTodayData(res.data);
      return res.data;
    } catch (error) {
      handleApiError(error, "Gagal memuat ringkasan hari ini");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processSettlement = async (depotId: number, summaryData: SettlementSummary) => {
    setIsProcessing(true);
    try {
      const res = await settlementService.processSettlement(depotId, summaryData);
      toast.success(res.message || "Tutup kasir berhasil!");
      return res;
    } catch (error) {
      handleApiError(error, "Gagal memproses tutup kasir");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchSettlements = useCallback(async (depotId: number) => {
    setIsLoading(true);
    try {
      const res = await settlementService.getSettlements(depotId);
      setSettlements(res.data || []);
      return res.data;
    } catch (error) {
      handleApiError(error, "Gagal memuat riwayat laporan");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settlements,
    todayData,
    isLoading,
    isProcessing,
    fetchTodaySummary,
    processSettlement,
    fetchSettlements,
  };
};