import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Ruler, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { CreateInventarioDto, InventarioItem } from '../types/inventario.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: 'bruto' | 'procesado';
  itemToEdit?: InventarioItem | null;
}

const ItemInventarioModal = ({ open, onClose, onSuccess, tipo, itemToEdit }: Props) => {
  const [formData, setFormData] = useState<CreateInventarioDto>({
    nombre: '',
    stock: 0,
    unidad_medida: 'kg',
    stock_minimo: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        nombre: itemToEdit.nombre,
        stock: itemToEdit.stock,
        unidad_medida: itemToEdit.unidad_medida,
        stock_minimo: itemToEdit.stock_minimo
      });
    } else {
      setFormData({ nombre: '', stock: 0, unidad_medida: 'kg', stock_minimo: 5 });
    }
  }, [itemToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (itemToEdit) {
          if (tipo === 'bruto') {
            await inventarioService.updateBruto(itemToEdit.id, formData);
          } else {
            await inventarioService.updateProcesado(itemToEdit.id, formData);
          }
      } else {
          if (tipo === 'bruto') {
            await inventarioService.createBruto(formData);
          } else {
            await inventarioService.createProcesado(formData);
          }
      }
      onSuccess();
      onClose();
    } catch (error) {
        console.error(error);
        alert('Error al guardar el item');
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
            <div className={`p-6 text-white flex items-center justify-between ${tipo === 'bruto' ? 'bg-blue-600' : 'bg-green-600'}`}>
                <div className="flex items-center gap-3">
                    <Package size={24} />
                    <h2 className="text-xl font-bold">{itemToEdit ? 'Editar' : 'Añadir'} {tipo === 'bruto' ? 'Materia Prima' : 'Insumo Procesado'}</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre del producto</label>
                    <input 
                        required
                        type="text"
                        placeholder="Ej. Saco de Papa, Pollo Limpio..."
                        value={formData.nombre}
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Stock {itemToEdit ? 'Actual' : 'Inicial'}</label>
                        <input 
                            required
                            type="number"
                            value={formData.stock}
                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Unidad de Medida</label>
                        <select 
                            value={formData.unidad_medida}
                            onChange={e => setFormData({...formData, unidad_medida: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        >
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="u">Unidades (u)</option>
                            <option value="lt">Litros (lt)</option>
                            <option value="gr">Gramos (gr)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                        <AlertTriangle size={10} className="text-orange-500" />
                        Stock Mínimo (Alerta)
                    </label>
                    <input 
                        required
                        type="number"
                        value={formData.stock_minimo}
                        onChange={e => setFormData({...formData, stock_minimo: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit"
                    className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        tipo === 'bruto' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {itemToEdit ? 'ACTUALIZAR CAMBIOS' : 'GUARDAR EN INVENTARIO'}
                </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ItemInventarioModal;
