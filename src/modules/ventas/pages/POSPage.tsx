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
  QrCode
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
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.cantidad + delta);
        return { ...i, cantidad: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const total = cart.reduce((sum, i) => sum + (Number(i.precio_venta) * i.cantidad), 0);

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
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 max-w-lg w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-inner">
            <Lock size={48} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 italic">VENTA RESTRINGIDA</h1>
            <p className="text-gray-500 font-medium">No puedes realizar ventas porque no hay ninguna caja abierta en este momento.</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
             <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-4">Requerido para continuar:</p>
             <button 
                onClick={() => navigate('/caja')}
                className="w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-gray-200"
             >
               IR A ABRIR CAJA
               <ArrowRight size={20} />
             </button>
          </div>
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
      {/* Resto del POS igual... */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="space-y-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedCat('all')} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCat === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>
              Todos
            </button>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCat === cat.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredProds.map(prod => (
                <motion.div key={prod.id} whileTap={{ scale: 0.96 }} onClick={() => addToCart(prod)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                  <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                    {prod.imagen_url ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={32} /></div>}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 truncate">{prod.nombre}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-black text-base">Bs. {Number(prod.precio_venta).toFixed(2)}</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={16} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>

      <div className="w-96 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col shrink-0 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><ShoppingBag size={20} /></div>
                <h2 className="font-black text-gray-900">Tu Pedido</h2>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <ShoppingBag size={64} className="mb-4" />
                    <p className="font-bold">Carrito vacío</p>
                </div>
            ) : (
                <AnimatePresence initial={false}>
                    {cart.map(item => (
                        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-2xl group">
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 shrink-0 overflow-hidden">
                                {item.imagen_url ? <img src={item.imagen_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Utensils size={14}/></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{item.nombre}</h4>
                                <p className="text-xs font-bold text-orange-500">Bs. {Number(item.precio_venta).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm"><Minus size={14}/></button>
                                <span className="text-sm font-black w-4 text-center">{item.cantidad}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm"><Plus size={14}/></button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>

        <div className="p-6 bg-gray-900 text-white space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between text-2xl font-black">
                    <span>Total</span>
                    <span className="text-orange-400">Bs. {total.toFixed(2)}</span>
                </div>
            </div>

            <button 
                disabled={cart.length === 0}
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black rounded-2xl shadow-xl shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Continuar al Pago <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black text-gray-900">Finalizar Pedido</h2>
                            <button onClick={() => setShowCheckout(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900"><X size={24} /></button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Tipo de Entrega</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[{ id: 'Mesa', label: 'Para mesa', icon: <Utensils size={24} /> }, { id: 'Llevar', label: 'Para llevar', icon: <PackageCheck size={24} /> }].map(opt => (
                                    <button key={opt.id} onClick={() => setTipoEntrega(opt.id as any)} className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${tipoEntrega === opt.id ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                                        {opt.icon} <span className="font-bold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Método de Pago</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[{ id: 'Efectivo', label: 'Efectivo', icon: <Banknote size={24} /> }, { id: 'QR', label: 'Transferencia QR', icon: <QrCode size={24} /> }].map(opt => (
                                    <button key={opt.id} onClick={() => setMetodoPago(opt.id as any)} className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${metodoPago === opt.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                                        {opt.icon} <span className="font-bold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between">
                            <div><p className="text-xs font-bold text-gray-400 uppercase">Total a pagar</p><p className="text-4xl font-black text-gray-900">Bs. {total.toFixed(2)}</p></div>
                            <button disabled={submitting} onClick={handleFinalizarVenta} className="px-8 py-5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 flex items-center gap-3">
                                {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} CONFIRMAR Y PAGAR
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
