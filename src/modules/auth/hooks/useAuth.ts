import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { authApi } from '../../../api/services/authService';

/**
 * Hook de autenticación que expone helpers de alto nivel.
 * Úsalo en cualquier componente para login / logout / user info.
 */
export const useAuth = () => {
  const { user, token, tipo_usuario, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = async (correo: string, contrasena: string) => {
    const data = await authApi.login({ correo, contrasena });
    setAuth(data.user, data.token);
    navigate('/');
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const register = async (userData: { nombre: string; correo: string; contrasena: string; telefono?: string }) => {
    const data = await authApi.register(userData);
    setAuth(data.user, data.token);
    navigate('/');
    return data;
  };

  return { user, token, tipo_usuario, isAuthenticated, login, logout, register };
};
