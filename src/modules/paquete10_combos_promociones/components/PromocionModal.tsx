import React, { useState, useEffect } from 'react';
import { X, Percent, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productoService } from '../../paquete3_configuracion/catalogo/catalogoService';

interface PromocionModalProps {
    isOpen: boolean;
    promoEdit?: any;
    onClose: () => void;
    onSubmit: (promoData: any, id?: number) => Promise<void>;
}

export default function PromocionModal({ isOpen, promoEdit, onClose, onSubmit }: PromocionModalProps) {
    const [nombre, setNombre] = useState('');
    const [tipoDescuento, setTipoDescuento] = useState('');
    const [valorDescuento, setValorDescuento] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [diasAplicables, setDiasAplicables] = useState<string[]>([]);
    const [estado, setEstado] = useState(true);
    
    const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState<Set<string>>(new Set([]));

    const [isSubmitting, setIsSubmitting] = useState(false);

    const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    useEffect(() => {
        if (isOpen) {
            productoService.getAll().then(setProductosDisponibles).catch(console.error);
            if (promoEdit) {
                setNombre(promoEdit.nombre);
                setTipoDescuento(promoEdit.tipo_descuento);
                setValorDescuento(promoEdit.valor_descuento ? String(promoEdit.valor_descuento) : '');
                setFechaInicio(promoEdit.fecha_inicio.split('T')[0]);
                setFechaFin(promoEdit.fecha_fin ? promoEdit.fecha_fin.split('T')[0] : '');
                setDiasAplicables(promoEdit.dias_aplicables || []);
                setEstado(promoEdit.estado ?? true);
                setProductosSeleccionados(new Set(
                    promoEdit.aplicaciones?.map((a: any) => String(a.aplicable_id)) || []
                ));
            } else {
                setNombre('');
                setTipoDescuento('');
                setValorDescuento('');
                setFechaInicio('');
                setFechaFin('');
                setDiasAplicables([]);
                setEstado(true);
                setProductosSeleccionados(new Set([]));
            }
        }
    }, [isOpen, promoEdit]);

    const handleDiaToggle = (dia: string) => {
        setDiasAplicables(prev => 
            prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
        );
    };

    const handleProductoToggle = (id: string) => {
        setProductosSeleccionados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !tipoDescuento || !fechaInicio || productosSeleccionados.size === 0) return;
        
        setIsSubmitting(true);
        try {
            const aplicaciones = Array.from(productosSeleccionados).map(id => ({
                aplicable_type: 'Modules\\Paquete3Configuracion\\Models\\Producto',
                aplicable_id: Number(id)
            }));

            await onSubmit({
                nombre,
                tipo_descuento: tipoDescuento,
                valor_descuento: valorDescuento ? Number(valorDescuento) : null,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin || null,
                dias_aplicables: diasAplicables.length > 0 ? diasAplicables : null,
                estado: estado ? 1 : 0,
                aplicaciones
            }, promoEdit?.id);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        key="promo-backdrop" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        key="promo-modal" 
                        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-600 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Percent size={20} /> {promoEdit ? 'Editar Promoción' : 'Crear Nueva Promoción'}
                                </h2>
                                <button onClick={onClose} className="text-white hover:text-purple-200 rounded-lg p-1 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre de Promoción</label>
                                            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required placeholder="Ej: Jueves Loco 2x1"
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-medium" />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo de Descuento</label>
                                            <select value={tipoDescuento} onChange={e => setTipoDescuento(e.target.value)} required
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-medium">
                                                <option value="">— Seleccionar —</option>
                                                <option value="porcentaje">Descuento en Porcentaje (%)</option>
                                                <option value="monto_fijo">Descuento Fijo (Bs.)</option>
                                                <option value="2x1">2x1</option>
                                            </select>
                                        </div>

                                        {tipoDescuento !== '2x1' && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Valor del Descuento</label>
                                                <input type="number" step="0.01" value={valorDescuento} onChange={e => setValorDescuento(e.target.value)} placeholder="Ej: 15"
                                                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-bold" />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Fecha de Inicio</label>
                                            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-medium" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Fecha de Fin (Opcional)</label>
                                            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                                                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all font-medium" />
                                        </div>
                                    </div>
                                    
                                    <div className="md:w-1/2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Estado de la Promoción</label>
                                        <button 
                                            type="button"
                                            onClick={() => setEstado(!estado)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${estado ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                        >
                                            <span className="font-bold text-sm">{estado ? 'Activa' : 'Inactiva'}</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${estado ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${estado ? 'left-[22px]' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Días Aplicables */}
                                    <div className="pt-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            <Calendar size={16} className="text-purple-500"/> Días Aplicables <span className="text-xs font-normal text-gray-400">(Dejar vacío para todos los días)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {DIAS.map(dia => (
                                                <button 
                                                    key={dia} type="button"
                                                    onClick={() => handleDiaToggle(dia)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${diasAplicables.includes(dia) ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'}`}
                                                >
                                                    {dia}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Productos a los que aplica */}
                                    <div className="mt-4 border-2 border-purple-100 rounded-2xl p-4 bg-purple-50/30">
                                        <h4 className="text-sm font-bold text-gray-800 mb-3">¿A qué productos aplica esta promoción?</h4>
                                        <div className="max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-xl p-2 shadow-inner">
                                            {productosDisponibles.map(p => (
                                                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={productosSeleccionados.has(p.id.toString())}
                                                        onChange={() => handleProductoToggle(p.id.toString())}
                                                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{p.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {productosSeleccionados.size === 0 && (
                                            <p className="text-xs text-red-500 mt-2 font-medium">Debes seleccionar al menos 1 producto.</p>
                                        )}
                                    </div>

                                </div>
                                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <button type="button" onClick={onClose}
                                        className="px-5 py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting || productosSeleccionados.size === 0}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:bg-gray-400 rounded-xl shadow-lg shadow-purple-200 transition-all">
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        {promoEdit ? 'Guardar Cambios' : 'Crear Promoción'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
