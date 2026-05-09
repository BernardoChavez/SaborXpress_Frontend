import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, ShieldCheck, Loader2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseApiError } from '../../../utils/parseApiError';
import type { Usuario, CreateUsuarioDto, TipoUsuarioSistema } from '../types/usuario.types';

const ROLES: TipoUsuarioSistema[] = ['Admin', 'Cajero', 'Cocinero'];

const PasswordValidator = ({ password }: { password: string }) => {
  if (!password) return null;
  const requirements = [
    { label: '8+ caracteres', test: password.length >= 8 },
    { label: 'Mayúscula', test: /[A-Z]/.test(password) },
    { label: 'Minúscula', test: /[a-z]/.test(password) },
    { label: 'Número', test: /[0-9]/.test(password) },
    { label: 'Símbolo', test: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
      {requirements.map((req, i) => (
        <div key={i} className={`flex items-center gap-1.5 transition-all duration-300 ${req.test ? 'text-green-600' : 'text-gray-400'}`}>
          {req.test ? <CheckCircle2 size={10} className="shrink-0" /> : <Circle size={10} className="shrink-0" />}
          <span className={`text-[9px] font-bold uppercase tracking-tight ${req.test ? 'opacity-100' : 'opacity-60'}`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
};

interface FormData {
  nombre: string;
  telefono: string;
  correo: string;
  contrasena: string;
  tipo_usuario: TipoUsuarioSistema;
}

interface Errors {
  nombre?: string;
  telefono?: string;
  correo?: string;
  contrasena?: string;
  tipo_usuario?: string;
}

interface UsuarioModalProps {
  open: boolean;
  usuario?: Usuario | null;   // null = modo crear
  onClose: () => void;
  onSubmit: (dto: CreateUsuarioDto, id?: number) => Promise<void>;
}

const UsuarioModal = ({ open, usuario, onClose, onSubmit }: UsuarioModalProps) => {
  const isEditing = !!usuario;

  const emptyForm: FormData = {
    nombre: '',
    telefono: '',
    correo: '',
    contrasena: '',
    tipo_usuario: 'Cajero',
  };

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Rellena el formulario al editar
  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.persona.nombre,
        telefono: usuario.persona.telefono,
        correo: usuario.correo,
        contrasena: '',
        tipo_usuario: usuario.tipo_usuario,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setServerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario, open]);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    const tel = form.telefono.trim();
    if (tel && !/^[0-9+\-\s]{7,20}$/.test(tel)) {
      e.telefono = 'Usa entre 7 y 20 dígitos (puedes usar +, espacios o guiones).';
    }
    if (!form.correo.trim()) {
      e.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'Correo inválido';
    }
    if (!isEditing && !form.contrasena) {
      e.contrasena = 'La contraseña es requerida';
    } else if (form.contrasena && form.contrasena.length < 8) {
      e.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      const dto: CreateUsuarioDto = { ...form };
      await onSubmit(dto, usuario?.id);
      onClose();
    } catch (err: unknown) {
      const { summary, fields } = parseApiError(err);
      setErrors((prev) => ({
        ...prev,
        ...(fields.nombre && { nombre: fields.nombre }),
        ...(fields.telefono && { telefono: fields.telefono }),
        ...(fields.correo && { correo: fields.correo }),
        ...(fields.contrasena && { contrasena: fields.contrasena }),
        ...(fields.tipo_usuario && { tipo_usuario: fields.tipo_usuario }),
      }));
      setServerError(Object.keys(fields).length > 0 ? null : summary);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar usuario' : 'Crear nuevo usuario'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 space-y-4">
                  {serverError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                      {serverError}
                    </p>
                  )}
                  {/* Nombre */}
                  <Field
                    id="nombre"
                    label="Nombre completo"
                    icon={<User size={15} />}
                    type="text"
                    placeholder="Juan Pérez"
                    value={form.nombre}
                    onChange={(v) => handleChange('nombre', v)}
                    error={errors.nombre}
                  />

                  {/* Teléfono */}
                  <Field
                    id="telefono"
                    label="Teléfono"
                    icon={<Phone size={15} />}
                    type="tel"
                    placeholder="555 123 456"
                    value={form.telefono}
                    onChange={(v) => handleChange('telefono', v)}
                    error={errors.telefono}
                  />

                  {/* Correo */}
                  <Field
                    id="correo"
                    label="Correo electrónico"
                    icon={<Mail size={15} />}
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={form.correo}
                    onChange={(v) => handleChange('correo', v)}
                    error={errors.correo}
                  />

                  {/* Contraseña */}
                  <Field
                    id="contrasena"
                    label={isEditing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                    icon={<Lock size={15} />}
                    type="password"
                    placeholder="••••••••"
                    value={form.contrasena}
                    onChange={(v) => handleChange('contrasena', v)}
                    error={errors.contrasena}
                  />
                  <PasswordValidator password={form.contrasena} />

                  {/* Rol */}
                  <div>
                    <label
                      htmlFor="tipo_usuario"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
                    >
                      <ShieldCheck size={15} className="text-gray-400" />
                      Rol
                    </label>
                    <select
                      id="tipo_usuario"
                      value={form.tipo_usuario}
                      onChange={(e) => handleChange('tipo_usuario', e.target.value)}
                      className={[
                        'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white',
                        errors.tipo_usuario
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-gray-300 focus:ring-orange-400',
                      ].join(' ')}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {errors.tipo_usuario && (
                      <p className="text-xs text-red-500 mt-1">{errors.tipo_usuario}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 rounded-lg transition-colors"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {isEditing ? 'Guardar cambios' : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Campo reutilizable ─────────────────────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const Field = ({ id, label, icon, type, placeholder, value, onChange, error }: FieldProps) => (
  <div>
    <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
      <span className="text-gray-400">{icon}</span>
      {label}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition',
        error
          ? 'border-red-400 focus:ring-red-300'
          : 'border-gray-300 focus:ring-orange-400',
      ].join(' ')}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export default UsuarioModal;
