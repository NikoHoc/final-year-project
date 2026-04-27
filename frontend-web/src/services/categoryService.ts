import api from "./api";
import { Category } from "@/types";

export const categoryService = {
  getAll: async () => {
    const response = await api.get(`/categories`);
    return response.data.data as Category[];
  },

  create: async (data: { name: string; type: string }) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  update: async (id: number, data: { name: string; type: string }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};