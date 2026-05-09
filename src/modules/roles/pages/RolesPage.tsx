import React, { useEffect, useState } from 'react';
import { ShieldAlert, ChevronDown, FolderOpen, Folder, CheckSquare } from 'lucide-react';
import { rolesService } from '../rolesService';
import type { Rol, Paquete, PermisoRol, CasoUso } from '../types/roles.types';

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

  // 1. Individual Toggle
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

  // 2. CU Toggle (Select All for a Use Case)
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

  // 3. Package Toggle (Select All for a Package)
  const handleTogglePackage = (rolId: number, paq: Paquete, e: React.MouseEvent) => {
    e.stopPropagation();
    const rol = roles.find(r => r.id === rolId);
    if (!rol) return;

    // Check if ALL actions in ALL CUs of this package are true
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

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">Cargando Matriz...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-blue-600"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Administración Central</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Matriz de <span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-8">Permisos</span>
          </h1>
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          {roles.map(r => (
            <div key={r.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${r.nombre === 'Admin' ? 'bg-white shadow-sm border border-slate-200' : ''}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${r.nombre === 'Admin' ? 'bg-slate-900' : (r.nombre === 'Cajero' ? 'bg-amber-500' : 'bg-blue-500')}`}></div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{r.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {paquetes.map(mod => (
          <div key={mod.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden transition-all">
            
            {/* Header del Paquete */}
            <div onClick={() => togglePaquete(mod.id)} className="p-6 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors gap-4">
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-slate-100 ${expandedPaquete === mod.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
                  {expandedPaquete === mod.id ? <FolderOpen size={20} /> : <Folder size={20} />}
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{mod.nombre}</h2>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(mod.casos_uso || []).length} Casos de Uso</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Toggles del paquete por Rol */}
                <div className="hidden md:flex gap-4 mr-6 border-r border-slate-200 pr-6">
                  {roles.map(rol => {
                    // check if all granted for this rol
                    let isAllChecked = true;
                    const items = mod.casos_uso || [];
                    for (const cu of items) {
                      const p = getPermiso(rol, cu.id);
                      if (!getAccionesForCU(cu).every(a => (p as any)[a])) { isAllChecked = false; break; }
                    }
                    return (
                      <div key={rol.id} className="flex flex-col items-center gap-1" onClick={e => e.stopPropagation()}>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{rol.nombre}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={isAllChecked} onChange={(e) => handleTogglePackage(rol.id, mod, e as any)} className="sr-only peer" />
                          <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-800"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-transform duration-300 ${expandedPaquete === mod.id ? 'rotate-180' : ''}`}>
                  <ChevronDown className="text-slate-400" size={16} />
                </div>
              </div>
            </div>

            {/* Tabla Interna */}
            {expandedPaquete === mod.id && (
              <div className="border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Caso de Uso</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Acción</th>
                        {roles.map(r => (
                          <th key={r.id} className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{r.nombre}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(mod.casos_uso || []).map(cu => {
                        const acciones = cu.es_crud 
                          ? [{k:'puede_ver', l:'Ver / Listar (R)'}, {k:'puede_crear', l:'Crear Nuevo (C)'}, {k:'puede_editar', l:'Editar (U)'}, {k:'puede_eliminar', l:'Eliminar (D)'}] 
                          : [{k:'puede_ver', l:'Acceder / Ver'}];
                        
                        return (
                          <React.Fragment key={cu.id}>
                            {/* Fila Principal (Toggle CU) */}
                            <tr className="bg-slate-50/30 border-b-2 border-slate-100">
                              <td className="px-8 py-3 align-middle font-black text-slate-800 text-xs uppercase tracking-tighter">
                                {cu.nombre}
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
                                  Marcar Todos
                                </span>
                              </td>
                              {roles.map(rol => {
                                const p = getPermiso(rol, cu.id);
                                const isAllChecked = getAccionesForCU(cu).every(a => (p as any)[a]);
                                return (
                                  <td key={rol.id} className="px-4 py-3 text-center align-middle border-l border-slate-50">
                                    <label className="relative inline-flex items-center cursor-pointer group justify-center">
                                      <input type="checkbox" checked={isAllChecked} onChange={() => handleToggleCU(rol.id, cu)} className="sr-only peer" />
                                      <div className="w-5 h-5 bg-slate-200 rounded border border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors">
                                        <CheckSquare className={`w-3.5 h-3.5 text-white ${isAllChecked ? 'opacity-100' : 'opacity-0'} transition-opacity`} strokeWidth={3} />
                                      </div>
                                    </label>
                                  </td>
                                );
                              })}
                            </tr>

                            {/* Filas de Acciones (CRUD) */}
                            {acciones.map(acc => (
                              <tr key={`${cu.id}-${acc.k}`} className="hover:bg-blue-50/10 transition-colors">
                                <td className="px-8 py-2 border-r border-slate-50"></td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{acc.l}</span>
                                  </div>
                                </td>
                                {roles.map(rol => {
                                  const p = getPermiso(rol, cu.id);
                                  const checked = (p as any)[acc.k];
                                  return (
                                    <td key={rol.id} className="px-4 py-2 text-center border-l border-slate-50">
                                      <label className="relative inline-flex items-center cursor-pointer group justify-center">
                                        <input type="checkbox" checked={checked} onChange={() => handleToggleAction(rol.id, cu.id, acc.k)} className="sr-only peer" />
                                        <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                                      </label>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
          <ShieldAlert size={28} />
        </div>
        <div className="text-center md:text-left flex-grow">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-1">Control de Integridad</h4>
          <p className="text-xs text-slate-400 font-medium italic">
            Cualquier cambio en esta matriz impacta globalmente la seguridad del sistema y la visibilidad de los módulos.
          </p>
        </div>
        <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
          Audit Log: On
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
