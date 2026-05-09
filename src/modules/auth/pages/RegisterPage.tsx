import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowLeft, UtensilsCrossed, ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { parseApiError } from '../../../utils/parseApiError';

const PasswordValidator = ({ password }: { password: string }) => {
  const requirements = [
    { label: '8+ caracteres', test: password.length >= 8 },
    { label: 'Mayúscula', test: /[A-Z]/.test(password) },
    { label: 'Minúscula', test: /[a-z]/.test(password) },
    { label: 'Número', test: /[0-9]/.test(password) },
    { label: 'Símbolo', test: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      {requirements.map((req, i) => (
        <div key={i} className={`flex items-center gap-1.5 transition-all duration-300 ${req.test ? 'text-green-600' : 'text-slate-400'}`}>
          {req.test ? <CheckCircle2 size={12} className="shrink-0" /> : <Circle size={12} className="shrink-0" />}
          <span className={`text-[10px] font-bold uppercase tracking-tight ${req.test ? 'opacity-100' : 'opacity-60'}`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        contrasena: formData.contrasena
      });
      // useAuth register already navigates to / on success
    } catch (err: any) {
      const { summary, fields } = parseApiError(err);
      setError(Object.values(fields)[0] || summary);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 uppercase italic">
          Crea tu <span className="text-orange-600">Cuenta</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Únete a la experiencia SaborXpress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-[2rem] sm:px-10 border border-slate-100 relative">
          
          <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={e => setFormData({...formData, correo: e.target.value})}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Teléfono (Opcional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                  placeholder="70000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.contrasena}
                    onChange={e => setFormData({...formData, contrasena: e.target.value})}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Confirmar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmarContrasena}
                    onChange={e => setFormData({...formData, confirmarContrasena: e.target.value})}
                    className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
            
            <PasswordValidator password={formData.contrasena} />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Procesando...' : 'Registrarme ahora'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold text-orange-600 hover:text-orange-500 underline underline-offset-4">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
