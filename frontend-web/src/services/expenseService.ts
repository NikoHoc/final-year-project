import api from "./api";
import { ExpensePayload } from "@/types";

export const expenseService = {
  getAllByDepot: async (depotId: number) => {
    const response = await api.get(`/expenses/${depotId}`);
    return response.data;
  },

  create: async (data: ExpensePayload) => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  update: async (id: number, data: Partial<ExpensePayload>) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};