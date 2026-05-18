import api from "./api";
import { Transaction, CreateTransactionPayload, AddItemsPayload } from "@/types";

export const transactionService = {
  getAll: async (depotId: number, params?: { status?: 'active' | 'completed', date?: string }) => {
    let url = `/transactions/depot/${depotId}`;
    if (params?.status === 'active') {
      url += '?status=active';
    }
    const response = await api.get(url);
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

  addItems: async (id: string, payload: AddItemsPayload) => {
    const response = await api.post(`/transactions/${id}/items`, payload);
    return response.data;
  },
  
  updateCustomerName: async (id: string, customer_name: string) => {
    const response = await api.put(`/transactions/${id}/customer`, { customer_name });
    return response.data;
  },

  updateTransactionStatus: async (
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
  },

  updateTransactionItemStatus: async (transactionId: string, itemId: string, status: 'cooking' | 'served') => {
    const response = await api.put(`/transactions/${transactionId}/items/${itemId}/serve-status`, {
      serve_status: status
    });
    return response.data;
  },

  updateItemQuantity: async (transactionId: string, itemId: string, quantity: number) => {
    const response = await api.put(`/transactions/${transactionId}/items/${itemId}/quantity`, {
      quantity: quantity
    });
    return response.data;
  },

  deleteTransactionItem: async (transactionId: string, itemId: string) => {
    const response = await api.delete(`/transactions/${transactionId}/items/${itemId}`);
    return response.data;
  }
};
