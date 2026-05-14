import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  ChevronDown, 
  FolderOpen, 
  Folder, 
  CheckSquare, 
  ShieldCheck, 
  Users, 
  Lock, 
  Layers, 
  Zap,
  Eye,
  PlusCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rolesService } from '../rolesService';
import type { Rol, Paquete, PermisoRol, CasoUso } from '../types/roles.types';

const MODULE_COLORS: Record<string, string> = {
  'Seguridad': 'blue',
  'Usuarios': 'purple',
  'Inventarios': 'green',
  'Ventas': 'orange',
  'Configuración': 'slate'
};

const RolesPage = () => {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [expandedPaquete, setExpandedPaquete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paqs, rols] = await Promise.all([
        rolesService.getEstructura(),
        rolesService.getRoles()
      ]);
      setPaquetes(paqs);
      setRoles(rols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const togglePaquete = (id: number) => {
    setExpandedPaquete(prev => (prev === id ? null : id));
  };

  const getPermiso = (rol: Rol, idCasoUso: number) => {
    return rol.permisos.find(p => p.id_caso_uso === idCasoUso) || { puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
  };

  const getAccionesForCU = (cu: CasoUso) => {
    return cu.es_crud 
      ? ['puede_ver', 'puede_crear', 'puede_editar', 'puede_eliminar']
      : ['puede_ver'];
  };

  const handleToggleAction = (rolId: number, idCasoUso: number, accion: string) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    let currentPermisos = [...rol.permisos];
    const pIndex = currentPermisos.findIndex(p => p.id_caso_uso === idCasoUso);
    
    if (pIndex >= 0) {
      currentPermisos[pIndex] = { ...currentPermisos[pIndex], [accion]: !(currentPermisos[pIndex] as any)[accion] };
    } else {
      const newPermiso: any = { id_caso_uso: idCasoUso, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
      newPermiso[accion] = true;
      currentPermisos.push(newPermiso as PermisoRol);
    }

    savePermisos(rolId, currentPermisos);
  };

  const handleToggleCU = (rolId: number, cu: CasoUso) => {
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    const acciones = getAccionesForCU(cu);
    const p = getPermiso(rol, cu.id);
    const isAllChecked = acciones.every(a => (p as any)[a]);
    const newValue = !isAllChecked;

    let currentPermisos = [...rol.permisos];
    const pIndex = currentPermisos.findIndex(per => per.id_caso_uso === cu.id);
    
    if (pIndex >= 0) {
      const updated = { ...currentPermisos[pIndex] };
      acciones.forEach(a => (updated as any)[a] = newValue);
      currentPermisos[pIndex] = updated;
    } else {
      const newPermiso: any = { id_caso_uso: cu.id, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
      acciones.forEach(a => newPermiso[a] = newValue);
      currentPermisos.push(newPermiso as PermisoRol);
    }

    savePermisos(rolId, currentPermisos);
  };

  const handleTogglePackage = (rolId: number, paq: Paquete, e: React.MouseEvent) => {
    e.stopPropagation();
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    let isAllChecked = true;
    const items = paq.casos_uso || [];
    for (const cu of items) {
      const p = getPermiso(rol, cu.id);
      const acciones = getAccionesForCU(cu);
      if (!acciones.every(a => (p as any)[a])) {
        isAllChecked = false;
        break;
      }
    }
    const newValue = !isAllChecked;

    let currentPermisos = [...rol.permisos];
    for (const cu of items) {
      const acciones = getAccionesForCU(cu);
      const pIndex = currentPermisos.findIndex(per => per.id_caso_uso === cu.id);
      
      if (pIndex >= 0) {
        const updated = { ...currentPermisos[pIndex] };
        acciones.forEach(a => (updated as any)[a] = newValue);
        currentPermisos[pIndex] = updated;
      } else {
        const newPermiso: any = { id_caso_uso: cu.id, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false };
        acciones.forEach(a => newPermiso[a] = newValue);
        currentPermisos.push(newPermiso as PermisoRol);
      }
    }

    savePermisos(rolId, currentPermisos);
  };

  const savePermisos = async (rolId: number, currentPermisos: PermisoRol[]) => {
    setRoles(prev => prev.map(r => r.id === rolId ? { ...r, permisos: currentPermisos } : r));
    try {
      await rolesService.updateRol(rolId, {
        permisos: currentPermisos.map(p => ({
          id_caso_uso: p.id_caso_uso,
          puede_ver: p.puede_ver,
          puede_crear: p.puede_crear,
          puede_editar: p.puede_editar,
          puede_eliminar: p.puede_eliminar
        }))
      });
    } catch (e) {
      alert('Error guardando permiso');
      fetchData();
    }
  };

  if (loading) return <div className="h-[70vh] flex items-center justify-center animate-pulse text-blue-500 font-black italic uppercase">Cargando Matriz de Seguridad...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Header Premium */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Lock size={20}/></div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Matriz de <span className="text-blue-600">Permisos</span></h1>
            </div>
            <p className="text-gray-500 font-medium ml-1">Administración centralizada de accesos y casos de uso del sistema.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-100 shadow-inner">
            {roles.map(r => (
                <div key={r.id} className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${r.nombre === 'Admin' ? 'bg-blue-600' : (r.nombre === 'Cajero' ? 'bg-orange-500' : 'bg-green-500')}`} />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">ROL</p>
                        <p className="text-xs font-black text-gray-800 uppercase">{r.nombre}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Matriz Agrupada por Paquetes */}
      <div className="space-y-6">
        {paquetes.map(paq => {
          const color = MODULE_COLORS[paq.nombre] || 'slate';
          const isExpanded = expandedPaquete === paq.id;
          
          return (
            <motion.div 
              key={paq.id} 
              layout
              className={`bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-2xl border-blue-100 ring-1 ring-blue-50' : 'hover:border-gray-200'}`}
            >
              {/* Header del Modulo */}
              <div 
                onClick={() => togglePaquete(paq.id)}
                className={`p-6 md:p-8 flex flex-col md:flex-row items-center justify-between cursor-pointer transition-all ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}
              >
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isExpanded ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-100 text-gray-400 shadow-gray-100'}`}>
                        {isExpanded ? <FolderOpen size={24}/> : <Folder size={24}/>}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">{paq.nombre}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            <Layers size={12}/> {paq.casos_uso?.length || 0} FUNCIONALIDADES
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8 mt-6 md:mt-0">
                    <div className="flex gap-4 border-r border-gray-200 pr-8">
                        {roles.map(rol => {
                            let isAllChecked = true;
                            const items = paq.casos_uso || [];
                            for (const cu of items) {
                                const p = getPermiso(rol, cu.id);
                                if (!getAccionesForCU(cu).every(a => (p as any)[a])) { isAllChecked = false; break; }
                            }
                            return (
                                <div key={rol.id} className="flex flex-col items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                    <span className="text-[9px] font-black text-gray-400 uppercase">{rol.nombre}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={isAllChecked} onChange={(e) => handleTogglePackage(rol.id, paq, e as any)} className="sr-only peer" />
                                        <div className={`w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${rol.nombre === 'Admin' ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-orange-500'}`}></div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    <div className={`w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-300 transition-all ${isExpanded ? 'rotate-180 bg-white text-blue-600 border-blue-100 shadow-sm' : ''}`}>
                        <ChevronDown size={20}/>
                    </div>
                </div>
              </div>

              {/* Detalle de Casos de Uso */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-white"
                  >
                    <div className="p-8 border-t border-gray-50 space-y-6">
                        {paq.casos_uso?.map(cu => {
                            const acciones = cu.es_crud 
                            ? [{k:'puede_ver', l:'Ver', i:<Eye size={12}/>}, {k:'puede_crear', l:'Crear', i:<PlusCircle size={12}/>}, {k:'puede_editar', l:'Editar', i:<Edit3 size={12}/>}, {k:'puede_eliminar', l:'Borrar', i:<Trash2 size={12}/>}] 
                            : [{k:'puede_ver', l:'Acceso General', i:<Zap size={12}/>}];

                            return (
                                <div key={cu.id} className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 hover:border-blue-100 transition-all group">
                                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">{cu.nombre}</h4>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4">ID: {cu.codigo}</p>
                                        </div>

                                        <div className="flex-1 flex flex-wrap gap-8 justify-end">
                                            {roles.map(rol => {
                                                const p = getPermiso(rol, cu.id);
                                                const isAllChecked = getAccionesForCU(cu).every(a => (p as any)[a]);

                                                return (
                                                    <div key={rol.id} className="space-y-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm min-w-[140px]">
                                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-2">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase">{rol.nombre}</span>
                                                            <button 
                                                                onClick={() => handleToggleCU(rol.id, cu)}
                                                                className={`p-1 rounded-lg transition-all ${isAllChecked ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-300'}`}
                                                            >
                                                                <CheckSquare size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {acciones.map(acc => {
                                                                const checked = (p as any)[acc.k];
                                                                return (
                                                                    <div key={acc.k} className="flex items-center justify-between gap-4">
                                                                        <div className={`flex items-center gap-1.5 ${checked ? 'text-gray-900' : 'text-gray-300'}`}>
                                                                            {acc.i} <span className="text-[10px] font-black uppercase tracking-tighter">{acc.l}</span>
                                                                        </div>
                                                                        <label className="relative inline-flex items-center cursor-pointer scale-75">
                                                                            <input type="checkbox" checked={checked} onChange={() => handleToggleAction(rol.id, cu.id, acc.k)} className="sr-only peer" />
                                                                            <div className={`w-7 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all ${rol.nombre === 'Admin' ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-orange-500'}`}></div>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer de Auditoría */}
      <div className="p-10 bg-gray-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 p-20 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 z-10 relative">
            <ShieldAlert size={36}/>
        </div>
        <div className="flex-1 text-center md:text-left z-10 relative">
            <h5 className="text-xl font-black uppercase tracking-tighter italic mb-1">Control de Integridad de Seguridad</h5>
            <p className="text-gray-400 font-medium text-sm max-w-2xl">Cada ajuste en esta matriz modifica en tiempo real los permisos de acceso de los empleados. Los cambios son auditados y quedan registrados en la bitácora del sistema.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest z-10 relative">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Auditoría Activa: 24/7
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
