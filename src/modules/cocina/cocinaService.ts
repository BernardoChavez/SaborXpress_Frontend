import axiosInstance from '../../api/axios';
import type { Comanda } from './types/cocina.types';

export const cocinaService = {
    getComandas: async (): Promise<Comanda[]> => {
        const { data } = await axiosInstance.get('/cocina/comandas');
        return data;
    },
    updateEstado: async (id: number, estado: string) => {
        const { data } = await axiosInstance.put(`/cocina/comandas/${id}`, { estado });
        return data;
    }
};
