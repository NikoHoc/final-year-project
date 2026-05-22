import api from './api';
import { Depot } from '../types';

export const getDepots = async (): Promise<Depot[]> => {
  const response = await api.get('/depots');
  return response.data.data; 
};