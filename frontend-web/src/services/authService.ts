import api from "./api";
import { User } from "../types";

interface LoginResponse {
  status: boolean;
  message: string;
  data?: {
    token: string; 
    user: User;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};