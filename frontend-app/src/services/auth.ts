import api from './api';

export const loginCustomer = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerCustomer = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};