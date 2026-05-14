import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Utensils,
  PackageCheck,
  Banknote,
  QrCode,
  Calculator,
  Wallet,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriaService, productoService } from '../../catalogo/catalogoService';
import { cajaService } from '../services/cajaService';
import { ventaService } from '../services/ventaService';
import { useNavigate } from 'react-router-dom';
import type { Categoria, Producto } from '../../catalogo/types/catalogo.types';

interface CartItem extends Producto {
  cantidad: number;
}

const POSPage = () => {
  const navigate = useNavigate();
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'QR'>('Efectivo');
  const [tipoEntrega, setTipoEntrega] = useState<'Mesa' | 'Llevar'>('Mesa');
  const [submitting, setSubmitting] = useState(false);

  // Estados para Cobro Estilo Supermercado
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [qrConfirmado, setQrConfirmado] = useState(false);

  useEffect(() => {
    checkCaja();
  }, []);

  const checkCaja = async () => {
    setLoading(true);
    try {
        const { abierta } = await cajaService.getEstado();
        setCajaAbierta(abierta);
        if (abierta) {
            await loadCatalog();
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const [cats, prods] = await Promise.all([
        categoriaService.getAll(),
        productoService.getAll()
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (e) {
        console.error(e);
    }
  };

  const addToCart = (prod: Producto) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === prod.id);
      if (exists) return prev.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (item && item.cantidad === 1 && delta === -1) {
            return prev.filter(i => i.id !== id);
        }
        return prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + delta } : i);
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((sum, i) => sum + (Number(i.precio_venta) * i.cantidad), 0);

  // Cálculos de vuelto
  const cambio = Math.max(0, Number(montoRecibido) - total);
  const puedePagarEfectivo = Number(montoRecibido) >= total;

  const handleFinalizarVenta = async () => {
    setSubmitting(true);
    try {
      await ventaService.registrar({
        metodo_pago: metodoPago,
        tipo_entrega: tipoEntrega,
        detalles: cart.map(i => ({
          id_producto: i.id,
          cantidad: i.cantidad,
          precio_unitario: Number(i.precio_venta)
        }))
      });
      setCart([]);
      setShowCheckout(false);
      setMontoRecibido('');
      setQrConfirmado(false);
      alert('Venta realizada con éxito');
    } catch (e) {
      alert('Error al procesar venta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && cajaAbierta === null) {
      return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={48} />
        </div>
      );
  }

  if (cajaAbierta === false) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 max-w-lg w-full text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-inner"><Lock size={48} /></div>
          <div className="space-y-3"><h1 className="text-3xl font-black text-gray-900 italic uppercase">Caja Cerrada</h1><p className="text-gray-500 font-medium">Abre un turno en la sección de Caja para poder vender.</p></div>
          <button onClick={() => navigate('/caja')} className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-gray-200">IR A GESTIÓN DE CAJA <ArrowRight size={20} /></button>
        </motion.div>
      </div>
    );
  }

  const filteredProds = productos.filter(p => {
    const matchesCat = selectedCat === 'all' || p.id_categoria === selectedCat;
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 overflow-hidden">
      
      {/* ── Main Area (Products) ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="space-y-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="¿Qué busca el cliente?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-3xl shadow-sm focus:border-orange-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedCat('all')} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCat === 'all' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>Todos</button>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>{cat.nombre}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
              {filteredProds.map(prod => (
                <motion.div key={prod.id} whileTap={{ scale: 0.96 }} onClick={() => addToCart(prod)} className="bg-white p-4 rounded-[32px] border-2 border-transparent hover:border-orange-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                  <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                    {prod.imagen_url ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={40} /></div>}
                  </div>
                  <h3 className="font-black text-gray-900 text-sm leading-tight mb-2 truncate uppercase">{prod.nombre}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-black text-lg">Bs. {Number(prod.precio_venta).toFixed(2)}</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100"><Plus size={20} strokeWidth={3} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>

      {/* ── Cart Sidebar ────────────────────────────────────────────────── */}
      <div className="w-[380px] bg-white rounded-[40px] shadow-2xl border border-gray-100 flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-100"><ShoppingBag size={20} /></div>
                <div><h2 className="font-black text-gray-900 italic uppercase text-sm">Pedido Actual</h2></div>
            </div>
            {cart.length > 0 && (
                <button onClick={() => setCart([])} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Vaciar carrito">
                    <Trash2 size={18} />
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <ShoppingBag size={64} className="mb-4" />
                    <p className="font-black uppercase italic text-xs">Esperando pedido...</p>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {cart.map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl group">
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 shrink-0 overflow-hidden">
                                {item.imagen_url ? <img src={item.imagen_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Utensils size={14}/></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[10px] font-black text-gray-900 truncate uppercase mb-1">{item.nombre}</h4>
                                <p className="text-[10px] font-bold text-orange-500">Bs. {(Number(item.precio_venta) * item.cantidad).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-all"><Minus size={12}/></button>
                                <span className="text-xs font-black w-4 text-center">{item.cantidad}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition-all"><Plus size={12}/></button>
                                <button onClick={() => removeFromCart(item.id)} className="ml-1 p-1 text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>

        <div className="p-6 bg-gray-900 text-white space-y-4">
            <div className="flex justify-between items-end">
                <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Orden</p><span className="text-3xl font-black italic">Bs. {total.toFixed(2)}</span></div>
            </div>
            <button disabled={cart.length === 0} onClick={() => setShowCheckout(true)} className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">CONTINUAR AL PAGO <ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ── Checkout Modal (REFINED DESIGN) ─────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden flex h-[500px]">
                    
                    {/* Left: Summary Panel */}
                    <div className="w-72 bg-gray-50 p-8 border-r border-gray-100 flex flex-col">
                        <h3 className="text-sm font-black italic uppercase mb-6 text-gray-400 tracking-widest">Resumen</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {cart.map(i => (
                                <div key={i.id} className="flex justify-between text-[10px] font-bold text-gray-600">
                                    <span className="truncate pr-4">{i.cantidad}x {i.nombre}</span>
                                    <span className="shrink-0">{(i.cantidad * Number(i.precio_venta)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-200 mt-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total a cobrar</p>
                            <p className="text-3xl font-black text-gray-900">Bs. {total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Right: Payment Panel */}
                    <div className="flex-1 p-10 flex flex-col justify-between">
                        <div className="space-y-8">
                            {/* Metodo Select */}
                            <div className="flex gap-4">
                                <button onClick={() => setMetodoPago('Efectivo')} className={`flex-1 p-4 rounded-3xl border-2 transition-all flex items-center gap-3 ${metodoPago === 'Efectivo' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metodoPago === 'Efectivo' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}><Banknote size={20}/></div>
                                    <div className="text-left"><p className="text-[8px] font-black uppercase text-gray-400">Pago con</p><p className="font-black text-sm uppercase">Efectivo</p></div>
                                </button>
                                <button onClick={() => setMetodoPago('QR')} className={`flex-1 p-4 rounded-3xl border-2 transition-all flex items-center gap-3 ${metodoPago === 'QR' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metodoPago === 'QR' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}><QrCode size={20}/></div>
                                    <div className="text-left"><p className="text-[8px] font-black uppercase text-gray-400">Pago con</p><p className="font-black text-sm uppercase">QR</p></div>
                                </button>
                            </div>

                            {/* Logic Area */}
                            <AnimatePresence mode="wait">
                                {metodoPago === 'Efectivo' ? (
                                    <motion.div key="cash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><Calculator size={12}/> Recibido</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-gray-300">Bs.</span>
                                                    <input autoFocus type="number" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-3xl font-black outline-none focus:border-orange-500 transition-all" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><Wallet size={12}/> Vuelto</label>
                                                <div className={`w-full py-5 px-6 rounded-3xl border-2 flex flex-col justify-center ${cambio > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                                    <p className={`text-3xl font-black ${cambio > 0 ? 'text-green-600' : 'text-gray-300'}`}>Bs. {cambio.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {!puedePagarEfectivo && montoRecibido !== '' && (
                                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle size={14} /> El monto es insuficiente.</div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-blue-50/50 p-6 rounded-[32px] border-2 border-blue-100 flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-md animate-pulse"><QrCode size={32} /></div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-blue-900 italic uppercase">Esperando QR</h4>
                                            <p className="text-[10px] text-blue-600 font-bold max-w-xs">Verifica el comprobante antes de confirmar la venta.</p>
                                        </div>
                                        <button onClick={() => setQrConfirmado(!qrConfirmado)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${qrConfirmado ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-blue-500 border border-blue-200'}`}>
                                            {qrConfirmado ? <><CheckCircle2 size={14}/> VERIFICADO</> : <><Info size={14}/> CONFIRMAR RECEPCIÓN</>}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={() => setShowCheckout(false)} className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
                            <button 
                                disabled={submitting || (metodoPago === 'Efectivo' && !puedePagarEfectivo) || (metodoPago === 'QR' && !qrConfirmado)} 
                                onClick={handleFinalizarVenta} 
                                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 uppercase italic ${
                                    metodoPago === 'Efectivo' ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-blue-600 text-white shadow-blue-100'
                                } disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none`}
                            >
                                {submitting ? <Loader2 className="animate-spin size-4" /> : (metodoPago === 'Efectivo' ? <Banknote size={18}/> : <CheckCircle2 size={18}/>)}
                                FINALIZAR VENTA
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSPage;
