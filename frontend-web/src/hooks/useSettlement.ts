import { useState, useCallback } from "react";
import { settlementService } from "@/services/settlementService";
import { DailySettlement, ChartData, SettlementResponse, SettlementSummary } from "@/types";
import { handleApiError } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export const useSettlement = () => {
  const [settlements, setSettlements] = useState<DailySettlement[]>([]);
  const [settlementDetail, setSettlementDetail] = useState<SettlementResponse | null>(null);
  const [todayData, setTodayData] = useState<SettlementResponse | null>(null);

  const [paymentSummary, setPaymentSummary] = useState<ChartData[]>([]);
  const [transactionTypeSummary, setTransactionTypeSummary] = useState<ChartData[]>([]); 
  const [topMenuSummary, setTopMenuSummary] = useState<ChartData[]>([]);

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
      throw error;
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

  const fetchSettlements = useCallback(
    async (depotId: number, startDate?: string, endDate?: string) => {
      setIsLoading(true);
      try {
        const response = await settlementService.getSettlements(depotId, startDate, endDate);
        if (response.status) {
          setSettlements(response.data.settlements || []);
          setPaymentSummary(response.data?.paymentSummary || []);
          setTransactionTypeSummary(response.data?.transactionTypeSummary || []);
          setTopMenuSummary(response.data?.topMenuSummary || []);
        } else {
          throw new Error(response.message || "Failed to fetch settlements");
        }
      } catch (error) {
        handleApiError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  const fetchSettlementDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await settlementService.getSettlementDetail(id);
      if (response.status) {
        setSettlementDetail(response.data);
      } else {
        throw new Error(response.message || "Gagal mengambil detail settlement");
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    settlements,
    settlementDetail,
    paymentSummary,
    transactionTypeSummary, 
    topMenuSummary,
    todayData,
    isLoading,
    isProcessing,
    fetchTodaySummary,
    processSettlement,
    fetchSettlements,
    fetchSettlementDetail
  };
};