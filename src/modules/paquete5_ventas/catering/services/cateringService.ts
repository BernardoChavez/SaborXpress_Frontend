import axiosInstance from '../../../../api/axios';
import type { CateringServicio } from '../types/catering.types';

export const getCateringServicios = async (params?: any): Promise<CateringServicio[]> => {
  const response = await axiosInstance.get('/catering', { params });
  return response.data;
};

export const createCateringServicio = async (data: any) => {
  const response = await axiosInstance.post('/catering', data);
  return response.data;
};

export const updateCateringServicio = async (id: number, data: any) => {
  const response = await axiosInstance.put(`/catering/${id}`, data);
  return response.data;
};

export const deleteCateringServicio = async (id: number) => {
  const response = await axiosInstance.delete(`/catering/${id}`);
  return response.data;
};

export const changeCateringState = async (id: number, estado: string) => {
  const response = await axiosInstance.patch(`/catering/${id}/estado`, { estado });
  return response.data;
};
