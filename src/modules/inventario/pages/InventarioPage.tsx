import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Layers, 
  ArrowRightLeft, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Utensils,
  Settings
} from 'lucide-react';
import { inventarioService } from '../inventarioService';
import type { InventarioItem, FichaTransformacion, Receta } from '../types/inventario.types';
import TransformacionModal from '../components/TransformacionModal';
import ItemInventarioModal from '../components/ItemInventarioModal';
import RecetasModal from '../components/RecetasModal';

type Tab = 'bruto' | 'procesado' | 'recetas';

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

  return (
    <div className="space-y-6">
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
                <ArrowRightLeft size={16} />
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

      {/* Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
        {TABS.map((tab) => {
          const colorClasses: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 shadow-sm',
            green: 'bg-green-50 text-green-600 shadow-sm',
            orange: 'bg-orange-50 text-orange-600 shadow-sm',
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? colorClasses[tab.color]
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
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
              items={itemsBruto} 
              title="Materia Prima (En Bruto)" 
              description="Productos tal como se compran al proveedor"
              color="blue"
              onAdd={() => { setItemToEdit(null); setModalType('bruto'); setShowItemModal(true); }}
              onEdit={(item) => { setItemToEdit(item); setModalType('bruto'); setShowItemModal(true); }}
            />
          )}
          {activeTab === 'procesado' && (
            <InventoryGrid 
              items={itemsProcesado} 
              title="Insumos Procesados" 
              description="Productos listos para cocinar"
              color="green"
              onAdd={() => { setItemToEdit(null); setModalType('procesado'); setShowItemModal(true); }}
              onEdit={(item) => { setItemToEdit(item); setModalType('procesado'); setShowItemModal(true); }}
            />
          )}
          {activeTab === 'recetas' && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Relaciones y Recetas</h2>
                        <p className="text-xs text-gray-500">Configuración inteligente de consumo y transformación</p>
                    </div>
                    <button 
                        onClick={() => setShowRecetasModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-100"
                    >
                        <Settings size={16} />
                        Gestionar Recetas
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Lista de Fichas */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <ArrowRightLeft size={18} className="text-blue-500" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Fichas de Transformación</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {fichas.length === 0 ? (
                                <p className="text-center py-8 text-gray-400 italic text-sm">No hay fichas configuradas</p>
                            ) : fichas.map(f => (
                                <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-gray-700">{f.bruto?.nombre}</div>
                                        <ArrowRightLeft size={12} className="text-gray-300" />
                                        <div className="text-xs font-bold text-blue-600">{f.procesado?.nombre}</div>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                        1u = {f.cantidad_procesado} {f.procesado?.unidad_medida}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lista de Recetas */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                            <Utensils size={18} className="text-orange-500" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Recetas del Menú</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {recetas.length === 0 ? (
                                <p className="text-center py-8 text-gray-400 italic text-sm">No hay recetas configuradas</p>
                            ) : recetas.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-gray-700">{r.producto?.nombre}</div>
                                        <ChevronRight size={12} className="text-gray-300" />
                                        <div className="text-xs font-bold text-orange-600">{r.procesado?.nombre}</div>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                        -{r.cantidad} {r.procesado?.unidad_medida}
                                    </div>
                                </div>
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

// --- Helper Components ---

const InventoryGrid = ({ items, title, description, color, onAdd, onEdit }: { items: InventarioItem[], title: string, description: string, color: string, onAdd: () => void, onEdit: (item: InventarioItem) => void }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
        <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <button 
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2 ${color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-gray-100`}
        >
            <Plus size={16} />
            Añadir Item
        </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 text-sm italic">No hay registros en esta categoría</p>
        </div>
      ) : (
        items.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.nombre}</h3>
                <p className="text-xs text-gray-400 font-mono">ID: #{item.id}</p>
              </div>
              <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                <ChevronRight size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stock Actual</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-black ${Number(item.stock) <= Number(item.stock_minimo) ? 'text-red-500' : 'text-gray-900'}`}>
                    {Number(item.stock).toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{item.unidad_medida}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mínimo</p>
                <p className="text-sm font-semibold text-gray-700">{Number(item.stock_minimo).toLocaleString()} {item.unidad_medida}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              {Number(item.stock) <= Number(item.stock_minimo) ? (
                <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                  <AlertTriangle size={12} />
                  <span className="text-[10px] font-bold uppercase">Stock Crítico</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} />
                  <span className="text-[10px] font-bold uppercase">Estado Óptimo</span>
                </div>
              )}
              <button 
                onClick={() => onEdit(item)}
                className="text-[10px] font-bold text-blue-500 hover:underline uppercase"
              >
                Editar
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </div>
);

export default InventarioPage;
