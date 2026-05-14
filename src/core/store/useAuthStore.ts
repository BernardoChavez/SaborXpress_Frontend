import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types/auth.types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tipo_usuario: null,
      permisos: [],
      isAuthenticated: false,

      setAuth: (user: User, token: string) =>
        set({
          user,
          token,
          tipo_usuario: user.tipo_usuario,
          permisos: user.permisos || [],
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          tipo_usuario: null,
          permisos: [],
          isAuthenticated: false,
        }),
    }),
    {
      name: 'saborxpress-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tipo_usuario: state.tipo_usuario,
        permisos: state.permisos,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
