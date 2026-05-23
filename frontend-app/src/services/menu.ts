import api from './api';

export const getDepotMenus = async (depotId: number) => {
  const response = await api.get(`/depots/${depotId}/menus`);
  return response.data.data;
};