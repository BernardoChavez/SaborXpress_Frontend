import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';
import type { TipoUsuario } from '../../core/types/auth.types';

interface ProtectedRouteProps {
  /** Lista de roles que pueden acceder (opcional) */
  allowedRoles?: TipoUsuario[];
  /** Permiso específico requerido (ej: 'CU20:ver') */
  requiredPermission?: string;
  /** Ruta de redirección si no está autenticado */
  redirectTo?: string;
  /** Ruta de redirección si no tiene permiso */
  unauthorizedPath?: string;
}

const ProtectedRoute = ({
  allowedRoles = [],
  requiredPermission,
  redirectTo = '/login',
  unauthorizedPath = '/unauthorized',
}: ProtectedRouteProps) => {
  const { isAuthenticated, tipo_usuario, permisos } = useAuthStore();

  // 1. No autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // 2. El Administrador siempre tiene acceso a todo (Súper Usuario)
  if (tipo_usuario === 'Admin') {
    return <Outlet />;
  }

  // 3. Si se requiere un permiso específico (Para roles no-admin)
  if (requiredPermission && !permisos.includes(requiredPermission)) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  // 4. Roles definidos pero el usuario no tiene el rol requerido
  if (allowedRoles.length > 0 && (!tipo_usuario || !allowedRoles.includes(tipo_usuario))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  // 5. Todo OK
  return <Outlet />;
};

export default ProtectedRoute;
