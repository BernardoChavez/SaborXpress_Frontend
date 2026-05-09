import api from '../../api/axios';
import type { Rol, Paquete, UpdateRolPermisosDto } from './types/roles.types';

export const rolesService = {
  getEstructura: async (): Promise<Paquete[]> => {
    const { data } = await api.get('/roles/estructura');
    return data;
  },
  getRoles: async (): Promise<Rol[]> => {
    const { data } = await api.get('/roles');
    return data;
  },
  updateRol: async (id: number, dto: UpdateRolPermisosDto): Promise<Rol> => {
    const { data } = await api.put(`/roles/${id}`, dto);
    return data.rol;
  }
};
