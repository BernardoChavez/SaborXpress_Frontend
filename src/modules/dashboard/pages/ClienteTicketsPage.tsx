import { useState, useEffect } from 'react';
import { 
  FileText, Clock, CreditCard, ChevronRight, Receipt, Loader
} from 'lucide-react';
import { ventaService } from '../../paquete5_ventas/ventas/services/ventaService';
import TicketModal from '../../paquete5_ventas/ventas/components/TicketModal';

const ClienteTicketsPage = () => {
  const [compras, setCompras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal de Ticket (CU23)
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketText, setTicketText] = useState('');

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = async () => {
    setLoading(true);
    try {
      // getVentas en backend ya filtra por usuario si es de rol 'Cliente'
      const data = await ventaService.getVentas();
      setCompras(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerTicket = async (id: number) => {
    try {
      const data = await ventaService.getTicket(id);
      if (data && data.ticket_text) {
        setTicketText(data.ticket_text);
        setShowTicketModal(true);
      }
    } catch (e) {
      alert('Error al cargar el comprobante');
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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Historial</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Mis Compras</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
          MIS <span className="text-orange-500">TICKETS</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-xl mt-1">
          Accede a todos los comprobantes operativos y detalles de facturación de los pedidos que has realizado.
        </p>
      </div>

      {/* ── Historial de Tickets ─────────────────────────────────────────── */}
      {compras.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Receipt size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase italic text-slate-800">Sin compras registradas</h3>
            <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
              Aún no has realizado ningún pedido en la tienda. ¡Realiza tu primer pedido en la sección de compra!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Receipt size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Lista de Comprobantes</h2>
            </div>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Entrega</th>
                  <th className="p-4">Método</th>
                  <th className="p-4">Importe</th>
                  <th className="p-4 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => (
                  <tr key={compra.id} className="border-b border-gray-50 text-xs font-bold text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="text-slate-900 font-black">#{compra.nro_pedido.toString().padStart(3, '0')}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        {new Date(compra.created_at).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        {compra.tipo_entrega}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={12} className="text-slate-400" />
                        {compra.codigo_qr?.includes('Tarjeta') ? 'TARJETA' : compra.metodo_pago}
                      </div>
                    </td>
                    <td className="p-4 text-orange-600 font-black text-sm">
                      Bs. {Number(compra.monto_total).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleVerTicket(compra.id)}
                        className="px-4 py-2 bg-slate-900 hover:bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                      >
                        <FileText size={12} />
                        Ver Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TicketModal 
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticketText={ticketText}
      />
    </div>
  );
};

export default ClienteTicketsPage;
