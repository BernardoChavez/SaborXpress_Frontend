import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Timer, 
  UtensilsCrossed, 
  AlertCircle,
  Play,
  Check,
  Send,
  Loader2,
  PackageCheck
} from 'lucide-react';
import { cocinaService } from '../cocinaService';
import type { Comanda } from '../types/cocina.types';

const CocinaPage = () => {
    const [comandas, setComandas] = useState<Comanda[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchComandas = async () => {
        try {
            const data = await cocinaService.getComandas();
            setComandas(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComandas();
        const interval = setInterval(fetchComandas, 15000); // Polling cada 15s
        return () => clearInterval(interval);
    }, []);

    const handleUpdate = async (id: number, nuevoEstado: string) => {
        setUpdatingId(id);
        try {
            await cocinaService.updateEstado(id, nuevoEstado);
            await fetchComandas();
        } catch (e) {
            alert('Error al actualizar estado');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading && comandas.length === 0) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-orange-500" size={48} />
                <p className="text-gray-500 font-bold italic">Cargando monitor de cocina...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2">
            {/* Header Informativo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <UtensilsCrossed className="text-orange-500" size={32} />
                        Monitor de Cocina
                    </h1>
                    <p className="text-gray-500 font-medium">Gestión de comandas en tiempo real (FIFO)</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-600 uppercase">En Vivo</span>
                    </div>
                </div>
            </div>

            {/* Grid de Comandas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {comandas.map((comanda, index) => (
                        <ComandaCard 
                            key={comanda.id} 
                            comanda={comanda} 
                            priority={index < 3} 
                            loading={updatingId === comanda.id}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </AnimatePresence>

                {comandas.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <PackageCheck size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-400 italic">No hay pedidos pendientes</h2>
                        <p className="text-gray-400 text-sm">¡Buen trabajo, cocina limpia!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface CardProps {
    comanda: Comanda;
    priority: boolean;
    loading: boolean;
    onUpdate: (id: number, estado: string) => void;
}

const ComandaCard = ({ comanda, priority, loading, onUpdate }: CardProps) => {
    const minutes = Math.floor((new Date().getTime() - new Date(comanda.created_at).getTime()) / 60000);
    
    // Alertas visuales por tiempo
    const isLate = minutes >= 10;
    const isCritical = minutes >= 15;

    const statusConfig: Record<string, { color: string, label: string, icon: any }> = {
        'Pendiente': { color: 'bg-blue-500', label: 'PENDIENTE', icon: Clock },
        'En preparación': { color: 'bg-orange-500', label: 'PREPARANDO', icon: Timer },
        'Listo': { color: 'bg-green-500', label: 'LISTO PARA ENTREGA', icon: CheckCircle2 },
    };

    const config = statusConfig[comanda.estado] || statusConfig['Pendiente'];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            className={`relative bg-white rounded-[32px] overflow-hidden border-2 transition-colors ${
                isCritical ? 'border-red-500 bg-red-50/10' : 
                isLate ? 'border-orange-400 bg-orange-50/10' : 
                comanda.estado === 'Listo' ? 'border-green-500 bg-green-50/10 shadow-lg shadow-green-100' :
                'border-gray-100'
            }`}
        >
            {/* Header de la tarjeta */}
            <div className={`${config.color} p-4 text-white flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <config.icon size={18} className={comanda.estado === 'En preparación' ? 'animate-spin-slow' : ''} />
                    <span className="text-[10px] font-black tracking-widest">{config.label}</span>
                </div>
                <div className="bg-white/20 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock size={12} />
                    <span className="text-[10px] font-black">{minutes}m</span>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Pedido Nro</p>
                        <h3 className="text-2xl font-black text-gray-900">#{comanda.venta?.nro_pedido}</h3>
                    </div>
                    {priority && (
                        <div className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase">Prioridad</div>
                    )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {comanda.venta?.detalles?.map((det, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100/50">
                            <span className="text-sm font-bold text-gray-700">
                                <span className="text-orange-500 mr-2">{det.cantidad}x</span>
                                {det.producto?.nombre}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                    {comanda.estado === 'Pendiente' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'En preparación')}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Play size={14} fill="currentColor" /> Empezar Preparación</>}
                        </button>
                    )}

                    {comanda.estado === 'En preparación' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'Listo')}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Check size={16} strokeWidth={3} /> Marcar como Listo</>}
                        </button>
                    )}

                    {comanda.estado === 'Listo' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'Entregado')}
                            className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-gray-200 transition-all active:scale-95 animate-pulse"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <><Send size={14} fill="currentColor" /> Entregar a Cliente</>}
                        </button>
                    )}
                </div>
            </div>

            {/* Banner de urgencia */}
            {isCritical && (
                <div className="bg-red-500 text-white text-center py-1 flex items-center justify-center gap-2 animate-pulse">
                    <AlertCircle size={10} />
                    <span className="text-[8px] font-black uppercase">¡Pedido muy retrasado!</span>
                </div>
            )}
        </motion.div>
    );
};

export default CocinaPage;
