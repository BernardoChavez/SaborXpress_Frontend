import axiosInstance from '../../../../api/axios';
import type { CateringServicio } from '../types/catering.types';

export const getCateringServicios = async (params?: any): Promise<CateringServicio[]> => {
  const response = await axiosInstance.get('/v1/catering', { params });
  return response.data;
};

export const createCateringServicio = async (data: any) => {
  const response = await axiosInstance.post('/v1/catering', data);
  return response.data;
};

export const updateCateringServicio = async (id: number, data: any) => {
  const response = await axiosInstance.put(`/v1/catering/${id}`, data);
  return response.data;
};

export const deleteCateringServicio = async (id: number) => {
  const response = await axiosInstance.delete(`/v1/catering/${id}`);
  return response.data;
};

export const changeCateringState = async (id: number, estado: string) => {
  const response = await axiosInstance.patch(`/v1/catering/${id}/estado`, { estado });
  return response.data;
};
