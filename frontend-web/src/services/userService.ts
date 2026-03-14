import api from "./api";
import { Employee } from "@/types";

export interface UserFormData {
  email?: string; 
  password?: string;
  full_name: string;
  username: string;
  phone_number: string;
  role: "admin" | "kasir" | "pelayan" | "pelanggan";
  depot_id: number | null;
}

export const userService = {
  getAll: async (depotId?: string, role?: string) => {
    let url = `/users/employees?`;
    if (depotId && depotId !== "all") url += `depot_id=${depotId}&`;
    if (role && role !== "all") url += `role=${role}`;

    const response = await api.get(url);
    return response.data.data as Employee[];
  },

  create: async (data: UserFormData) => {
    const response = await api.post("/users/employees", data);
    return response.data;
  },

  update: async (id: string, data: UserFormData) => {
    const response = await api.put(`/users/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/employees/${id}`);
    return response.data;
  }
};