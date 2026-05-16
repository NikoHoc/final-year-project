import api from "./api";
import { Table } from "@/types";

export const tableService = {
  getAll: async (depotId: number) => {
    const response = await api.get(`/tables/${depotId}`);
    return response.data.data as Table[];
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/tables/detail/${id}`);
    return response.data.data as Table;
  },

  create: async (depotId: number, data: { table_number: string; is_active?: boolean }) => {
    const response = await api.post("/tables", { 
      depot_id: depotId, 
      ...data
    });
    return response.data;
  },

  update: async (id: number, depotId: number, data: { table_number?: string; is_active?: boolean }) => {
    const response = await api.put(`/tables/${id}`, { depot_id: depotId, ...data });
    return response.data;
  },

  delete: async (id: number, depotId: number) => {
    const response = await api.delete(`/tables/${id}`, { data: { depot_id: depotId } });
    return response.data;
  },
};