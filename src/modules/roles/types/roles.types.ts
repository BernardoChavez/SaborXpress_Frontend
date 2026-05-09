export interface CasoUso {
  id: number;
  id_paquete: number;
  codigo: string;
  nombre: string;
  es_crud: boolean;
}

export interface Paquete {
  id: number;
  nombre: string;
  codigo: string;
  casos_uso: CasoUso[];
}

export interface PermisoRol {
  id: number;
  id_rol: number;
  id_caso_uso: number;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  caso_uso?: { id: number; nombre: string; paquete?: { id: number; nombre: string } };
}

export interface Rol {
  id: number;
  nombre: string;
  permisos: PermisoRol[];
}

export interface UpdateRolPermisosDto {
  nombre?: string;
  permisos: {
    id_caso_uso: number;
    puede_ver: boolean;
    puede_crear: boolean;
    puede_editar: boolean;
    puede_eliminar: boolean;
  }[];
}
