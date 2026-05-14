import React, { useEffect, useState } from 'react';
import { 
    RefreshCw, 
    ChevronDown, 
    ChevronUp, 
    User, 
    Globe, 
    Clock, 
    Activity,
    Search,
    Shield,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bitacoraService } from '../bitacoraService';
import type { BitacoraEntry } from '../types/bitacora.types';

const methodColors: Record<string, string> = {
  POST:   'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  PUT:    'bg-blue-500/10 text-blue-600 border-blue-500/20',
  PATCH:  'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  DELETE: 'bg-red-500/10 text-red-600 border-red-500/20',
  GET:    'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const BitacoraPage = () => {
  const [entries, setEntries] = useState<BitacoraEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await bitacoraService.getAll();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredEntries = entries.filter(e => 
    e.usuario?.persona?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.accion_detalle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Ejecutivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl"><Shield size={24}/></div>
             <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Bitácora de <span className="text-slate-500">Auditoría</span></h1>
          </div>
          <p className="text-gray-500 text-sm font-medium ml-1">Control técnico y forense de todas las operaciones del sistema.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input 
                    type="text" 
                    placeholder="Buscar por usuario o acción..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:border-blue-500 outline-none shadow-sm transition-all"
                />
            </div>
            <button onClick={fetchData} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
            </button>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                <th className="px-8 py-5">Responsable</th>
                <th className="px-6 py-5 text-center">Tipo</th>
                <th className="px-6 py-5">Descripción de la Acción</th>
                <th className="px-6 py-5">Fecha / Hora</th>
                <th className="px-8 py-5 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-black uppercase italic animate-pulse">Analizando registros de seguridad...</td></tr>
              ) : filteredEntries.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">No se encontraron registros en el historial.</td></tr>
              ) : filteredEntries.map(entry => {
                const isExpanded = expandedId === entry.id;
                const method = (entry.accion || '').split(' ')[0].toUpperCase();
                
                return (
                  <React.Fragment key={entry.id}>
                    <tr className={`group transition-all ${isExpanded ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-white transition-colors"><User size={18}/></div>
                            <div>
                                <p className="text-sm font-black text-gray-800 uppercase leading-none mb-1">{entry.usuario?.persona?.nombre || 'SISTEMA'}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{entry.usuario?.correo || 'Sin correo'}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${methodColors[method] || methodColors.GET}`}>
                            {method}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-600 line-clamp-1">{entry.accion_detalle}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-gray-800 tracking-tighter">{entry.fecha}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{entry.hora_inicio}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </button>
                      </td>
                    </tr>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-8 py-0">
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-100">
                                    <div className="space-y-4">
                                        <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Origen de Conexión</h6>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Dirección IP</p>
                                            <p className="text-xl font-black text-gray-800 font-mono">{entry.ip || '0.0.0.0'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Tiempos de Ejecución</h6>
                                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Inicio</p>
                                                <p className="text-sm font-black text-gray-800">{entry.hora_inicio}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Fin / Cierre</p>
                                                <p className={`text-sm font-black ${entry.hora_cierre ? 'text-gray-800' : 'text-emerald-500'}`}>
                                                    {entry.hora_cierre || 'ACTIVO'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12}/> Metadatos Técnicos</h6>
                                        <div className="bg-slate-900 p-4 rounded-2xl text-[10px] font-mono text-blue-300 leading-relaxed overflow-x-auto border border-white/10 shadow-inner">
                                            <span className="text-slate-500 italic block mb-2">// Resource: {entry.accion}</span>
                                            {entry.accion_detalle}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <ShieldCheck size={32}/>
        </div>
        <div className="flex-1 text-center md:text-left">
            <h5 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Registro de Auditoría Central</h5>
            <p className="text-xs text-blue-700/70 font-medium">Este registro es inmutable y cumple con los estándares de control de integridad. Cualquier intento de modificación de la base de datos es rastreado por IP y usuario responsable.</p>
        </div>
      </div>
    </div>
  );
};

export default BitacoraPage;
