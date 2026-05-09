import axiosInstance from '../axios';
import type { LoginCredentials, LoginResponse } from '../../core/types/auth.types';

export const authApi = {
  register: async (userData: { nombre: string; correo: string; contrasena: string; telefono?: string }): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/register', userData);
    return data;
  },
  /**
   * POST /api/login
   * Retorna el usuario y el token Bearer
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>('/login', credentials);
    return data;
  },

  /**
   * POST /api/logout
   * Invalida el token en el backend
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },

  /**
   * GET /api/me
   * Retorna el usuario autenticado actual
   */
  me: async () => {
    const { data } = await axiosInstance.get('/me');
    return data;
  },
  forgotPassword: async (correo: string): Promise<{message: string}> => {
    const { data } = await axiosInstance.post('/password/forgot', { correo });
    return data;
  },
  verifyCode: async (correo: string, codigo: string): Promise<{message: string, token_temporal: string}> => {
    const { data } = await axiosInstance.post('/password/verify', { correo, codigo });
    return data;
  },
  resetPassword: async (correo: string, codigo: string, nueva_contrasena: string): Promise<{message: string}> => {
    const { data } = await axiosInstance.post('/password/reset', { correo, codigo, nueva_contrasena });
    return data;
  },
};
