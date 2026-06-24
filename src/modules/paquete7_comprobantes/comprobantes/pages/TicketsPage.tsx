import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, RefreshCw, TrendingUp, X } from 'lucide-react';
import { ventaService } from '../../../paquete5_ventas/ventas/services/ventaService';
import TicketModal from '../../../paquete5_ventas/ventas/components/TicketModal';

const TicketsPage = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Ticket
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketText, setTicketText] = useState('');

  // Estados para Anulación
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [ticketToAnular, setTicketToAnular] = useState<any | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVentas = async () => {
    setLoading(true);
    try {
      // Reutilizamos el servicio existente de ventas
      const sales = await ventaService.getVentas();
      setVentas(sales);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const handleVerTicket = async (id: number) => {
    try {
        const data = await ventaService.getTicket(id);
        if (data && data.ticket_text) {
            setTicketText(data.ticket_text);
            setShowTicketModal(true);
        } else {
            alert('No se pudo obtener el ticket');
        }
    } catch (e) {
        alert('Error al obtener el ticket');
    }
  };

  const handleOpenAnular = (venta: any) => {
    setTicketToAnular(venta);
    setMotivoAnulacion('');
    setShowAnularModal(true);
  };

  const submitAnulacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoAnulacion.trim()) {
      alert("Por favor ingrese el motivo de la anulación.");
      return;
    }

    setSubmitting(true);
    try {
      await ventaService.anularTicket(ticketToAnular.id, motivoAnulacion);
      alert(`El ticket #${ticketToAnular?.nro_pedido} fue anulado exitosamente.`);
      setShowAnularModal(false);
      setTicketToAnular(null);
      fetchVentas(); // Actualizar tabla
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al anular el ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Receipt size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets Operativos</h1>
            <p className="text-sm text-gray-500">Historial de comprobantes emitidos en POS</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchVentas}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
            </button>
        </div>
      </div>

      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
      >
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase italic flex items-center gap-2"><TrendingUp size={20} className="text-orange-500"/> Ventas Registradas</h3>
                <span className="text-xs font-bold text-gray-400">Últimos tickets</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            <th className="p-3">Pedido</th>
                            <th className="p-3">Hora</th>
                            <th className="p-3">Monto</th>
                            <th className="p-3">Método</th>
                            <th className="p-3">Comanda</th>
                            <th className="p-3 text-right">Comprobante</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                        {loading && ventas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-400 italic">Cargando tickets...</td>
                            </tr>
                        ) : ventas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-400 italic">No hay ventas registradas.</td>
                            </tr>
                        ) : (
                            ventas.map((v: any) => (
                                <tr key={v.id} className="hover:bg-gray-50/50">
                                    <td className="p-3 font-black text-gray-900">#{String(v.nro_pedido).padStart(3, '0')}</td>
                                    <td className="p-3 text-gray-400">{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-3 font-bold text-gray-800">
                                        {v.estado === 'Cancelado' ? (
                                            <span className="line-through text-red-400">Bs. {Number(v.monto_total).toFixed(2)}</span>
                                        ) : (
                                            <span>Bs. {Number(v.monto_total).toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-500 font-medium">{v.metodo_pago}</td>
                                    <td className="p-3">
                                        {v.estado === 'Cancelado' ? (
                                            <span className="inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-100">
                                                Anulado
                                            </span>
                                        ) : (
                                            <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                                v.VentaEstado === 'Listo' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                            }`}>
                                                {v.VentaEstado || 'Pendiente'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 flex items-center justify-end gap-2">
                                        {v.estado !== 'Cancelado' && (
                                            <button
                                                onClick={() => handleOpenAnular(v)}
                                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-black text-[9px] uppercase rounded-lg transition-colors border border-red-100 hover:border-red-500"
                                            >
                                                Anular
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleVerTicket(v.id)}
                                            className="px-2.5 py-1.5 bg-gray-900 hover:bg-orange-500 text-white font-black text-[9px] uppercase rounded-lg transition-colors"
                                        >
                                            Ticket
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </motion.div>

      {/* Ticket Modal Reutilizado */}
      <TicketModal 
          isOpen={showTicketModal}
          onClose={() => { setShowTicketModal(false); setTicketText(''); }}
          ticketText={ticketText}
      />

      {/* Modal de Anulación */}
      <AnimatePresence>
        {showAnularModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => !submitting && setShowAnularModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">Anular Ticket</h3>
                    <p className="text-xs text-red-600 font-bold uppercase">Pedido #{String(ticketToAnular?.nro_pedido).padStart(3, '0')}</p>
                  </div>
                </div>
                <button
                  onClick={() => !submitting && setShowAnularModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitAnulacion} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Motivo de la Anulación
                  </label>
                  <textarea
                    required
                    value={motivoAnulacion}
                    onChange={(e) => setMotivoAnulacion(e.target.value)}
                    placeholder="Escriba la razón detallada (ej. Error en el pedido, Cliente desistió...)"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium focus:border-red-500 outline-none transition-all h-32 resize-none"
                  />
                  <p className="text-xs text-gray-500 ml-1">Este ticket será enviado al registro de Anulaciones para auditoría.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAnularModal(false)}
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-red-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? <RefreshCw className="animate-spin" size={16} /> : 'Confirmar Anulación'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TicketsPage;
