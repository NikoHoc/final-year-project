import api from "./api";
import { MutationPayload } from "@/types";

export const stockService = {
  getMutations: async (depotId: number) => {
    const response = await api.get(`/stocks/${depotId}`);
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