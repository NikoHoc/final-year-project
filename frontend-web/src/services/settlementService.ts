import api from "./api";
import { SettlementSummary } from "@/types";
import { getTodayStr } from "@/utils/format";

export const settlementService = {
  getTodaySummary: async (depotId: number) => {
    const response = await api.get(`/settlements/today/${depotId}`);
    return response.data;
  },

  processSettlement: async (depotId: number, summaryData: SettlementSummary) => {
    const response = await api.post("/settlements/process", {
      depot_id: depotId,
      summary_data: summaryData,
      settlement_date: getTodayStr(),
    });
    return response.data;
  },

  getSettlements: async (depotId: number, startDate?: string, endDate?: string) => {
    let url = `/settlements/depot/${depotId}`;
    
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  getSettlementDetail: async (id: string) => {
    const response = await api.get(`/settlements/detail/${id}`);
    return response.data;
  },

  getSettlementTransactions: async (settlementId: string) => {
    const response = await api.get(`/settlements/detail/${settlementId}/transactions`);
    return response.data;
  },
};