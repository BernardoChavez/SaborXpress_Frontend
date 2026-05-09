import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, Package, Layers, Loader2, AlertCircle } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { InventarioItem } from '../types/inventario.types';

interface Props {
  open: boolean;
  onClose: () => void;
  bruto: InventarioItem[];
  procesado: InventarioItem[];
  onSuccess: () => void;
}

const TransformacionModal = ({ open, onClose, bruto, procesado, onSuccess }: Props) => {
  const [idBruto, setIdBruto] = useState<string>('');
  const [idProcesado, setIdProcesado] = useState<string>('');
  const [cantidad, setCantidad] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransform = async () => {
    if (!idBruto || !idProcesado || Number(cantidad) <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await inventarioService.transformar({
        id_bruto: Number(idBruto),
        id_procesado: Number(idProcesado),
        cantidad_bruto: Number(cantidad)
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error en la transformación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ArrowRightLeft className="text-blue-500" size={20} />
                Transformar Insumos
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-4">
                {/* De Bruto */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Materia Prima (Origen)</label>
                  <select 
                    value={idBruto} 
                    onChange={e => setIdBruto(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Seleccionar...</option>
                    {bruto.map(item => (
                      <option key={item.id} value={item.id}>{item.nombre} (Stock: {item.stock})</option>
                    ))}
                  </select>
                </div>

                {/* A Procesado */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Insumo Procesado (Destino)</label>
                  <select 
                    value={idProcesado} 
                    onChange={e => setIdProcesado(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                  >
                    <option value="">Seleccionar...</option>
                    {procesado.map(item => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Cantidad de Materia Prima a usar</label>
                  <input 
                    type="number" 
                    value={cantidad} 
                    onChange={e => setCantidad(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                  />
                </div>
              </div>

              <button 
                disabled={loading || !idBruto || !idProcesado}
                onClick={handleTransform}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'EJECUTAR TRANSFORMACIÓN'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransformacionModal;
