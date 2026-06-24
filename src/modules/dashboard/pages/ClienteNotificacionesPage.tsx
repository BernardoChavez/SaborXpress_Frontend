import { useState, useEffect } from 'react';
import { 
  Bell, Clock, UtensilsCrossed, CheckCircle2, RefreshCw, Loader
} from 'lucide-react';
import { ventaService } from '../../paquete5_ventas/ventas/services/ventaService';

interface OrderState {
  id: number;
  nro_pedido: number;
  VentaEstado: string;
  monto_total: string;
  created_at: string;
}

const ClienteNotificacionesPage = () => {
  const [pedidos, setPedidos] = useState<OrderState[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPedidos();
  }, []);

  // Polling automático cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadPedidos(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPedidos = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await ventaService.getVentas();
      
      // Filtrar pedidos recientes o activos (ej: no entregados o creados hoy)
      // En este flujo, mostramos todos los pedidos del usuario
      setPedidos(data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStepIndex = (estado: string) => {
    switch (estado) {
      case 'Listo': return 2;
      case 'En preparación': return 1;
      case 'Pendiente':
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Estado en Vivo</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Mis Notificaciones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
            ESTADO DE MIS <span className="text-orange-500">PEDIDOS</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl mt-1">
            Revisa el estado de preparación de tu comida en tiempo real desde la cocina.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm self-start sm:self-center">
          <RefreshCw className="animate-spin text-orange-500 size-4" />
          <div>
            <p className="text-[8px] font-black uppercase text-slate-400">Monitoreando en Vivo</p>
            {lastUpdated && (
              <p className="text-[10px] font-bold text-slate-600">Act: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Lista de Pedidos ─────────────────────────────────────────── */}
      {pedidos.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase italic text-slate-800">No tienes pedidos activos</h3>
            <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
              No registras pedidos recientes en preparación. ¡Ve al menú de compras para armar un pedido!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pedidos.map((pedido) => {
            const currentStep = getStepIndex(pedido.VentaEstado || 'Pendiente');
            return (
              <div key={pedido.id} className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
                
                {/* Header tarjeta */}
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Orden</span>
                    <h3 className="text-2xl font-black text-slate-900 italic">#{pedido.nro_pedido.toString().padStart(3, '0')}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Monto Total</span>
                    <span className="text-lg font-black text-orange-600">Bs. {Number(pedido.monto_total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Stepper horizontal */}
                <div className="relative flex justify-between items-center px-4">
                  {/* Linea de fondo */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2" />
                  <div 
                    className="absolute top-5 left-0 h-1 bg-gradient-to-r from-orange-400 to-green-500 -translate-y-1/2 transition-all duration-500" 
                    style={{ width: `${currentStep * 50}%` }}
                  />

                  {/* Step 1: Recibido */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      currentStep >= 0 
                        ? 'bg-orange-500 border-orange-100 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      <Clock size={16} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider mt-2">Recibido</span>
                  </div>

                  {/* Step 2: En preparación */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      currentStep >= 1 
                        ? 'bg-orange-500 border-orange-100 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      <UtensilsCrossed size={16} className={currentStep === 1 ? 'animate-pulse' : ''} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider mt-2">Preparando</span>
                  </div>

                  {/* Step 3: Listo */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      currentStep === 2 
                        ? 'bg-green-500 border-green-100 text-white shadow-md animate-bounce' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }`}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider mt-2">Listo</span>
                  </div>
                </div>

                {/* Mensaje de despacho */}
                {currentStep === 2 ? (
                  <div className="bg-green-500 text-white text-center py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-md">
                    ¡Pedido Listo! Pasa al mostrador 🍕
                  </div>
                ) : (
                  <div className="bg-slate-900 text-slate-300 text-center py-3 rounded-2xl font-black text-[10px] uppercase tracking-wider">
                    Preparando comida en cocina... 🍲
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClienteNotificacionesPage;
