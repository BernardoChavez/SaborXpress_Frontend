import { Outlet } from 'react-router-dom';

/**
 * Layout limpio para páginas de autenticación (login, registro, recuperación).
 * Centra el contenido en pantalla completa con un fondo degradado naranja-rojo.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
