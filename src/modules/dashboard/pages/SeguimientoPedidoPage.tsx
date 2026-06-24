import { useState, useEffect } from 'react';
import {
  Search, Play, RefreshCw, FileText, CheckCircle2, Clock, UtensilsCrossed, AlertCircle
} from 'lucide-react';

interface OrderStatus {
  id: number;
  nro_pedido: number;
  estado_preparacion: string;
  monto_total: string;
  created_at: string;
}

const SeguimientoPedidoPage = () => {
  const [orderId, setOrderId] = useState('');
  const [searchingId, setSearchingId] = useState<string | null>(null);
  
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [ticketText, setTicketText] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Consultar estado y ticket
  const fetchOrderData = async (id: string) => {
    if (!id) return;
    setError(null);
    try {
      // Usamos las rutas públicas recientemente creadas
      const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
      
      const [statusRes, ticketRes] = await Promise.all([
        fetch(`${baseURL}/public/ventas/${id}/estado`),
        fetch(`${baseURL}/public/ventas/${id}/ticket`)
      ]);

      if (!statusRes.ok) {
        throw new Error('Pedido no encontrado o error en el servidor');
      }

      const statusData = await statusRes.json();
      setStatus(statusData);

      if (ticketRes.ok) {
        const ticketData = await ticketRes.json();
        setTicketText(ticketData.ticket_text);
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al obtener la información de seguimiento.');
      setStatus(null);
      setTicketText('');
    }
  };

  // Buscar manualmente
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setSearchingId(orderId.trim());
    fetchOrderData(orderId.trim()).finally(() => setLoading(false));
  };

  // Polling automático (cada 5 segundos)
  useEffect(() => {
    if (!searchingId || !autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchOrderData(searchingId);
    }, 5000);

    return () => clearInterval(interval);
  }, [searchingId, autoRefresh]);

  // Determinar progreso para el Stepper
  const getStepIndex = (estado: string) => {
    switch (estado) {
      case 'Listo': return 2;
      case 'En preparación': return 1;
      case 'Pendiente':
      default:
        return 0;
    }
  };

  const currentStep = status ? getStepIndex(status.estado_preparacion) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Módulo Cliente</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Simulación de Pantalla Externa</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
          SEGUIMIENTO DE <span className="text-orange-500">PEDIDOS</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-xl mt-1">
          Simula la interfaz que vería el cliente final en su teléfono o en la pantalla de espera de la sala para saber cuándo retirar su comida.
        </p>
      </div>

      {/* ── Buscador ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="number"
              placeholder="Ingresa el ID de la Venta para monitorear (Ej. 1, 2, 3...)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:border-orange-500 transition-all text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="px-8 py-4 bg-slate-900 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Iniciar Seguimiento'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-3xl text-xs font-bold flex items-center gap-3 border border-red-100">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ── Panel de Control en Tiempo Real ─────────────────────────── */}
      {status && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda/Centro: Monitor de Estado del Pedido */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cabecera del pedido */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[120px]" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pedido Nro</p>
                <h2 className="text-4xl font-black text-slate-900 italic">#{status.nro_pedido.toString().padStart(3, '0')}</h2>
                <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  ID Venta: #{status.id}
                </span>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-4 relative z-10 self-start sm:self-center">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-xl border transition-all ${autoRefresh ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
                  title={autoRefresh ? 'Pausar monitoreo en vivo' : 'Activar monitoreo en vivo'}
                >
                  {autoRefresh ? <RefreshCw className="animate-spin size-4" /> : <Play className="size-4" />}
                </button>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">Actualización en vivo</p>
                  <p className="text-[10px] font-bold text-slate-600">
                    {autoRefresh ? 'Monitoreando cada 5s' : 'Pausado'}
                  </p>
                  {lastUpdated && (
                    <p className="text-[8px] text-slate-400 font-medium">
                      Act: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stepper del Progreso de Cocina */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Progreso del Pedido</h3>
              
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 md:px-10">
                {/* Barra de progreso de fondo */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-400 to-green-500 -translate-y-1/2 transition-all duration-500 hidden md:block" 
                  style={{ width: `${currentStep * 50}%` }}
                />

                {/* Step 1: Recibido / Pendiente */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    currentStep >= 0 
                      ? 'bg-orange-500 border-orange-100 text-white shadow-lg shadow-orange-100' 
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    <Clock size={22} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-3 text-slate-800">Recibido</p>
                  <p className="text-[9px] text-slate-400 font-medium">Orden registrada</p>
                </div>

                {/* Step 2: En cocina */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    currentStep >= 1 
                      ? 'bg-orange-500 border-orange-100 text-white shadow-lg shadow-orange-100' 
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    <UtensilsCrossed size={22} className={currentStep === 1 ? 'animate-pulse' : ''} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-3 text-slate-800">En Preparación</p>
                  <p className="text-[9px] text-slate-400 font-medium">Cocinero preparando</p>
                </div>

                {/* Step 3: Listo para retirar */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    currentStep === 2 
                      ? 'bg-green-500 border-green-100 text-white shadow-lg shadow-green-100 animate-bounce' 
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}>
                    <CheckCircle2 size={22} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-3 text-slate-800">Listo para retirar</p>
                  <p className="text-[9px] text-slate-400 font-medium">¡Pasa al mostrador!</p>
                </div>
              </div>
            </div>

            {/* Banner de Estado Animado */}
            {currentStep === 2 ? (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-[32px] p-8 text-white text-center shadow-lg shadow-green-100 space-y-2">
                <h3 className="text-xl font-black italic uppercase tracking-tight">¡TU ORDEN ESTÁ LISTA! 🎉</h3>
                <p className="text-xs font-bold opacity-90">Por favor acércate a la barra de despacho para retirar tus platos calientes.</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-[32px] p-8 text-white text-center space-y-2">
                <h3 className="text-lg font-black italic uppercase tracking-tight animate-pulse text-orange-400">TU COMIDA SE ESTÁ PREPARANDO... 👨‍🍳</h3>
                <p className="text-xs font-bold opacity-80">Nuestros chefs están cocinando con ingredientes frescos. ¡En unos minutos estará listo!</p>
              </div>
            )}

          </div>

          {/* Columna Derecha: Vista previa del Ticket */}
          <div className="space-y-6">
            <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                <FileText className="text-orange-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Comprobante de Pago</h3>
              </div>
              
              {ticketText ? (
                <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 font-mono text-[9px] text-slate-700 leading-tight whitespace-pre shadow-inner max-w-full overflow-x-auto">
                  {ticketText}
                </div>
              ) : (
                <div className="text-center py-12 text-xs font-bold text-slate-400 italic">
                  Cargando ticket...
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Vacío inicial */}
      {!status && !loading && (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-4 shadow-sm max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Clock size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase italic text-slate-800">Esperando ID de Pedido</h3>
            <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
              Ingresa el ID de cualquier venta en el buscador superior para iniciar la simulación del seguimiento en tiempo real del pedido.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeguimientoPedidoPage;
