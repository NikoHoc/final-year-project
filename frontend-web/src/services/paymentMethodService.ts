import api from "./api";
import { PaymentMethod } from "@/types";

export const paymentMethodService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await api.get("/payment-methods");
    return response.data.data;
  },
  create: async (data: { name: string; is_active: boolean }): Promise<PaymentMethod> => {
    const response = await api.post("/payment-methods", data);
    return response.data.data;
  },
  update: async (id: number, data: { name?: string; is_active?: boolean }): Promise<PaymentMethod> => {
    const response = await api.put(`/payment-methods/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
};