import api from "./api";
import { MutationPayload } from "@/types";

export const stockService = {
  getMutations: async (depotId: number, startDate?: string, endDate?: string) => {
    let url = `/stocks/${depotId}`;

    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get(url);

    return response.data;
  },

  getActiveMutations: async (depotId: number | null) => {
    const response = await api.get(`/stocks/${depotId}?status=active`);
    return response.data;
  },

  getHistoryMutations: async (depotId: number | null, startDate?: string, endDate?: string) => {
    let url = `/stocks/${depotId}?status=history`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  },

  createMutation: async (data: MutationPayload) => {
    const response = await api.post("/stocks", data);
    return response.data;
  },

  updateMutation: async (id: number, data: Partial<MutationPayload>) => {
    const response = await api.put(`/stocks/${id}`, data);
    return response.data;
  },

  processMutation: async (
    id: number, 
    payload: { status: 'completed' | 'rejected'; sent_quantity?: number; rejection_reason?: string }
  ) => {
    const response = await api.put(`/stocks/${id}/process`, payload);
    return response.data;
  },

  deleteMutation: async (id: number) => {
    const response = await api.delete(`/stocks/${id}`);
    return response.data;
  },
};