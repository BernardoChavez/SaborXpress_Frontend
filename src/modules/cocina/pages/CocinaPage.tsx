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
  PackageCheck,
  Info
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
        const interval = setInterval(fetchComandas, 15000); 
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
        <div className="space-y-8 p-2 pb-20">
            {/* Header Informativo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <UtensilsCrossed className="text-orange-500" size={32} />
                        Monitor de Cocina
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Gestión de comandas en tiempo real (FIFO)</p>
                </div>
                
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-black text-gray-800 uppercase tracking-widest">En Vivo</span>
                </div>
            </div>

            {/* Grid de Comandas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {comandas.map((comanda, index) => (
                        <ComandaTicket 
                            key={comanda.id} 
                            comanda={comanda} 
                            priority={index < 3} 
                            loading={updatingId === comanda.id}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </AnimatePresence>

                {comandas.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-gray-50 rounded-[60px] border-4 border-dashed border-gray-200">
                        <PackageCheck size={80} className="mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-black text-gray-300 italic uppercase">Cocina Despejada</h2>
                        <p className="text-gray-400 font-medium">No hay pedidos pendientes en este momento.</p>
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

const ComandaTicket = ({ comanda, priority, loading, onUpdate }: CardProps) => {
    const minutes = Math.floor((new Date().getTime() - new Date(comanda.created_at).getTime()) / 60000);
    const dateStr = new Date(comanda.created_at).toLocaleString('es-BO', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
    
    const isLate = minutes >= 10;
    const isCritical = minutes >= 15;

    const statusColors: Record<string, string> = {
        'Pendiente': 'border-blue-400',
        'En preparación': 'border-orange-400',
        'Listo': 'border-green-500',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
                opacity: 1, y: 0,
                rotate: priority ? 0 : (comanda.id % 2 === 0 ? 0.5 : -0.5) 
            }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            className={`relative bg-white shadow-xl shadow-gray-200/50 flex flex-col transition-all duration-500 ${statusColors[comanda.estado] || 'border-gray-100'} border-t-8`}
            style={{ 
                fontFamily: "'Courier New', Courier, monospace",
                minHeight: '450px',
                clipPath: 'polygon(0 0, 100% 0, 100% 98%, 98% 100%, 96% 98%, 94% 100%, 92% 98%, 90% 100%, 88% 98%, 86% 100%, 84% 98%, 82% 100%, 80% 98%, 78% 100%, 76% 98%, 74% 100%, 72% 98%, 70% 100%, 68% 98%, 66% 100%, 64% 98%, 62% 100%, 60% 98%, 58% 100%, 56% 98%, 54% 100%, 52% 98%, 50% 100%, 48% 98%, 46% 100%, 44% 98%, 42% 100%, 40% 98%, 38% 100%, 36% 98%, 34% 100%, 32% 98%, 30% 100%, 28% 98%, 26% 100%, 24% 98%, 22% 100%, 20% 98%, 18% 100%, 16% 98%, 14% 100%, 12% 98%, 10% 100%, 8% 98%, 6% 100%, 4% 98%, 2% 100%, 0 98%)'
            }}
        >
            {/* Header del Ticket */}
            <div className="p-4 text-center space-y-1">
                <h2 className="text-xl font-black tracking-tighter">SABOR XPRESS</h2>
                <p className="text-[9px] font-bold text-gray-500">SANTA CRUZ DE LA SIERRA - BOLIVIA</p>
                <div className="py-2">
                    <p className="text-[10px] text-gray-600">FECHA: {dateStr}</p>
                    <p className="text-xs font-black mt-1">TIPO: {comanda.venta?.tipo_entrega?.toUpperCase()}</p>
                    <p className="text-xl font-black bg-black text-white px-2 py-1 mt-2 inline-block">N° COMANDA: {comanda.venta?.nro_pedido}</p>
                </div>
            </div>

            <div className="px-4 text-[10px] font-bold text-gray-400">
                ------------------------------------------
            </div>

            {/* Tabla de Items */}
            <div className="flex-1 px-4 py-2">
                <div className="flex text-[10px] font-black border-b border-dashed border-gray-200 pb-1 mb-2">
                    <span className="w-8">CANT</span>
                    <span className="flex-1">DESCRIPCION</span>
                    <span className="w-12 text-right">TOTAL</span>
                </div>
                
                <div className="space-y-3">
                    {comanda.venta?.detalles?.map((det, i) => (
                        <div key={i} className="flex text-xs leading-none">
                            <span className="w-8 font-black">{det.cantidad}</span>
                            <span className="flex-1 font-bold uppercase pr-2">{det.producto?.nombre}</span>
                            <span className="w-12 text-right">{(det.cantidad * (det.precio_unitario || 0)).toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer del Ticket */}
            <div className="p-4 bg-gray-50/50 space-y-4">
                <div className="text-[10px] font-bold text-gray-400">
                    ------------------------------------------
                </div>
                <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-black">TOTAL:</span>
                    <span className="text-xl font-black">Bs. {Number(comanda.venta?.monto_total || 0).toFixed(2)}</span>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 font-sans pt-2">
                    {comanda.estado === 'Pendiente' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'En preparación')}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin size-3" /> : <><Play size={12} fill="currentColor" /> EMPEZAR</>}
                        </button>
                    )}

                    {comanda.estado === 'En preparación' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'Listo')}
                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-orange-100 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin size-3" /> : <><Check size={14} strokeWidth={4} /> TERMINAR</>}
                        </button>
                    )}

                    {comanda.estado === 'Listo' && (
                        <button 
                            disabled={loading}
                            onClick={() => onUpdate(comanda.id, 'Entregado')}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin size-3" /> : <><Send size={12} fill="currentColor" /> ENTREGAR</>}
                        </button>
                    )}
                </div>

                {/* Reloj y Alertas */}
                <div className="flex items-center justify-between px-2 pt-2 text-[9px] font-black">
                    <div className={`flex items-center gap-1 ${isCritical ? 'text-red-600 animate-bounce' : isLate ? 'text-orange-600' : 'text-gray-400'}`}>
                        <Timer size={12} />
                        <span>HACE {minutes} MIN</span>
                    </div>
                    {isCritical && <span className="text-red-600 italic">¡URGENTE!</span>}
                </div>
            </div>

            {/* Efecto de borde de papel cortado en el CSS (usado vía clip-path arriba) */}
        </motion.div>
    );
};

export default CocinaPage;
