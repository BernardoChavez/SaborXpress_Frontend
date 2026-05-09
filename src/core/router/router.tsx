import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';

// Guards
import ProtectedRoute from '../../shared/components/ProtectedRoute';

// Auth pages
import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import RecoverPasswordPage from '../../modules/auth/pages/RecoverPasswordPage';
import UnauthorizedPage from '../../modules/auth/pages/UnauthorizedPage';

// Módulos
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import UsuariosPage  from '../../modules/usuarios/pages/UsuariosPage';
import CatalogoPage  from '../../modules/catalogo/pages/CatalogoPage';
import BitacoraPage  from '../../modules/bitacora/pages/BitacoraPage';
import EmpresaPage from '../../modules/empresa/pages/EmpresaPage';
import RolesPage from '../../modules/roles/pages/RolesPage';
import InventarioPage from '../../modules/inventario/pages/InventarioPage';
import POSPage from '../../modules/ventas/pages/POSPage';
import CajaPage from '../../modules/ventas/pages/CajaPage';
import CocinaPage from '../../modules/cocina/pages/CocinaPage';

export const router = createBrowserRouter([
  // ── Rutas públicas (auth) ─────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/recuperar', element: <RecoverPasswordPage /> },
    ],
  },

  // ── Ruta de error de permisos ─────────────────────────────────────────────
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // ── Rutas protegidas: cualquier usuario autenticado ───────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/pos', element: <POSPage /> },
          { path: '/caja', element: <CajaPage /> },
          { path: '/cocina', element: <CocinaPage /> },
        ],
      },
    ],
  },

  // ── Rutas protegidas: Solo Admin ──────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/admin/dashboard', element: <DashboardPage /> },
          { path: '/admin/usuarios',  element: <UsuariosPage /> },
          { path: '/admin/catalogo',  element: <CatalogoPage /> },
          { path: '/admin/bitacora',  element: <BitacoraPage /> },
          { path: '/admin/empresa',   element: <EmpresaPage /> },
          { path: '/admin/roles',     element: <RolesPage /> },
          { path: '/admin/inventario', element: <InventarioPage /> },
        ],
      },
    ],
  },
]);


