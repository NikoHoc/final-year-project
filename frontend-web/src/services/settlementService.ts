import api from "./api";
import { SettlementSummary } from "@/types";

export const settlementService = {
  getTodaySummary: async (depotId: number) => {
    const response = await api.get(`/settlements/today/${depotId}`);
    return response.data;
  },

  processSettlement: async (depotId: number, summaryData: SettlementSummary) => {
    const response = await api.post("/settlements/process", {
      depot_id: depotId,
      summary_data: summaryData,
    });
    return response.data;
  },

  getSettlements: async (depotId: number) => {
    const response = await api.get(`/settlements/${depotId}`);
    return response.data;
  },

  getSettlementTransactions: async (settlementId: string) => {
    const response = await api.get(`/settlements/detail/${settlementId}/transactions`);
    return response.data;
  },
};