import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, UtensilsCrossed, CheckCircle2, Circle } from 'lucide-react';
import { authApi } from '../../../api/services/authService';

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

const RecoverPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(correo);
      setStep(2);
    } catch (err: any) {
      setError('Ocurrió un error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.verifyCode(correo, codigo);
      setStep(3);
    } catch (err: any) {
      setError('Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password.length < 8) return setError('Mínimo 8 caracteres');
    setLoading(true); setError('');
    try {
      await authApi.resetPassword(correo, codigo, password);
      setSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError('No se pudo cambiar la contraseña.');
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
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          Recuperar Contraseña
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          
          <button onClick={() => navigate('/login')} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Volver
          </button>
          
          <div className="mt-6">
            {error && <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">{success}</div>}

            {step === 1 && (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Correo registrado</label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="email" required value={correo} onChange={e => setCorreo(e.target.value)} className="block w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" placeholder="tu@correo.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all">
                  {loading ? 'Enviando...' : 'Enviar código'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerify} className="space-y-6">
                <p className="text-sm text-slate-500 text-center">Hemos enviado un código de 6 dígitos a tu correo.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Código de seguridad</label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="text" required maxLength={6} value={codigo} onChange={e => setCodigo(e.target.value)} className="block w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-center tracking-widest font-bold" placeholder="000000" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all">
                  {loading ? 'Verificando...' : 'Verificar código'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nueva contraseña</label>
                  <div className="mt-2 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="block w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" placeholder="Nueva contraseña" />
                  </div>
                  <PasswordValidator password={password} />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all">
                  {loading ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
export default RecoverPasswordPage;
