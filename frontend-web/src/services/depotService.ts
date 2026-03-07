import api from "./api";

export const depotService = {
  getById: async (id: number) => {
    const response = await api.get(`/depots/${id}`);
    return response.data;
  }
};