import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Ban, AlertCircle, ShoppingBag } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { OrdenCompra } from '../types/inventario.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orden: OrdenCompra | null;
}

const DetalleCompraModal = ({ open, onClose, onSuccess, orden }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!orden) return null;

  const handleRecibir = async () => {
    setLoading(true);
    setError(null);
    try {
      await inventarioService.recibirMercancia(orden.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al recibir la mercancía.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('¿Está seguro de que desea cancelar esta orden de compra?')) return;
    setLoading(true);
    setError(null);
    try {
      await inventarioService.cancelarCompra(orden.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cancelar la orden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-indigo-500" size={20} />
                Detalle de Orden de Compra #{orden.id}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Proveedor</p>
                  <p className="font-black text-gray-900 uppercase text-sm mt-0.5">{orden.proveedor?.nombre}</p>
                  <p className="text-gray-500 mt-0.5">{orden.proveedor?.telefono || 'Sin teléfono'}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Estado de la Orden</p>
                  <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase mt-1 tracking-tighter ${
                    orden.estado === 'Recibida' ? 'bg-green-50 text-green-600 border border-green-100' :
                    orden.estado === 'Cancelada' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {orden.estado}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Registrado por</p>
                  <p className="font-bold text-gray-700 mt-0.5">{orden.usuario?.persona?.nombre || 'Usuario'}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Fecha Orden</p>
                  <p className="font-bold text-gray-700 mt-0.5">{new Date(orden.fecha_orden).toLocaleString()}</p>
                  {orden.fecha_recepcion && (
                    <p className="text-[10px] text-green-600 font-bold mt-1">Recibido: {new Date(orden.fecha_recepcion).toLocaleString()}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Insumos Solicitados</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                  {orden.detalles?.map(det => (
                    <div key={det.id} className="p-3.5 bg-white flex items-center justify-between text-xs hover:bg-gray-50/50">
                      <div>
                        <p className="font-black text-gray-900 uppercase">{det.bruto?.nombre || 'Insumo'}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {Number(det.cantidad).toLocaleString()} {det.bruto?.unidad_medida} x {Number(det.precio_unitario).toFixed(2)} Bs.
                        </p>
                      </div>
                      <span className="font-black text-gray-900">{Number(det.subtotal).toFixed(2)} Bs.</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Balance */}
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Total de la Compra</span>
                <span className="text-xl font-black text-indigo-600">{Number(orden.monto_total).toFixed(2)} Bs.</span>
              </div>

              {/* Acciones */}
              {orden.estado === 'Pendiente' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    disabled={loading}
                    onClick={handleCancelar}
                    className="py-3.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Ban size={16} />
                    Cancelar Orden
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleRecibir}
                    className="py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Recibir Mercancía
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DetalleCompraModal;
