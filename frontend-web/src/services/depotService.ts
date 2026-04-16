import api from "./api";
import { Depot } from "@/types";

export const depotService = {
  getAll: async () => {
    const response = await api.get("/depots");
    return response.data.data as Depot[];
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/depots/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number, isOpen: boolean) => {
    const response = await api.put(`/depots/${id}/status`, { is_open: isOpen });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/depots/${id}`);
    return response.data;
  }, 

  create: async (data: { name: string; address: string; phone_number: string }) => {
    const response = await api.post("/depots", data);
    return response.data;
  },
  
  update: async (id: number, data: { name: string; address: string; phone_number: string }) => {
    const response = await api.put(`/depots/${id}`, data);
    return response.data;
  },

  setupPayment: async (id: number, data: { merchant_id: string; midtrans_client_key: string; midtrans_server_key: string }) => {
    const response = await api.post(`/depots/${id}/payment-config`, data);
    return response.data;
  },

  getMenus: async (id: number) => {
    const response = await api.get(`/depots/${id}/menus`);
    return response.data.data;
  },

  assignMenus: async (id: number, menu_ids: number[]) => {
    const response = await api.post(`/depots/${id}/menus`, { menu_ids });
    return response.data;
  },
  
  updateMenuStatus: async (depotId: number, menuId: number, isAvailable: boolean) => {
    const response = await api.put(`/depots/${depotId}/menus/${menuId}/status`, {
      is_available: isAvailable
    });
    return response.data;
  },
};