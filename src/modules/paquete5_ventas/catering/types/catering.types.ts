export interface CateringDetalle {
  id?: number;
  catering_servicio_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: { id: number; nombre: string };
}

export interface CateringServicio {
  id: number;
  codigo: string;
  cliente: string;
  telefono: string;
  fecha_evento: string;
  hora_evento: string;
  modalidad: 'Recoger en Restaurante' | 'Servicio Externo';
  direccion?: string;
  cantidad_personas: number;
  observaciones?: string;
  precio_total: number;
  estado: 'Pendiente' | 'Confirmado' | 'En preparación' | 'Finalizado' | 'Cancelado';
  detalles: CateringDetalle[];
}
