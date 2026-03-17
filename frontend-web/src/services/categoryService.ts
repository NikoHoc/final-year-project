import api from "./api";
import { Category } from "@/types";

export const categoryService = {
  getAll: async (depotId: number) => {
    const response = await api.get(`/categories?depot_id=${depotId}`);
    return response.data.data as Category[];
  },

  create: async (depot_id: number, name: string) => {
    const response = await api.post("/categories", { depot_id, name });
    return response.data;
  },

  update: async (id: number, name: string) => {
    const response = await api.put(`/categories/${id}`, { name });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};