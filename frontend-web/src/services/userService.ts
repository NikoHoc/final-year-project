import api from "./api";
import { User } from "@/types";

export interface UserFormData {
  email: string; 
  password?: string;
  full_name: string;
  username: string;
  phone_number: string;
  role: "admin" | 'owner' | "kasir" | "pelayan" | "pelanggan";
  depot_id: number | null;
}

export const userService = {
  // employee
  getEmployees: async (depotId?: string, role?: string) => {
    let url = `/users/employees?`;
    if (depotId && depotId !== "all") url += `depot_id=${depotId}&`;
    if (role && role !== "all") url += `role=${role}`;

    const response = await api.get(url);
    return response.data.data as User[];
  },
  createEmployee: async (data: UserFormData) => {
    const response = await api.post("/users/employees", data);
    return response.data;
  },
  updateEmployee: async (id: string, data: UserFormData) => {
    const response = await api.put(`/users/employees/${id}`, data);
    return response.data;
  },
  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/users/employees/${id}`);
    return response.data;
  },

  // customer
  getCustomers: async () => {
    const response = await api.get("/users/customers");
    return response.data.data as User[];
  },
  createCustomer: async (data: Partial<UserFormData>) => {
    const response = await api.post("/users/customers", data);
    return response.data;
  },
  updateCustomer: async (id: string, data: Partial<UserFormData>) => {
    const response = await api.put(`/users/customers/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/users/customers/${id}`);
    return response.data;
  }
};