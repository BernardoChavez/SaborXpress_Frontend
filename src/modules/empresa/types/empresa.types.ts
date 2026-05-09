export interface Empresa {
  id: number;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  moneda: string;
}

export type UpdateEmpresaDto = Omit<Empresa, 'id'>;
