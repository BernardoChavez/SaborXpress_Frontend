import { useState } from 'react';
import axios from 'axios';
import { parseApiError } from '../../../utils/parseApiError';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!correo.trim() || !contrasena.trim()) {
      setError('Completa correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(correo, contrasena);
    } catch (err: unknown) {
      const { summary, fields } = parseApiError(err);
      const firstField = Object.values(fields)[0];

      let msg = firstField || summary;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          msg = (err.response?.data as { message?: string })?.message || 'Correo o contraseña incorrectos.';
        } else if (status === 422) {
          msg = firstField || summary;
        } else if (!err.response) {
          msg = 'No hay conexión con el servidor.';
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 tracking-tight">SaborXpress</h1>
          <p className="text-gray-500 mt-1 text-sm">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 transition-colors duration-200"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
          <div className="mt-4 text-center space-y-3">
            <button onClick={() => navigate('/recuperar')} className="text-sm font-medium text-orange-500 hover:text-orange-600 block w-full">¿Olvidaste tu contraseña?</button>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">¿No tienes cuenta? <button onClick={() => navigate('/registro')} className="font-bold text-orange-600 hover:text-orange-500">Regístrate aquí</button></p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;

