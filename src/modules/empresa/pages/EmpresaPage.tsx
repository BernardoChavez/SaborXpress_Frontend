import { useEffect, useState } from 'react';
import { Building2, Save, RefreshCw } from 'lucide-react';
import { empresaService } from '../empresaService';
import type { Empresa } from '../types/empresa.types';

const EmpresaPage = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchEmpresa = async () => {
    setLoading(true);
    try {
      const data = await empresaService.get();
      setEmpresa(data);
    } catch {
      setError('Error al cargar datos de la empresa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmpresa(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;
    setSaving(true);
    setSuccess(false);
    try {
      await empresaService.update(empresa);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <RefreshCw size={22} className="animate-spin mr-2" />
        <span>Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building2 size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Datos de la Empresa</h1>
          <p className="text-sm text-gray-500">Configura la información general de tu negocio</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">¡Datos guardados con éxito!</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nombre del Negocio *</label>
              <input required type="text" value={empresa?.nombre || ''} onChange={e => setEmpresa({...empresa!, nombre: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">NIT / Documento</label>
              <input type="text" value={empresa?.nit || ''} onChange={e => setEmpresa({...empresa!, nit: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Dirección</label>
              <input type="text" value={empresa?.direccion || ''} onChange={e => setEmpresa({...empresa!, direccion: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" value={empresa?.telefono || ''} onChange={e => setEmpresa({...empresa!, telefono: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Moneda Base</label>
              <input required type="text" value={empresa?.moneda || ''} onChange={e => setEmpresa({...empresa!, moneda: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej: Bs. / $ / MXN" />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmpresaPage;
