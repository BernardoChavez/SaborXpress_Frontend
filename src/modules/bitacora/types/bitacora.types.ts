export interface BitacoraEntry {
  id: number;
  id_usuario: number;
  accion: string;
  accion_detalle: string;
  ip: string;
  fecha: string | null;
  hora_inicio: string | null;
  hora_cierre: string | null;
  usuario?: {
    correo?: string;
    persona?: {
      nombre?: string;
    };
  };
}
