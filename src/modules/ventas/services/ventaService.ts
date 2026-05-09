import axiosInstance from '../../../api/axios';

export interface VentaDetalleDto {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
}

export interface CreateVentaDto {
    metodo_pago: 'Efectivo' | 'QR';
    tipo_entrega: 'Mesa' | 'Llevar';
    codigo_qr?: string;
    detalles: VentaDetalleDto[];
}

export const ventaService = {
    registrar: async (dto: CreateVentaDto) => {
        const { data } = await axiosInstance.post('/ventas', dto);
        return data;
    },
    getVentas: async () => {
        const { data } = await axiosInstance.get('/ventas');
        return data;
    }
};
