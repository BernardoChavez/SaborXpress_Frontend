import type { Producto } from "../../catalogo/types/catalogo.types";

export interface Comanda {
    id: number;
    id_venta: number;
    estado: 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';
    area: string;
    created_at: string;
    updated_at: string;
    venta?: {
        id: number;
        nro_pedido: number;
        detalles?: {
            id: number;
            id_producto: number;
            cantidad: number;
            producto?: Producto;
        }[];
    };
}
