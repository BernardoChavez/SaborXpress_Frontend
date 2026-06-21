// React Router
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../../layouts/MainLayout';
import AuthLayout from '../../layouts/AuthLayout';

// Guards
import ProtectedRoute from '../../shared/components/ProtectedRoute';

// Auth pages
import LoginPage from '../../modules/paquete1_seguridad/auth/pages/LoginPage';
import RegisterPage from '../../modules/paquete1_seguridad/auth/pages/RegisterPage';
import RecoverPasswordPage from '../../modules/paquete1_seguridad/auth/pages/RecoverPasswordPage';
import UnauthorizedPage from '../../modules/paquete1_seguridad/auth/pages/UnauthorizedPage';

// Dashboard
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import ReportesPage from '../../modules/dashboard/pages/ReportesPage';
import SeguimientoPedidoPage from '../../modules/dashboard/pages/SeguimientoPedidoPage';
import ClienteComprarPage from '../../modules/dashboard/pages/ClienteComprarPage';
import ClienteTicketsPage from '../../modules/dashboard/pages/ClienteTicketsPage';
import ClienteNotificacionesPage from '../../modules/dashboard/pages/ClienteNotificacionesPage';
import UsuariosPage  from '../../modules/paquete2_personal/usuarios/pages/UsuariosPage';
import CatalogoPage  from '../../modules/paquete3_configuracion/catalogo/pages/CatalogoPage';
import BitacoraPage  from '../../modules/paquete9_auditoria/bitacora/pages/BitacoraPage';
import EmpresaPage from '../../modules/paquete3_configuracion/empresa/pages/EmpresaPage';
import BackupPage from '../../modules/paquete3_configuracion/backup/pages/BackupPage';
import RolesPage from '../../modules/paquete1_seguridad/roles/pages/RolesPage';
import InventarioPage from '../../modules/paquete4_inventarios/inventario/pages/InventarioPage';
import InsumosPage from '../../modules/paquete4_inventarios/inventario/pages/InsumosPage';
import ProveedoresPage from '../../modules/paquete4_inventarios/inventario/pages/ProveedoresPage';
import RecetasPage from '../../modules/paquete4_inventarios/inventario/pages/RecetasPage';
import OrdenesCompraPage from '../../modules/paquete4_inventarios/inventario/pages/OrdenesCompraPage';
import RecepcionPage from '../../modules/paquete4_inventarios/inventario/pages/RecepcionPage';
import TicketsPage from '../../modules/paquete7_comprobantes/comprobantes/pages/TicketsPage';
import AnulacionesPage from '../../modules/paquete7_comprobantes/comprobantes/pages/AnulacionesPage';
import FacturasPage from '../../modules/paquete7_comprobantes/comprobantes/pages/FacturasPage';
import CajaChicaPage from '../../modules/paquete5_ventas/ventas/pages/CajaChicaPage';
import POSPage from '../../modules/paquete5_ventas/ventas/pages/POSPage';
import CajaPage from '../../modules/paquete5_ventas/ventas/pages/CajaPage';
import CocinaPage from '../../modules/paquete6_produccion/cocina/pages/CocinaPage';

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
                
                // Módulos en Construcción (Arquitectura 9 Paquetes)
                {
                    element: <ProtectedRoute />,
                    children: [
                        { path: 'admin/insumos', element: <InsumosPage /> },
                        { path: 'admin/proveedores', element: <ProveedoresPage /> },
                        { path: 'admin/recetas', element: <RecetasPage /> },
                        { path: 'caja-chica', element: <CajaChicaPage /> },
                        { path: 'admin/tickets', element: <TicketsPage /> },
                        { path: 'admin/facturas', element: <FacturasPage /> },
                        { path: 'admin/anulaciones', element: <AnulacionesPage /> },
                        { path: 'admin/ordenes', element: <OrdenesCompraPage /> },
                        { path: 'admin/recepcion', element: <RecepcionPage /> }
                    ]
                },

                {
                    element: <ProtectedRoute allowedRoles={['Admin']} />,
                    children: [
                        { path: 'admin/empresa', element: <EmpresaPage /> },
                        { path: 'admin/backup', element: <BackupPage /> },
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
