import api from './api';
import { Depot } from '../types';

export const getDepots = async (): Promise<Depot[]> => {
  const response = await api.get('/depots');
  return response.data.data; 
};

export const getDepotDetail = async (id: number): Promise<Depot> => {
  const response = await api.get(`/depots/${id}`); 
  return response.data.data;
};