import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CateringServicio, CateringDetalle } from '../types/catering.types';
import * as cateringService from '../services/cateringService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  servicio: CateringServicio | null;
  productos: any[];
}

const CateringModal = ({ isOpen, onClose, servicio, productos }: Props) => {
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    fecha_evento: '',
    hora_evento: '',
    modalidad: 'Servicio Externo',
    direccion: '',
    cantidad_personas: 1,
    observaciones: '',
    estado: 'Pendiente'
  });

  const [detalles, setDetalles] = useState<CateringDetalle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (servicio) {
      setFormData({
        cliente: servicio.cliente,
        telefono: servicio.telefono || '',
        fecha_evento: servicio.fecha_evento,
        hora_evento: servicio.hora_evento ? servicio.hora_evento.substring(0, 5) : '',
        modalidad: servicio.modalidad || 'Servicio Externo',
        direccion: servicio.direccion || '',
        cantidad_personas: servicio.cantidad_personas,
        observaciones: servicio.observaciones || '',
        estado: servicio.estado
      });
      setDetalles(servicio.detalles || []);
    } else {
      setFormData({
        cliente: '',
        telefono: '',
        fecha_evento: '',
        hora_evento: '',
        modalidad: 'Servicio Externo',
        direccion: '',
        cantidad_personas: 1,
        observaciones: '',
        estado: 'Pendiente'
      });
      setDetalles([]);
    }
  }, [servicio]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detalles.length === 0) {
        alert('Debes agregar al menos un producto al servicio.');
        return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        detalles
      };
      if (servicio) {
        await cateringService.updateCateringServicio(servicio.id, payload);
        if (servicio.estado !== formData.estado) {
            await cateringService.changeCateringState(servicio.id, formData.estado);
        }
      } else {
        await cateringService.createCateringServicio(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving catering:', error);
      alert('Ocurrió un error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
      setDetalles([...detalles, { producto_id: 0, cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
      const updated = [...detalles];
      if (field === 'producto_id') {
          const prod = productos.find(p => p.id === parseInt(value));
          updated[index] = {
              ...updated[index],
              producto_id: prod.id,
              precio_unitario: prod.precio_venta,
              subtotal: prod.precio_venta * updated[index].cantidad
          };
      } else if (field === 'cantidad') {
          updated[index] = {
              ...updated[index],
              cantidad: parseInt(value) || 1,
              subtotal: updated[index].precio_unitario * (parseInt(value) || 1)
          };
      }
      setDetalles(updated);
  };

  const removeDetalle = (index: number) => {
      const updated = [...detalles];
      updated.splice(index, 1);
      setDetalles(updated);
  };

  const total = detalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">
              {servicio ? `Editar Servicio ${servicio.codigo}` : 'Nuevo Servicio de Catering'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Completa la información del evento y los productos solicitados.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <form id="catering-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nombre del cliente o empresa"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Número de contacto"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Fecha del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_evento}
                  onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Hora del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.hora_evento}
                  onChange={(e) => setFormData({ ...formData, hora_evento: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Modalidad <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.modalidad}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Servicio Externo">Servicio Externo</option>
                  <option value="Recoger en Restaurante">Recoger en Restaurante</option>
                </select>
              </div>

              {formData.modalidad === 'Servicio Externo' && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      Lugar / Dirección del Evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Dirección completa"
                    />
                  </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Cantidad de Personas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.cantidad_personas}
                  onChange={(e) => setFormData({ ...formData, cantidad_personas: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {servicio && (
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="En preparación">En preparación</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                 </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Menú / Productos Solicitados</h3>
                    <button type="button" onClick={handleAddProduct} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Plus size={14}/> Agregar
                    </button>
                </div>
                
                <div className="space-y-3">
                    {detalles.map((det, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <select 
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                                value={det.producto_id || ''}
                                onChange={(e) => handleProductChange(index, 'producto_id', e.target.value)}
                                required
                            >
                                <option value="" disabled>Seleccionar Producto</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} (Bs. {p.precio_venta})</option>
                                ))}
                            </select>
                            
                            <input 
                                type="number" 
                                min="1"
                                placeholder="Cant."
                                className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                                value={det.cantidad || ''}
                                onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                                required
                            />
                            
                            <div className="w-24 text-right text-sm font-bold text-slate-700">
                                Bs. {Number(det.subtotal || 0).toFixed(2)}
                            </div>
                            
                            <button type="button" onClick={() => removeDetalle(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                    {detalles.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No hay productos agregados. Haz clic en "Agregar".</p>
                    )}
                </div>
                
                <div className="mt-4 text-right">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-4">Total Estimado:</span>
                    <span className="text-2xl font-black italic tracking-tighter text-indigo-600">Bs. {total.toFixed(2)}</span>
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Detalles adicionales, requerimientos especiales..."
                />
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="catering-form"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Guardando...' : 'Guardar Servicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CateringModal;
