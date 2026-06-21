// React Router
import { createBrowserRouter, Navigate } from 'react-router-dom';

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

// Dashboard
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import ReportesPage from '../../modules/dashboard/pages/ReportesPage';
import SeguimientoPedidoPage from '../../modules/dashboard/pages/SeguimientoPedidoPage';
import ClienteComprarPage from '../../modules/dashboard/pages/ClienteComprarPage';
import ClienteTicketsPage from '../../modules/dashboard/pages/ClienteTicketsPage';
import ClienteNotificacionesPage from '../../modules/dashboard/pages/ClienteNotificacionesPage';

// Administración
import UsuariosPage  from '../../modules/usuarios/pages/UsuariosPage';
import CatalogoPage  from '../../modules/catalogo/pages/CatalogoPage';
import BitacoraPage  from '../../modules/bitacora/pages/BitacoraPage';
import EmpresaPage from '../../modules/empresa/pages/EmpresaPage';
import RolesPage from '../../modules/roles/pages/RolesPage';
import InventarioPage from '../../modules/inventario/pages/InventarioPage';

// Ventas y Cocina
import POSPage from '../../modules/ventas/pages/POSPage';
import CajaPage from '../../modules/ventas/pages/CajaPage';
import CocinaPage from '../../modules/cocina/pages/CocinaPage';

// Componente de Error Simple pero Elegante
const GlobalErrorPage = () => (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-10 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-100">
            <span className="text-4xl font-black">!</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">¡Algo no salió bien!</h1>
        <p className="text-gray-500 max-w-md mb-8">La página que buscas no existe o ha ocurrido un error inesperado en la aplicación.</p>
        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all">VOLVER AL INICIO</button>
    </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <GlobalErrorPage />,
    children: [
        // ── Rutas públicas (auth) ─────────────────────────────────────────────────
        {
            element: <AuthLayout />,
            children: [
                { path: 'login', element: <LoginPage /> },
                { path: 'registro', element: <RegisterPage /> },
                { path: 'recuperar', element: <RecoverPasswordPage /> },
            ],
        },

        // ── Ruta de error de permisos ─────────────────────────────────────────────
        { path: 'unauthorized', element: <UnauthorizedPage /> },

        // ── Rutas protegidas ──────────────────────────────────────────────────────
        {
            element: <MainLayout />,
            children: [
                // Dashboard (Acceso general)
                {
                    element: <ProtectedRoute />,
                    children: [
                        { path: '/', element: <DashboardPage /> },
                        { path: 'admin/dashboard', element: <DashboardPage /> },
                    ]
                },
                
                // Operaciones (Requieren Permisos Matriz)
                {
                    element: <ProtectedRoute requiredPermission="CU17:ver" />,
                    children: [{ path: 'pos', element: <POSPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU16:ver" />,
                    children: [{ path: 'caja', element: <CajaPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU20:ver" />,
                    children: [{ path: 'cocina', element: <CocinaPage /> }]
                },

                // Administración (Requieren Permisos Matriz)
                {
                    element: <ProtectedRoute requiredPermission="CU5:ver" />,
                    children: [{ path: 'admin/usuarios', element: <UsuariosPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU6:ver" />,
                    children: [{ path: 'admin/roles', element: <RolesPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU7:ver" />,
                    children: [{ path: 'admin/bitacora', element: <BitacoraPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU8:ver" />,
                    children: [{ path: 'admin/catalogo', element: <CatalogoPage /> }]
                },
                {
                    element: <ProtectedRoute requiredPermission="CU30:ver" />,
                    children: [{ path: 'admin/inventario', element: <InventarioPage /> }]
                },
                {
                    element: <ProtectedRoute allowedRoles={['Admin']} />,
                    children: [
                        { path: 'admin/empresa', element: <EmpresaPage /> },
                        { path: 'admin/reportes', element: <ReportesPage /> },
                        { path: 'admin/seguimiento', element: <SeguimientoPedidoPage /> }
                    ]
                },
                {
                    element: <ProtectedRoute allowedRoles={['Cliente']} />,
                    children: [
                        { path: 'cliente/comprar', element: <ClienteComprarPage /> },
                        { path: 'cliente/tickets', element: <ClienteTicketsPage /> },
                        { path: 'cliente/notificaciones', element: <ClienteNotificacionesPage /> }
                    ]
                },
            ]
        },

        // Fallback para 404 real
        { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
