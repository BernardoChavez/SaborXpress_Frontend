import axiosInstance from '../../../api/axios';
import type { InventarioItem, FichaTransformacion, Receta, CreateInventarioDto, Proveedor, CreateProveedorDto, OrdenCompra } from './types/inventario.types';


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
    },
    deleteReceta: async (id: number): Promise<any> => {
        const { data } = await axiosInstance.delete(`/inventario/recetas/${id}`);
        return data;
    },

    // --- Proveedores (CU 10) ---
    getProveedores: async (): Promise<Proveedor[]> => {
        const { data } = await axiosInstance.get('/proveedores');
        return data;
    },
    createProveedor: async (dto: CreateProveedorDto): Promise<Proveedor> => {
        const { data } = await axiosInstance.post('/proveedores', dto);
        return data;
    },
    updateProveedor: async (id: number, dto: CreateProveedorDto): Promise<Proveedor> => {
        const { data } = await axiosInstance.put(`/proveedores/${id}`, dto);
        return data;
    },
    deleteProveedor: async (id: number): Promise<any> => {
        const { data } = await axiosInstance.delete(`/proveedores/${id}`);
        return data;
    },

    // --- Compras (CU 23, 27, 28) ---
    getCompras: async (): Promise<OrdenCompra[]> => {
        const { data } = await axiosInstance.get('/ordenes-compra');
        return data;
    },
    createCompra: async (dto: { id_proveedor: number; detalles: { id_bruto: number; cantidad: number; precio_unitario: number }[] }): Promise<OrdenCompra> => {
        const { data } = await axiosInstance.post('/ordenes-compra', dto);
        return data;
    },
    getCompraById: async (id: number): Promise<OrdenCompra> => {
        const { data } = await axiosInstance.get(`/ordenes-compra/${id}`);
        return data;
    },
    recibirMercancia: async (id: number): Promise<OrdenCompra> => {
        const { data } = await axiosInstance.post(`/ordenes-compra/${id}/recibir`);
        return data;
    },
    cancelarCompra: async (id: number): Promise<OrdenCompra> => {
        const { data } = await axiosInstance.post(`/ordenes-compra/${id}/cancelar`);
        return data;
    },

    // --- Mermas (CU31) ---
    registrarMerma: async (dto: { id_producto: number; cantidad: number; motivo: string }): Promise<any> => {
        const { data } = await axiosInstance.post('/inventario/mermas', dto);
        return data;
    },

    getAlertas: async (params: any = {}) => {
        const { data } = await axiosInstance.get('/inventario/alertas', { params });
        return data;
    },
    
    getHistorialAlertas: async () => {
        const { data } = await axiosInstance.get('/inventario/alertas/historial');
        return data;
    },

    getConfigAlerta: async (tipo: string, id: number) => {
        const { data } = await axiosInstance.get(`/inventario/alertas/config/${tipo}/${id}`);
        return data;
    },

    configurarAlerta: async (payload: any) => {
        const { data } = await axiosInstance.post('/inventario/alertas/configurar', payload);
        return data;
    },

    marcarAlertaAtendida: async (id: number) => {
        const { data } = await axiosInstance.patch(`/inventario/alertas/${id}/atender`);
        return data;
    },

    reenviarCorreoAlerta: async (id: number) => {
        const { data } = await axiosInstance.post(`/inventario/alertas/${id}/reenviar`);
        return data;
    },

    deleteAlerta: async (id: number) => {
        const { data } = await axiosInstance.delete(`/inventario/alertas/${id}`);
        return data;
    },

    deleteConfigAlerta: async (tipo: string, id: number) => {
        const { data } = await axiosInstance.delete(`/inventario/alertas/config/${tipo}/${id}`);
        return data;
    }
};
