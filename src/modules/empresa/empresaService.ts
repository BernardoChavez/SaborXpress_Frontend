import axiosInstance from '../../api/axios';
import type { Empresa, UpdateEmpresaDto } from './types/empresa.types';

export const empresaService = {
  get: async (): Promise<Empresa> => {
    const { data } = await axiosInstance.get('/empresa');
    return data;
  },
  update: async (dto: UpdateEmpresaDto): Promise<Empresa> => {
    const { data } = await axiosInstance.put('/empresa', dto);
    return data.empresa;
  }
};
