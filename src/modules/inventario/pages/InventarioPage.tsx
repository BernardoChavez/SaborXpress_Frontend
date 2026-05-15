// ── ARCHIVO: InventarioPage.tsx ──────────────────────────────────────────────
// PROPÓSITO: Gestión de Stock y Transformación de Insumos.
// INCLUYE: Filtro dinámico de estados de stock.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Layers, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  ChevronRight,
  Utensils,
  Settings,
  ArrowRight,
  Filter,
  Ban
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { InventarioItem, FichaTransformacion, Receta } from '../types/inventario.types';
import TransformacionModal from '../components/TransformacionModal';
import ItemInventarioModal from '../components/ItemInventarioModal';
import RecetasModal from '../components/RecetasModal';

type Tab = 'bruto' | 'procesado' | 'recetas';
type StockFilter = 'todos' | 'disponible' | 'bajo' | 'agotado';

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'bruto',     label: 'Materia Prima', icon: <Package size={18} />,     color: 'blue' },
  { id: 'procesado', label: 'Procesados',     icon: <Layers size={18} />,      color: 'green' },
  { id: 'recetas',   label: 'Recetas',       icon: <Utensils size={18} />, color: 'orange' },
];

const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('bruto');
  const [itemsBruto, setItemsBruto] = useState<InventarioItem[]>([]);
  const [itemsProcesado, setItemsProcesado] = useState<InventarioItem[]>([]);
  const [fichas, setFichas] = useState<FichaTransformacion[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos');
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRecetasModal, setShowRecetasModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventarioItem | null>(null);
  const [modalType, setModalType] = useState<'bruto' | 'procesado'>('bruto');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bruto, procesado, f, r] = await Promise.all([
        inventarioService.getAllBruto(),
        inventarioService.getAllProcesado(),
        inventarioService.getAllFichas(),
        inventarioService.getAllRecetas()
      ]);
      setItemsBruto(bruto);
      setItemsProcesado(procesado);
      setFichas(f);
      setRecetas(r);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * LÓGICA DE FILTRADO DE STOCK:
   * Separa los productos en categorías visuales según su disponibilidad real.
   */
  const filterItems = (items: InventarioItem[]) => {
    if (stockFilter === 'todos') return items;
    return items.filter(item => {
      const stock = Number(item.stock);
      const min = Number(item.stock_minimo);
      
      // Disponible: Por encima del stock de seguridad
      if (stockFilter === 'disponible') return stock > min;
      // Bajo Stock: En riesgo de agotarse (alerta naranja)
      if (stockFilter === 'bajo') return stock <= min && stock > 0;
      // Agotado: Existencia cero (alerta roja)
      if (stockFilter === 'agotado') return stock <= 0;
      return true;
    });
  };

  const recetasAgrupadas = (recetas as any[]).reduce((acc: any, r: any) => {
    const prodName = r.producto?.nombre || 'Producto sin nombre';
    if (!acc[prodName]) acc[prodName] = [];
    acc[prodName].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Control de Inventarios</h1>
            <p className="text-sm text-gray-500">Gestiona materia prima, insumos procesados y recetas</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowTransformModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
                <RefreshCw size={16} />
                Transformar Insumos
            </button>
            <button 
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Actualizar
            </button>
        </div>
      </div>

      {/* Toolbar: Tabs + Stock Filter */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-2 rounded-[24px] shadow-sm border border-gray-100">
        {/* Tabs Switcher */}
        <div className="flex gap-1 w-full xl:w-auto p-1 bg-gray-50 rounded-2xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stock Status Filter (Solo visible en bruto y procesado) */}
        {activeTab !== 'recetas' && (
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl w-full xl:w-auto">
              <FilterSelect 
                value={stockFilter} 
                onChange={(val) => setStockFilter(val as StockFilter)} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'bruto' && (
            <InventoryGrid 
              items={filterItems(itemsBruto)} 
              title="Materia Prima (En Bruto)" 
              description="Productos tal como se compran al proveedor"
              color="blue"
              onAdd={() => { setItemToEdit(null); setModalType('bruto'); setShowItemModal(true); }}
              onEdit={(item) => { setItemToEdit(item); setModalType('bruto'); setShowItemModal(true); }}
            />
          )}
          {activeTab === 'procesado' && (
            <InventoryGrid 
              items={filterItems(itemsProcesado)} 
              title="Insumos Procesados" 
              description="Productos listos para cocinar"
              color="green"
              onAdd={() => { setItemToEdit(null); setModalType('procesado'); setShowItemModal(true); }}
              onEdit={(item) => { setItemToEdit(item); setModalType('procesado'); setShowItemModal(true); }}
            />
          )}
          {activeTab === 'recetas' && (
             <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Relaciones y Recetas</h2>
                        <p className="text-sm text-gray-500">Configuración inteligente de consumo y transformación</p>
                    </div>
                    <button 
                        onClick={() => setShowRecetasModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-orange-100 hover:bg-orange-600 uppercase tracking-widest"
                    >
                        <Settings size={18} />
                        Gestionar Recetas
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Fichas de Transformación */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><RefreshCw size={16}/></div>
                             <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Fichas de Transformación</h3>
                        </div>
                        <div className="space-y-3">
                            {fichas.length === 0 ? (
                                <div className="p-10 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 text-sm italic">No hay fichas</div>
                            ) : (fichas as any[]).map((f: any) => (
                                <div key={f.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[11px] font-black text-gray-900 uppercase">{f.bruto?.nombre}</div>
                                        <ArrowRight size={12} className="text-blue-400" />
                                        <div className="text-[11px] font-black text-blue-600 uppercase">{f.procesado?.nombre}</div>
                                    </div>
                                    <div className="px-2 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-400 border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                                        1u = {f.cantidad_procesado}{f.procesado?.unidad_medida}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recetas Agrupadas */}
                    <div className="xl:col-span-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"><Utensils size={16}/></div>
                             <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Recetas del Menú</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(recetasAgrupadas).length === 0 ? (
                                <div className="col-span-full p-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center text-gray-400 text-sm italic">No hay recetas configuradas</div>
                            ) : Object.entries(recetasAgrupadas).map(([producto, insumos]: [any, any]) => (
                                <motion.div 
                                    key={producto}
                                    whileHover={{ y: -4 }}
                                    className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-orange-100 transition-all"
                                >
                                    <div className="p-5 bg-orange-50/50 border-b border-orange-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-500"><Utensils size={20}/></div>
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-xs tracking-tighter">{producto}</h4>
                                            <p className="text-[9px] font-bold text-orange-600/60 uppercase">Consume {insumos.length} insumos</p>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3 flex-1 bg-white">
                                        {(insumos as any[]).map((r: any) => (
                                            <div key={r.id} className="flex items-center justify-between group/item">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-40 group-hover/item:opacity-100 transition-opacity" />
                                                    <span className="text-[10px] font-bold text-gray-600 group-hover/item:text-gray-900 transition-colors uppercase">{r.procesado?.nombre}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                                    -{Number(r.cantidad).toFixed(2)} {r.procesado?.unidad_medida}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      <TransformacionModal 
        open={showTransformModal} 
        onClose={() => setShowTransformModal(false)}
        bruto={itemsBruto}
        procesado={itemsProcesado}
        onSuccess={fetchData}
      />

      <ItemInventarioModal 
        open={showItemModal}
        tipo={modalType}
        itemToEdit={itemToEdit}
        onClose={() => { setShowItemModal(false); setItemToEdit(null); }}
        onSuccess={fetchData}
      />

      <RecetasModal 
        open={showRecetasModal}
        bruto={itemsBruto}
        procesado={itemsProcesado}
        onClose={() => setShowRecetasModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

// --- Sub-componentes Especializados ---

const FilterSelect = ({ value, onChange }: { value: StockFilter, onChange: (v: string) => void }) => {
  const options = [
    { id: 'todos',      label: 'Todos',      icon: <Layers size={14}/>,   color: 'gray' },
    { id: 'disponible', label: 'Disponible',  icon: <CheckCircle size={14}/>, color: 'green' },
    { id: 'bajo',       label: 'Bajo Stock', icon: <AlertTriangle size={14}/>, color: 'orange' },
    { id: 'agotado',    label: 'Agotado',    icon: <Ban size={14}/>,           color: 'red' },
  ];

  return (
    <div className="flex gap-1">
      {options.map(opt => {
        const isActive = value === opt.id;
        const colorVariants: Record<string, string> = {
          gray: isActive ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700',
          green: isActive ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'text-gray-500 hover:text-green-600 hover:bg-green-50',
          orange: isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50',
          red: isActive ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-gray-500 hover:text-red-600 hover:bg-red-50',
        };

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${colorVariants[opt.color]}`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

const InventoryGrid = ({ items, title, description, color, onAdd, onEdit }: { items: InventarioItem[], title: string, description: string, color: string, onAdd: () => void, onEdit: (item: InventarioItem) => void }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-2">
        <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description} • {items.length} resultados</p>
        </div>
        <button 
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2 ${color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-gray-100 active:scale-95`}
        >
            <Plus size={16} />
            Nuevo Registro
        </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-gray-200 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <Filter size={32} />
            </div>
            <p className="text-gray-400 text-sm font-medium">No se encontraron productos con este filtro</p>
        </div>
      ) : (
        items.map((item: any) => {
          const isCritical = Number(item.stock) <= Number(item.stock_minimo);
          const isAgotado = Number(item.stock) <= 0;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase text-sm">{item.nombre}</h3>
                  <p className="text-[10px] text-gray-400 font-black tracking-widest">CATEGORÍA: {item.categoria?.nombre || 'General'}</p>
                </div>
                <div className={`p-2 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                  <Package size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Existencia</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isAgotado ? 'text-red-600' : isCritical ? 'text-orange-500' : 'text-gray-900'}`}>
                      {Number(item.stock).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.unidad_medida}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider">Stock Mínimo</p>
                  <p className="text-sm font-black text-gray-700">{Number(item.stock_minimo).toLocaleString()} <span className="text-[9px] opacity-50">{item.unidad_medida}</span></p>
                </div>
              </div>

              <div className="mt-4 pt-4 flex items-center justify-between">
                {isAgotado ? (
                  <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                    <Ban size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Agotado Total</span>
                  </div>
                ) : isCritical ? (
                  <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Bajo Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                    <CheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Disponible</span>
                  </div>
                )}
                <button 
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  Modificar
                </button>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  </div>
);

export default InventarioPage;
