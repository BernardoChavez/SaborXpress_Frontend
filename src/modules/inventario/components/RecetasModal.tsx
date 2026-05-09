import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, ArrowRightLeft, Utensils, Info, Trash2, ChevronRight } from 'lucide-react';
import { inventarioService } from '../inventarioService';
import { productoService } from '../../catalogo/catalogoService';
import type { InventarioItem, Receta } from '../types/inventario.types';
import type { Producto } from '../../catalogo/types/catalogo.types';

interface Props {
  open: boolean;
  onClose: () => void;
  bruto: InventarioItem[];
  procesado: InventarioItem[];
  onSuccess: () => void;
}

const RecetasModal = ({ open, onClose, bruto, procesado, onSuccess }: Props) => {
  const [activeSubTab, setActiveSubTab] = useState<'ficha' | 'receta'>('ficha');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Listas de visualización
  const [recetaActual, setRecetaActual] = useState<Receta[]>([]);

  // Form Ficha
  const [idBruto, setIdBruto] = useState('');
  const [idProcesadoFicha, setIdProcesadoFicha] = useState('');
  const [cantBruto, setCantBruto] = useState('1');
  const [cantProcesado, setCantProcesado] = useState('0');

  // Form Receta
  const [idProducto, setIdProducto] = useState('');
  const [idProcesadoReceta, setIdProcesadoReceta] = useState('');
  const [cantReceta, setCantReceta] = useState('0');

  useEffect(() => {
    if (open) loadProductos();
  }, [open]);

  useEffect(() => {
    if (idProducto) loadReceta(Number(idProducto));
    else setRecetaActual([]);
  }, [idProducto]);

  const loadProductos = async () => {
    setLoadingData(true);
    try {
        const data = await productoService.getAll();
        setProductos(data);
    } finally {
        setLoadingData(false);
    }
  };

  const loadReceta = async (id: number) => {
    try {
        const data = await inventarioService.getRecetasByProducto(id);
        setRecetaActual(data);
    } catch (e) {
        console.error(e);
    }
  };

  const handleSaveFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await inventarioService.createFicha({
            id_bruto: Number(idBruto),
            id_procesado: Number(idProcesadoFicha),
            cantidad_bruto: Number(cantBruto),
            cantidad_procesado: Number(cantProcesado)
        });
        alert('Relación de transformación guardada');
        onSuccess();
    } finally {
        setSubmitting(false);
    }
  };

  const handleSaveReceta = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await inventarioService.createReceta({
            id_producto: Number(idProducto),
            id_procesado: Number(idProcesadoReceta),
            cantidad: Number(cantReceta)
        });
        loadReceta(Number(idProducto));
        onSuccess();
    } finally {
        setSubmitting(false);
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
            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px]"
          >
                {/* Sidebar del Modal */}
                <div className="w-full md:w-56 bg-gray-50 border-r border-gray-100 p-6 space-y-4">
                    <button 
                        onClick={() => setActiveSubTab('ficha')}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${activeSubTab === 'ficha' ? 'bg-white shadow-md text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <ArrowRightLeft size={20} className="mb-2" />
                        <span className="text-[10px] font-black uppercase">Transformación</span>
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('receta')}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${activeSubTab === 'receta' ? 'bg-white shadow-md text-orange-600 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Utensils size={20} className="mb-2" />
                        <span className="text-[10px] font-black uppercase">Receta Menú</span>
                    </button>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Configuración Inteligente</h2>
                            <p className="text-sm text-gray-500">{activeSubTab === 'ficha' ? 'Gestión de Fichas Técnicas' : 'Gestión de Ingredientes por Plato'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                        {activeSubTab === 'ficha' ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                <form onSubmit={handleSaveFicha} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><ArrowRightLeft size={18} className="text-blue-500" /> Nueva Relación</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Materia Prima</label>
                                            <select value={idBruto} onChange={e => setIdBruto(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                                                <option value="">Seleccionar...</option>
                                                {bruto.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Produce Insumo</label>
                                            <select value={idProcesadoFicha} onChange={e => setIdProcesadoFicha(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                                                <option value="">Seleccionar...</option>
                                                {procesado.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">De 1 Unidad...</label>
                                                <input type="number" value={cantBruto} onChange={e => setCantBruto(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Salen (Cant.)</label>
                                                <input type="number" value={cantProcesado} onChange={e => setCantProcesado(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                    <button disabled={submitting} type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95">
                                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'GUARDAR FICHA'}
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest px-2">Ayuda Visual</h3>
                                    <div className="bg-white p-6 rounded-3xl border border-dashed border-gray-200 text-center space-y-3">
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                                            <Info size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500">Define cuánto producto utilizable sale de una unidad de compra. <br/><b>Ej: 1 Saco = 50 kg de Papa.</b></p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                <form onSubmit={handleSaveReceta} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Utensils size={18} className="text-orange-500" /> Añadir Ingrediente</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Producto Final</label>
                                            <select value={idProducto} onChange={e => setIdProducto(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium">
                                                <option value="">Seleccionar plato...</option>
                                                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Insumo que gasta</label>
                                            <select value={idProcesadoReceta} onChange={e => setIdProcesadoReceta(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium">
                                                <option value="">Seleccionar insumo...</option>
                                                {procesado.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cantidad por porción</label>
                                            <input type="number" step="0.001" value={cantReceta} onChange={e => setCantReceta(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-lg text-orange-600" />
                                        </div>
                                    </div>
                                    <button disabled={submitting || !idProducto} type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50">
                                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'ASIGNAR A RECETA'}
                                    </button>
                                </form>

                                <div className="bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm">
                                    <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 text-sm">Receta Actual</h3>
                                        {idProducto && <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-lg font-black uppercase">En Vivo</span>}
                                    </div>
                                    <div className="flex-1 p-4 space-y-3">
                                        {!idProducto ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8">
                                                <Utensils size={40} className="mb-2" />
                                                <p className="text-xs font-bold">Selecciona un producto para ver su receta</p>
                                            </div>
                                        ) : recetaActual.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8">
                                                <p className="text-xs font-bold italic">No hay ingredientes asignados aún</p>
                                            </div>
                                        ) : (
                                            recetaActual.map((r, i) => (
                                                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl group transition-all hover:bg-orange-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-500 shadow-sm">
                                                            <ChevronRight size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800">{r.procesado?.nombre}</p>
                                                            <p className="text-[10px] text-gray-400 font-black">{r.cantidad} {r.procesado?.unidad_medida}</p>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RecetasModal;
