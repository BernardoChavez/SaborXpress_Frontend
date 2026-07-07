import React, { useState, useEffect } from 'react';
import { X, Gift, Package, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productoService } from '../../paquete3_configuracion/catalogo/catalogoService';

interface ComboModalProps {
    isOpen: boolean;
    comboEdit?: any;
    onClose: () => void;
    onSubmit: (comboData: any, id?: number) => Promise<void>;
}

export default function ComboModal({ isOpen, comboEdit, onClose, onSubmit }: ComboModalProps) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioVenta, setPrecioVenta] = useState('');
    const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
    
    // Lista de productos seleccionados para el combo
    const [productosCombo, setProductosCombo] = useState<{producto_id: number, cantidad: number}[]>([]);
    const [selectedProducto, setSelectedProducto] = useState('');
    const [cantidad, setCantidad] = useState('1');
    const [estado, setEstado] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            productoService.getAll().then(setProductosDisponibles).catch(console.error);
            if (comboEdit) {
                setNombre(comboEdit.nombre);
                setDescripcion(comboEdit.descripcion || '');
                setPrecioVenta(String(comboEdit.precio_venta));
                setEstado(comboEdit.estado ?? true);
                setProductosCombo(comboEdit.productos?.map((p: any) => ({
                    producto_id: p.producto_id,
                    cantidad: p.cantidad
                })) || []);
            } else {
                setNombre('');
                setDescripcion('');
                setPrecioVenta('');
                setEstado(true);
                setProductosCombo([]);
            }
        }
    }, [isOpen, comboEdit]);

    const handleAddProducto = () => {
        if (!selectedProducto) return;
        setProductosCombo(prev => [...prev, { producto_id: Number(selectedProducto), cantidad: Number(cantidad) }]);
        setSelectedProducto('');
        setCantidad('1');
    };

    const handleRemoveProducto = (index: number) => {
        setProductosCombo(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre || !precioVenta || productosCombo.length === 0) return;
        
        setIsSubmitting(true);
        try {
            await onSubmit({
                nombre,
                descripcion,
                precio_venta: Number(precioVenta),
                estado: estado ? 1 : 0,
                productos: productosCombo
            }, comboEdit?.id);
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
                        key="combo-backdrop" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        key="combo-modal" 
                        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-8">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-orange-500 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Gift size={20} /> {comboEdit ? 'Editar Combo' : 'Armar Nuevo Combo'}
                                </h2>
                                <button onClick={onClose} className="text-white hover:text-gray-200 rounded-lg p-1 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                    
                                    {/* Nombre */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
                                            Nombre del Combo
                                        </label>
                                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                                            placeholder="Ej: Combo Familiar"
                                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-medium" 
                                        />
                                    </div>
                                    
                                    {/* Descripción */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
                                            Descripción (Opcional)
                                        </label>
                                        <input type="text" value={descripcion} onChange={e => setDescripcion(e.target.value)}
                                            placeholder="Ej: Para 4 personas"
                                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-medium" 
                                        />
                                    </div>

                                    {/* Precio y Estado */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
                                                Precio de Venta Especial
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                                                <input type="number" step="0.01" min="0" value={precioVenta} onChange={e => setPrecioVenta(e.target.value)} required
                                                    placeholder="0.00"
                                                    className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-bold" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 mb-1.5">
                                                Estado del Combo
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => setEstado(!estado)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${estado ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
                                            >
                                                <span className="font-bold text-sm">{estado ? 'Activo (Visible)' : 'Inactivo (Oculto)'}</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${estado ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${estado ? 'left-[22px]' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Productos del Combo */}
                                    <div className="mt-6 border-2 border-orange-100 rounded-2xl p-5 bg-orange-50/50">
                                        <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                                            <Package size={16} className="text-orange-500"/> ¿Qué productos incluye este combo?
                                        </h4>
                                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                            <select 
                                                value={selectedProducto} 
                                                onChange={(e) => setSelectedProducto(e.target.value)}
                                                className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-orange-500 transition-all"
                                            >
                                                <option value="">— Seleccionar Producto —</option>
                                                {productosDisponibles.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" min="1" 
                                                    value={cantidad} 
                                                    onChange={e => setCantidad(e.target.value)}
                                                    className="w-20 border-2 border-gray-100 rounded-xl px-3 py-3 text-sm text-center font-bold focus:outline-none focus:border-orange-500 transition-all" 
                                                    placeholder="Cant."
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddProducto}
                                                    disabled={!selectedProducto}
                                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold rounded-xl px-4 py-3 transition-colors flex items-center gap-1"
                                                >
                                                    <Plus size={18} /> Añadir
                                                </button>
                                            </div>
                                        </div>

                                        <ul className="space-y-2">
                                            {productosCombo.map((pc, idx) => {
                                                const prod = productosDisponibles.find(p => p.id === pc.producto_id);
                                                return (
                                                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-sm">
                                                        <div className="font-semibold text-gray-800">
                                                            <span className="text-orange-500 mr-2 font-black">{pc.cantidad}x</span> 
                                                            {prod?.nombre}
                                                        </div>
                                                        <button type="button" onClick={() => handleRemoveProducto(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            {productosCombo.length === 0 && (
                                                <div className="text-center py-6 text-gray-400">
                                                    <p className="text-xs font-medium">Aún no has añadido productos a este combo.</p>
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                    
                                </div>
                                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <button type="button" onClick={onClose}
                                        className="px-5 py-3 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting || productosCombo.length === 0}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:bg-gray-400 rounded-xl shadow-lg shadow-orange-200 transition-all">
                                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                        {comboEdit ? 'Guardar Cambios' : 'Guardar Combo'}
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
