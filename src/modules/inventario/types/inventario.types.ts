export interface InventarioItem {
    id: number;
    nombre: string;
    stock: number;
    unidad_medida: string;
    stock_minimo: number;
    created_at?: string;
    updated_at?: string;
}

export interface FichaTransformacion {
    id: number;
    id_bruto: number;
    id_procesado: number;
    cantidad_bruto: number;
    cantidad_procesado: number;
    bruto?: InventarioItem;
    procesado?: InventarioItem;
}

export interface Receta {
    id: number;
    id_producto: number;
    id_procesado: number;
    cantidad: number;
    procesado?: InventarioItem;
}

export interface CreateInventarioDto {
    nombre: string;
    stock: number;
    unidad_medida: string;
    stock_minimo: number;
}
