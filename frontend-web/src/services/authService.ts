import api from "./api";
import { User } from "../types";

interface LoginResponse {
  status: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};