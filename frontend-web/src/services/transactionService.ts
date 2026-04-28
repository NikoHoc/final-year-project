import api from "./api";
import { Transaction, CreateTransactionPayload, CartItemPayload } from "@/types";

export const transactionService = {
  getAll: async (depotId: number) => {
    const response = await api.get(`/transactions/depot/${depotId}`);
    return response.data.data as Transaction[];
  },

  getById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data as Transaction;
  },

  create: async (data: CreateTransactionPayload) => {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  addItems: async (id: string, items: CartItemPayload[]) => {
    const response = await api.post(`/transactions/${id}/items`, { items });
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: { order_status?: string; payment_status?: string },
  ) => {
    const response = await api.put(`/transactions/${id}/status`, data);
    return response.data;
  },

  processPayment: async (transactionId: string, payload: {
    payment_method_id: number;
    paid_amount: number;
    change_amount: number;
    items: { transaction_item_id: number, quantity: number, price_at_time: number }[];
  }) => {
    const response = await api.put(`/transactions/${transactionId}/pay`, payload);
    return response.data;
  }
};
