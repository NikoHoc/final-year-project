import api from "./api";
import { Table } from "@/types";

export const tableService = {
  getAll: async (depotId: number) => {
    const response = await api.get(`/tables/${depotId}`);
    return response.data.data as Table[];
  },

  create: async (depotId: number, tableNumber: string) => {
    const response = await api.post("/tables", { 
      depot_id: depotId, 
      table_number: tableNumber 
    });
    return response.data;
  },

  update: async (id: number, data: { table_number?: string; status?: string }) => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  },
};