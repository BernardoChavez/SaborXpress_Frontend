/**
 * APARTADO: OPERACIONES DE VENTA (POS)
 * ARCHIVO: POSPage.tsx
 * FUNCIÓN: Interfaz principal para la toma de pedidos. Gestiona el carrito,
 *          la selección de platos y el envío de comandas a la cocina.
 */
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Loader, 
  ChevronRight, 
  CheckCircle, 
  Lock, 
  ArrowRight,
  Utensils,
  DollarSign,
  Camera,
  PlusSquare,
  Wallet,
  AlertCircle,
  CreditCard,
  QrCode,
  Loader2,
  XCircle,
  Wifi,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriaService, productoService } from '../../../paquete3_configuracion/catalogo/catalogoService';
import { cajaService } from '../services/cajaService';
import { ventaService } from '../services/ventaService';
import { useNavigate } from 'react-router-dom';
import type { Categoria, Producto } from '../../../paquete3_configuracion/catalogo/types/catalogo.types';
import TicketModal from '../components/TicketModal';

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
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'QR' | 'Tarjeta'>('Efectivo');
  const [tipoEntrega, setTipoEntrega] = useState<'Mesa' | 'Llevar'>('Mesa');
  const [submitting, setSubmitting] = useState(false);

  // Estados Efectivo
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [ventaEstado, setVentaEstado] = useState('');

  // Estados QR
  const [qrConfirmado, setQrConfirmado] = useState(false);
  const [qrStep, setQrStep] = useState<number>(0); // 0: inicial, 1: esperando, 2: exitoso
  
  // Estados Tarjeta
  const [tarjetaConfirmada, setTarjetaConfirmada] = useState(false);
  const [tarjetaNombre, setTarjetaNombre] = useState('');
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaExp, setTarjetaExp] = useState('');
  const [tarjetaCVV, setTarjetaCVV] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  
  // Pasarela
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const [pasarelaPaso, setPasarelaPaso] = useState<number>(0);

  // Estados para Ticket y Facturación
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketText, setTicketText] = useState('');
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [nitCliente, setNitCliente] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');

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
  const cambio = Math.max(0, Number(montoRecibido) - total);
  const puedePagarEfectivo = Number(montoRecibido) >= total;

  // Lógica de Tarjeta Realista
  const luhnCheck = (val: string) => {
    let checksum = 0; 
    let j = 1; 
    for (let i = val.length - 1; i >= 0; i--) {
      let calc = 0;
      calc = Number(val.charAt(i)) * j;
      if (calc > 9) {
        checksum = checksum + 1;
        calc = calc - 10;
      }
      checksum = checksum + calc;
      if (j == 1) {
        j = 2;
      } else {
        j = 1;
      }
    }
    return (checksum % 10 == 0);
  };

  const validateCard = () => {
    const numberStr = tarjetaNumero.replace(/\s/g, '');
    if (numberStr.length < 15) return "Número de tarjeta incompleto";
    if (!luhnCheck(numberStr)) return "Número de tarjeta inválido o incorrecto";
    if (tarjetaExp.length < 5) return "Fecha incompleta";
    
    const [m, y] = tarjetaExp.split('/');
    const month = parseInt(m, 10);
    const year = parseInt(`20${y}`, 10);
    const now = new Date();
    
    if (month < 1 || month > 12) return "Mes de expiración inválido";
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "Esta tarjeta está vencida";
    if (tarjetaCVV.length < 3) return "CVV incompleto";
    return null;
  };

  const getCardBrand = () => {
    if (tarjetaNumero.startsWith('4')) return 'VISA';
    if (tarjetaNumero.startsWith('5')) return 'MASTERCARD';
    if (tarjetaNumero.startsWith('3')) return 'AMEX';
    return '';
  };

  const handleProcesarTarjeta = () => {
    const error = validateCard();
    if (error) {
        setCardError(error);
        return;
    }
    setCardError(null);
    setIsProcessingModal(true);
    setPasarelaPaso(1); // Conectando...
    
    setTimeout(() => {
        setPasarelaPaso(2); // Verificando fondos...
        
        setTimeout(() => {
            const rawNumber = tarjetaNumero.replace(/\s/g, '');
            if (rawNumber === '4532111122223336') {
                setPasarelaPaso(3); // Error fondos
                setTimeout(() => {
                    setIsProcessingModal(false);
                    setCardError("Transacción Rechazada: Fondos Insuficientes");
                }, 5000);
            } else if (rawNumber === '4532999988887776') {
                setPasarelaPaso(4); // Error bloqueada
                setTimeout(() => {
                    setIsProcessingModal(false);
                    setCardError("Transacción Rechazada: Tarjeta Bloqueada o Retenida");
                }, 5000);
            } else {
                setPasarelaPaso(5); // Aprobado
                setTimeout(() => {
                    setIsProcessingModal(false);
                    setTarjetaConfirmada(true);
                }, 4000);
            }
        }, 5500);
    }, 4500);
  };

  const iniciarPagoQR = () => {
    setQrStep(1);
    // Simula que el cliente tarda 5-8 segundos en sacar su cel, escanear y pagar
    const randomTime = Math.floor(Math.random() * 3000) + 4000;
    setTimeout(() => {
        setQrStep(2);
        setQrConfirmado(true);
    }, randomTime);
  };

  const handleFinalizarVenta = async () => {
    setSubmitting(true);
    try {
      const res = await ventaService.registrar({
        metodo_pago: metodoPago === 'Tarjeta' ? 'QR' : (metodoPago === 'QR' ? 'QR' : 'Efectivo'),
        tipo_entrega: tipoEntrega,
        codigo_qr: metodoPago === 'Tarjeta' ? 'Tarjeta-POS' : (metodoPago === 'QR' ? 'QR-POS' : undefined),
        detalles: cart.map(i => ({
          id_producto: i.id,
          cantidad: i.cantidad,
          precio_unitario: Number(i.precio_venta)
        })),
        VentaEstado: ventaEstado,
        requiere_factura: requiereFactura,
        nit_cliente: nitCliente,
        nombre_cliente: nombreCliente,
        email_cliente: emailCliente
      });

      try {
        const ticketData = await ventaService.getTicket(res.venta.id);
        if (ticketData && ticketData.ticket_text) {
          setTicketText(ticketData.ticket_text);
          setShowTicketModal(true);
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
      }

      setCart([]);
      setShowCheckout(false);
      resetPagos();
    } catch (e) {
      alert('Error al procesar venta');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPagos = () => {
      setMontoRecibido('');
      setQrConfirmado(false);
      setQrStep(0);
      setTarjetaConfirmada(false);
      setTarjetaNombre('');
      setTarjetaNumero('');
      setTarjetaExp('');
      setTarjetaCVV('');
      setVentaEstado('');
      setRequiereFactura(false);
      setNitCliente('');
      setNombreCliente('');
      setEmailCliente('');
      setCardError(null);
  };

  if (loading && cajaAbierta === null) {
      return (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader className="animate-spin text-orange-500" size={48} />
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

  const getProductImage = (prod: Producto) => {
    return localStorage.getItem(`img_prod_${prod.id}`) || prod.imagen_url;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, prodId: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round(height * (MAX_SIZE / width));
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round(width * (MAX_SIZE / height));
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/webp', 0.8);
          try {
            localStorage.setItem(`img_prod_${prodId}`, compressedBase64);
            setProductos([...productos]); 
          } catch (error) {
            alert("Memoria insuficiente para subir más imágenes localmente.");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProds = productos.filter(p => {
    const matchesCat = selectedCat === 'all' || p.id_categoria === selectedCat;
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
      
      {/* ── Main Area (Products) ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-1/2 lg:h-auto">
        <div className="space-y-4 mb-4 lg:mb-6 shrink-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="¿Qué busca el cliente?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 lg:py-4 bg-white border-2 border-gray-100 rounded-2xl lg:rounded-3xl shadow-sm focus:border-orange-500 outline-none transition-all font-medium text-sm lg:text-base"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedCat('all')} className={`shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${selectedCat === 'all' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>Todos</button>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`shrink-0 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}>{cat.nombre}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
            {filteredProds.map((prod: any) => {
              const currentImg = getProductImage(prod);
              return (
                <motion.div key={prod.id} whileTap={{ scale: 0.96 }} onClick={() => addToCart(prod)} className="bg-white p-3 lg:p-4 rounded-2xl lg:rounded-[32px] border-2 border-transparent hover:border-orange-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full">
                  <div className="aspect-square bg-gray-50 rounded-xl lg:rounded-2xl mb-3 lg:mb-4 overflow-hidden relative group/img">
                    {currentImg ? <img src={currentImg} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Utensils size={32} className="lg:w-10 lg:h-10"/></div>}
                    
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="cursor-pointer bg-white text-gray-900 p-2 lg:p-3 rounded-lg lg:rounded-xl shadow-xl flex items-center gap-1 lg:gap-2 hover:bg-orange-50 transition-colors">
                        <Camera size={16} className="text-orange-500 lg:w-[18px] lg:h-[18px]" />
                        <span className="text-[10px] lg:text-xs font-black uppercase">Subir Foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, prod.id)} />
                      </label>
                    </div>

                  </div>
                  <h3 className="font-black text-gray-900 text-[11px] lg:text-sm leading-tight mb-2 uppercase flex-1">{prod.nombre}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-orange-600 font-black text-sm lg:text-lg">Bs. {Number(prod.precio_venta).toFixed(2)}</span>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100"><Plus size={16} strokeWidth={3} className="lg:w-5 lg:h-5"/></div>
                  </div>
                </motion.div>
              );
            })}
            </div>
        </div>
      </div>

      {/* ── Cart Sidebar ────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[380px] h-1/2 lg:h-auto bg-white rounded-t-3xl lg:rounded-[40px] shadow-2xl border border-gray-100 flex flex-col shrink-0 overflow-hidden z-10 lg:z-auto">
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
                    {cart.map((item: any) => {
                        const currentImg = getProductImage(item);
                        return (
                        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl group">
                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 shrink-0 overflow-hidden">
                                {currentImg ? <img src={currentImg} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Utensils size={14}/></div>}
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
                    )})}
                </AnimatePresence>
            )}
        </div>

        <div className="p-6 bg-gray-900 text-white space-y-4">
            <div className="flex justify-between items-end">
                <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Orden</p><span className="text-3xl font-black italic">Bs. {total.toFixed(2)}</span></div>
            </div>
            <button disabled={cart.length === 0} onClick={() => { setShowCheckout(true); resetPagos(); }} className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-2xl shadow-xl shadow-orange-950/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">CONTINUAR AL PAGO <ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ── Checkout Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl lg:rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:min-h-[600px] md:max-h-[90vh]">
                    
                    {/* Left: Summary Panel */}
                    <div className="w-full md:w-72 bg-gray-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col shrink-0 max-h-[30vh] md:max-h-full">
                        <h3 className="text-xs md:text-sm font-black italic uppercase mb-4 md:mb-6 text-gray-400 tracking-widest flex items-center justify-between">
                          Resumen
                          <span className="md:hidden text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{cart.length} items</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {cart.map(i => (
                                <div key={i.id} className="flex justify-between text-[10px] font-bold text-gray-600">
                                    <span className="truncate pr-4">{i.cantidad}x {i.nombre}</span>
                                    <span className="shrink-0">{(i.cantidad * Number(i.precio_venta)).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 md:pt-6 border-t border-gray-200 mt-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total a cobrar</p>
                            <p className="text-2xl md:text-3xl font-black text-gray-900">Bs. {total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Right: Payment Panel */}
                    <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto relative">
                        {/* Overlay 3D Secure / Pasarela */}
                        <AnimatePresence>
                            {isProcessingModal && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center rounded-r-[40px]">
                                    {pasarelaPaso === 1 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <Wifi className="text-blue-500 w-16 h-16 animate-pulse mb-4" />
                                            <h3 className="text-xl font-black text-gray-900 uppercase">Conectando con el Banco...</h3>
                                            <p className="text-sm text-gray-500 mt-2">Estableciendo conexión segura cifrada</p>
                                        </motion.div>
                                    )}
                                    {pasarelaPaso === 2 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <Loader2 className="text-orange-500 w-16 h-16 animate-spin mb-4" />
                                            <h3 className="text-xl font-black text-gray-900 uppercase">Verificando Fondos</h3>
                                            <p className="text-sm text-gray-500 mt-2">Procesando la transacción con el emisor</p>
                                        </motion.div>
                                    )}
                                    {pasarelaPaso === 3 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <XCircle className="text-red-500 w-20 h-20 mb-4" />
                                            <h3 className="text-2xl font-black text-red-600 uppercase">Transacción Rechazada</h3>
                                            <p className="text-sm text-red-500 mt-2 font-bold">Error: FONDOS INSUFICIENTES</p>
                                        </motion.div>
                                    )}
                                    {pasarelaPaso === 4 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <AlertCircle className="text-red-500 w-20 h-20 mb-4" />
                                            <h3 className="text-2xl font-black text-red-600 uppercase">Transacción Rechazada</h3>
                                            <p className="text-sm text-red-500 mt-2 font-bold">Error: TARJETA RETENIDA O BLOQUEADA</p>
                                        </motion.div>
                                    )}
                                    {pasarelaPaso === 5 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <ShieldCheck className="text-green-500 w-20 h-20 mb-4" />
                                            <h3 className="text-2xl font-black text-green-600 uppercase">Pago Aprobado</h3>
                                            <p className="text-sm text-green-500 mt-2 font-bold">Transacción exitosa y autorizada</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 space-y-6">
                            {/* Tipo de Entrega */}
                            <div className="flex gap-4">
                                <button onClick={() => setTipoEntrega('Mesa')} className={`flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center gap-2 md:gap-3 ${tipoEntrega === 'Mesa' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}>
                                    <Utensils size={18}/>
                                    <span className="font-black text-xs md:text-sm uppercase">Para Mesa</span>
                                </button>
                                <button onClick={() => setTipoEntrega('Llevar')} className={`flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center gap-2 md:gap-3 ${tipoEntrega === 'Llevar' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 hover:border-gray-200 text-gray-400'}`}>
                                    <ShoppingBag size={18}/>
                                    <span className="font-black text-xs md:text-sm uppercase">Para Llevar</span>
                                </button>
                            </div>

                            {/* Metodo Select */}
                            <div className="flex gap-4">
                                <button onClick={() => { setMetodoPago('Efectivo'); setCardError(null); }} className={`flex-1 p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center gap-2 md:gap-3 ${metodoPago === 'Efectivo' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${metodoPago === 'Efectivo' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400'}`}><DollarSign size={18}/></div>
                                    <div className="text-left"><p className="text-[7px] md:text-[8px] font-black uppercase text-gray-400">Pago con</p><p className="font-black text-xs md:text-sm uppercase">Efectivo</p></div>
                                </button>
                                <button onClick={() => { setMetodoPago('QR'); setCardError(null); }} className={`flex-1 p-2 md:p-3 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center gap-2 md:gap-3 ${metodoPago === 'QR' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${metodoPago === 'QR' ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}><QrCode size={18}/></div>
                                    <div className="text-left"><p className="text-[7px] md:text-[8px] font-black uppercase text-gray-400">Pago con</p><p className="font-black text-xs md:text-sm uppercase">QR Simple</p></div>
                                </button>
                                <button onClick={() => { setMetodoPago('Tarjeta'); }} className={`flex-1 p-2 md:p-3 rounded-2xl md:rounded-3xl border-2 transition-all flex items-center gap-2 md:gap-3 ${metodoPago === 'Tarjeta' ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${metodoPago === 'Tarjeta' ? 'bg-purple-500 text-white shadow-lg shadow-purple-100' : 'bg-gray-100 text-gray-400'}`}><CreditCard size={18}/></div>
                                    <div className="text-left"><p className="text-[7px] md:text-[8px] font-black uppercase text-gray-400">Pago con</p><p className="font-black text-xs md:text-sm uppercase">Tarjeta</p></div>
                                </button>
                            </div>

                            {/* Logic Area */}
                            <AnimatePresence mode="wait">
                                {metodoPago === 'Efectivo' ? (
                                    <motion.div key="cash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><PlusSquare size={12}/> Recibido</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-sm md:text-lg font-black text-gray-300">Bs.</span>
                                                    <input autoFocus type="number" value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)} className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-4 md:py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl md:rounded-3xl text-2xl md:text-3xl font-black outline-none focus:border-orange-500 transition-all" placeholder="0.00" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2"><Wallet size={12}/> Vuelto</label>
                                                <div className={`w-full py-4 md:py-5 px-5 md:px-6 rounded-2xl md:rounded-3xl border-2 flex flex-col justify-center ${cambio > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                                                    <p className={`text-2xl md:text-3xl font-black ${cambio > 0 ? 'text-green-600' : 'text-gray-300'}`}>Bs. {cambio.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {!puedePagarEfectivo && montoRecibido !== '' && (
                                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle size={14} /> El monto es insuficiente.</div>
                                        )}
                                    </motion.div>
                                ) : metodoPago === 'QR' ? (
                                    <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-blue-50/50 p-6 rounded-2xl md:rounded-[32px] border-2 border-blue-100 flex flex-col items-center text-center space-y-4">
                                        
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            {/* Radar animado si está esperando */}
                                            {qrStep === 1 && (
                                                <>
                                                    <div className="absolute w-full h-full border-4 border-blue-400 rounded-2xl animate-ping opacity-20"></div>
                                                    <div className="absolute w-[120%] h-[120%] border-2 border-blue-300 rounded-2xl animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
                                                </>
                                            )}
                                            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-md p-2 z-10">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SaborXpress-Monto-${total}-Fecha-${new Date().getTime()}`} 
                                                    alt="QR Dinámico" 
                                                    className={`w-full h-full object-contain transition-all duration-500 ${qrStep === 2 ? 'opacity-30' : 'opacity-100'}`} 
                                                />
                                                {qrStep === 2 && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                                        <CheckCircle className="text-green-500 w-16 h-16" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1 h-12">
                                            {qrStep === 0 && <h4 className="text-base md:text-lg font-black text-blue-900 italic uppercase">Esperando generar QR</h4>}
                                            {qrStep === 1 && (
                                                <div className="flex flex-col items-center text-blue-600">
                                                    <span className="text-xs font-bold animate-pulse">Consultando estado con el Banco...</span>
                                                    <span className="text-[10px]">El cliente debe escanear para pagar Bs. {total.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {qrStep === 2 && <h4 className="text-base md:text-lg font-black text-green-600 italic uppercase">¡PAGO RECIBIDO EXITOSAMENTE!</h4>}
                                        </div>

                                        <button 
                                            disabled={qrStep === 1 || qrConfirmado}
                                            onClick={iniciarPagoQR} 
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all ${qrConfirmado ? 'bg-green-500 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'}`}
                                        >
                                            {qrStep === 1 ? <><Loader2 size={14} className="animate-spin" /> ESPERANDO PAGO...</> : qrStep === 2 ? <><CheckCircle size={14}/> LISTO</> : <><QrCode size={14}/> GENERAR Y ESPERAR PAGO</>}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="tarjeta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col space-y-6">
                                        
                                        {/* CSS 3D Card Visualizer */}
                                        <div 
                                            className="relative w-full max-w-[320px] mx-auto h-[180px] cursor-pointer"
                                            style={{ perspective: '1000px' }}
                                            onClick={() => setIsFlipped(!isFlipped)}
                                        >
                                            <motion.div 
                                                className="w-full h-full absolute"
                                                initial={false}
                                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                                style={{ transformStyle: 'preserve-3d' }}
                                            >
                                                {/* Card Front */}
                                                <div className="absolute w-full h-full rounded-2xl p-5 flex flex-col justify-between shadow-2xl text-white bg-gradient-to-br from-gray-900 to-gray-800" style={{ backfaceVisibility: 'hidden' }}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-10 h-8 bg-yellow-200/80 rounded-md"></div>
                                                        <div className="font-black italic text-lg opacity-80">{getCardBrand()}</div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-xl tracking-[0.2em] font-mono shadow-sm">
                                                            {tarjetaNumero || '•••• •••• •••• ••••'}
                                                        </div>
                                                        <div className="flex justify-between items-end text-[10px] uppercase tracking-wider">
                                                            <div>
                                                                <span className="opacity-50 block text-[8px]">Titular</span>
                                                                <span className="font-bold">{tarjetaNombre || 'NOMBRE DEL CLIENTE'}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="opacity-50 block text-[8px]">Expira</span>
                                                                <span className="font-bold">{tarjetaExp || 'MM/YY'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Back */}
                                                <div className="absolute w-full h-full rounded-2xl flex flex-col shadow-2xl text-white bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                                    <div className="w-full h-10 bg-black mt-6 opacity-80"></div>
                                                    <div className="px-5 mt-4">
                                                        <div className="w-full h-8 bg-white flex items-center justify-end px-3 text-black font-mono text-sm rounded">
                                                            {tarjetaCVV || '•••'}
                                                        </div>
                                                        <p className="text-[8px] opacity-50 mt-2 text-right">Código de seguridad (CVV)</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Card Inputs */}
                                        <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            {cardError && (
                                                <div className="bg-red-50 text-red-600 text-[10px] font-bold p-2 rounded-lg flex items-center gap-2 border border-red-100">
                                                    <AlertCircle size={14}/> {cardError}
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase">Titular de la Tarjeta</label>
                                                <input type="text" onFocus={() => setIsFlipped(false)} value={tarjetaNombre} onChange={e => setTarjetaNombre(e.target.value)} placeholder="Ej: Juan Perez" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500 transition-all uppercase" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase">Número de Tarjeta (Prueba: 4532 7890 1234 5671)</label>
                                                <input type="text" onFocus={() => setIsFlipped(false)} value={tarjetaNumero} onChange={e => {setTarjetaNumero(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')); setCardError(null);}} maxLength={19} placeholder="4532 0000 0000 0000" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500 transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Expira</label>
                                                    <input type="text" onFocus={() => setIsFlipped(false)} value={tarjetaExp} onChange={e => setTarjetaExp(e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/'))} maxLength={5} placeholder="MM/YY" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500 transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">CVV</label>
                                                    <input type="password" onFocus={() => setIsFlipped(true)} value={tarjetaCVV} onChange={e => setTarjetaCVV(e.target.value.replace(/\D/g, ''))} maxLength={4} placeholder="•••" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-purple-500 transition-all" />
                                                </div>
                                            </div>
                                        </div>

                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Campo de Observaciones */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-2">
                                    <ShoppingBag size={12}/> Observaciones / Comentario
                                </label>
                                <textarea 
                                    placeholder="Ej: Contado, pago directo..."
                                    value={ventaEstado}
                                    onChange={e => setVentaEstado(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xs font-medium outline-none focus:border-orange-500 transition-all resize-none h-16 md:h-20"
                                />
                            </div>

                            {/* Facturación Toggle */}
                            <div className="pt-4 border-t border-gray-100 space-y-4 pb-4 md:pb-0">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-gray-900 uppercase">¿Emitir Factura?</label>
                                    <button 
                                        onClick={() => setRequiereFactura(!requiereFactura)} 
                                        className={`relative w-14 h-8 rounded-full transition-colors ${requiereFactura ? 'bg-orange-500' : 'bg-gray-200'}`}
                                    >
                                        <motion.div 
                                            layout 
                                            className="w-6 h-6 bg-white rounded-full mx-1 shadow-sm"
                                            animate={{ x: requiereFactura ? 24 : 0 }}
                                        />
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {requiereFactura && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 overflow-hidden"
                                        >
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">NIT / CI del Cliente</label>
                                                <input 
                                                    type="text" 
                                                    value={nitCliente} 
                                                    onChange={e => setNitCliente(e.target.value)} 
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 transition-all" 
                                                    placeholder="Ej: 12345678" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nombre / Razón Social</label>
                                                <input 
                                                    type="text" 
                                                    value={nombreCliente} 
                                                    onChange={e => setNombreCliente(e.target.value)} 
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 transition-all uppercase" 
                                                    placeholder="Ej: JUAN PEREZ" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Correo Electrónico (Opcional)</label>
                                                <input 
                                                    type="email" 
                                                    value={emailCliente} 
                                                    onChange={e => setEmailCliente(e.target.value)} 
                                                    className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 transition-all" 
                                                    placeholder="Ej: cliente@gmail.com" 
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Actions - Fixed at the bottom of the panel */}
                        <div className="flex gap-3 pt-6 mt-auto bg-white sticky bottom-0 z-40 border-t border-gray-100">
                            <button onClick={() => setShowCheckout(false)} className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
                            
                            {metodoPago === 'Tarjeta' ? (
                                <button 
                                    disabled={submitting || isProcessingModal || (!tarjetaConfirmada && (!tarjetaNombre || tarjetaNumero.length < 15 || tarjetaExp.length < 5 || tarjetaCVV.length < 3))} 
                                    onClick={tarjetaConfirmada ? handleFinalizarVenta : handleProcesarTarjeta} 
                                    className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 uppercase italic ${
                                        tarjetaConfirmada ? 'bg-green-500 text-white shadow-green-100' : 'bg-purple-500 text-white shadow-purple-100'
                                    } disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none`}
                                >
                                    {tarjetaConfirmada ? <><CheckCircle size={18}/> FINALIZAR VENTA</> : <><CreditCard size={18} /> PROCESAR PAGO SEGURO</>}
                                </button>
                            ) : (
                                <button 
                                    disabled={submitting || (metodoPago === 'Efectivo' && !puedePagarEfectivo) || (metodoPago === 'QR' && !qrConfirmado)} 
                                    onClick={handleFinalizarVenta} 
                                    className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 uppercase italic ${
                                        metodoPago === 'Efectivo' ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-blue-600 text-white shadow-blue-100'
                                    } disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none`}
                                >
                                    {submitting ? <Loader className="animate-spin size-4" /> : (metodoPago === 'Efectivo' ? <DollarSign size={18}/> : <CheckCircle size={18}/>)}
                                    FINALIZAR VENTA
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <TicketModal 
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticketText={ticketText}
      />
    </div>
  );
};

export default POSPage;
