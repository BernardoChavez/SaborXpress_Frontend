import axiosInstance from '../../api/axios';
import type { InventarioItem, FichaTransformacion, Receta, CreateInventarioDto } from './inventario.types';

export const inventarioService = {
    // --- Bruto ---
    getAllBruto: async (): Promise<InventarioItem[]> => {
        const { data } = await axiosInstance.get('/inventario/bruto');
        return data;
    },
    createBruto: async (dto: CreateInventarioDto): Promise<InventarioItem> => {
        const { data } = await axiosInstance.post('/inventario/bruto', dto);
        return data;
    },
    updateBruto: async (id: number, dto: CreateInventarioDto): Promise<InventarioItem> => {
        const { data } = await axiosInstance.put(`/inventario/bruto/${id}`, dto);
        return data;
    },

    // --- Procesado ---
    getAllProcesado: async (): Promise<InventarioItem[]> => {
        const { data } = await axiosInstance.get('/inventario/procesado');
        return data;
    },
    createProcesado: async (dto: CreateInventarioDto): Promise<InventarioItem> => {
        const { data } = await axiosInstance.post('/inventario/procesado', dto);
        return data;
    },
    updateProcesado: async (id: number, dto: CreateInventarioDto): Promise<InventarioItem> => {
        const { data } = await axiosInstance.put(`/inventario/procesado/${id}`, dto);
        return data;
    },

    // --- Transformación ---
    transformar: async (payload: { id_bruto: number; id_procesado: number; cantidad_bruto: number }) => {
        const { data } = await axiosInstance.post('/inventario/transformar', payload);
        return data;
    },

    // --- Fichas y Recetas ---
    getAllFichas: async (): Promise<FichaTransformacion[]> => {
        const { data } = await axiosInstance.get('/inventario/fichas');
        return data;
    },
    getAllRecetas: async (): Promise<Receta[]> => {
        const { data } = await axiosInstance.get('/inventario/recetas');
        return data;
    },
    createFicha: async (dto: any) => {
        const { data } = await axiosInstance.post('/inventario/fichas', dto);
        return data;
    },
    createReceta: async (dto: any) => {
        const { data } = await axiosInstance.post('/inventario/recetas', dto);
        return data;
    },
    getRecetasByProducto: async (idProducto: number): Promise<Receta[]> => {
        const { data } = await axiosInstance.get(`/inventario/recetas/${idProducto}`);
        return data;
    }
};
