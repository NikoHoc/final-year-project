import api from "./api";
import { Menu } from "@/types";

export const menuService = {
  getAll: async (categoryId?: number) => {
    const response = await api.get("/menus", {
      params: {
        category_id: categoryId || undefined,
      },
    });
    return response.data.data as Menu[];
  },

  create: async (data: FormData) => {
    const response = await api.post("/menus", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  update: async (id: number, data: FormData) => {
    const response = await api.put(`/menus/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },
};