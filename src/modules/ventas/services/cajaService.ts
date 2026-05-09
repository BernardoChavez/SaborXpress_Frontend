import axiosInstance from '../../../api/axios';

export interface Caja {
    id: number;
    id_usuario: number;
    monto_apertura: number;
    monto_apertura_qr: number;
    monto_cierre?: number;
    monto_cierre_qr?: number;
    fecha_apertura: string;
    fecha_cierre?: string;
    estado: 'Abierta' | 'Cerrada';
    ventas_efectivo?: number;
    ventas_qr?: number;
    ventas_totales?: number;
}

export const cajaService = {
    getEstado: async (): Promise<{ abierta: boolean; caja: Caja | null }> => {
        const { data } = await axiosInstance.get('/caja/estado');
        return data;
    },
    abrir: async (efectivo: number, qr: number): Promise<Caja> => {
        const { data } = await axiosInstance.post('/caja/abrir', { 
            monto_apertura: efectivo,
            monto_apertura_qr: qr
        });
        return data.caja;
    },
    cerrar: async (efectivoReal: number, qrReal: number): Promise<any> => {
        const { data } = await axiosInstance.post('/caja/cerrar', { 
            monto_real: efectivoReal,
            monto_real_qr: qrReal
        });
        return data.reporte;
    }
};
