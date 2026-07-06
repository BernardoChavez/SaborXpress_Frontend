import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertCircle, CheckCircle, Mail, Filter, Send, Settings, History, Eye } from 'lucide-react';
import { inventarioService } from '../inventarioService';

export const AlertasPage = () => {
    const [alertas, setAlertas] = useState<any[]>([]);
    const [historial, setHistorial] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [filterTipo, setFilterTipo] = useState('Todos');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Datos maestros
    const [inventarioBruto, setInventarioBruto] = useState<any[]>([]);
    const [inventarioProcesado, setInventarioProcesado] = useState<any[]>([]);

    // Formulario de Configuración
    const [configForm, setConfigForm] = useState({
        tipo_inventario: 'Materia Prima',
        inventario_id: '',
        unidad: '',
        alerta_activa: true,
        correo_remitente: 'sistema@saborxpress.com',
        correo_destinatario: 'admin@saborxpress.com',
        encargado: 'Juan Pérez'
    });
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        fetchAlertas();
        fetchHistorial();
        fetchInventarios();
    }, [filterEstado, filterTipo, fechaDesde, fechaHasta]);

    const fetchAlertas = async () => {
        setLoading(true);
        try {
            const data = await inventarioService.getAlertas({
                search: searchTerm,
                estado: filterEstado,
                tipo_inventario: filterTipo,
                fecha_inicio: fechaDesde,
                fecha_fin: fechaHasta
            });
            setAlertas(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistorial = async () => {
        try {
            const data = await inventarioService.getHistorialAlertas();
            setHistorial(data);
        } catch (error) {
            console.error(error);
        }
    };

    const [debugInfo, setDebugInfo] = useState<string>('');

    const fetchInventarios = async () => {
        try {
            setDebugInfo('Fetching...');
            const [bruto, procesado] = await Promise.all([
                inventarioService.getAllBruto(),
                inventarioService.getAllProcesado()
            ]);
            setDebugInfo(`Success: ${bruto?.length} bruto, ${procesado?.length} proc`);
            setInventarioBruto(bruto || []);
            setInventarioProcesado(procesado || []);
        } catch (error: any) {
            setDebugInfo(`Error: ${error.message || String(error)}`);
            console.error("Error fetching inventarios:", error);
        }
    };

    const handleConfigChange = async (field: string, value: any) => {
        const newForm = { ...configForm, [field]: value };
        setConfigForm(newForm);

        if (field === 'tipo_inventario' || field === 'inventario_id') {
            if (newForm.inventario_id) {
                // Fetch config when product is selected
                try {
                    const data = await inventarioService.getConfigAlerta(newForm.tipo_inventario, parseInt(newForm.inventario_id));
                    
                    let unidad = '';
                    if (newForm.tipo_inventario === 'Materia Prima') {
                        unidad = inventarioBruto.find(p => p.id === parseInt(newForm.inventario_id))?.unidad_medida || '';
                    } else {
                        unidad = inventarioProcesado.find(p => p.id === parseInt(newForm.inventario_id))?.unidad_medida || '';
                    }

                    setConfigForm(prev => ({
                        ...prev,
                        unidad,
                        alerta_activa: data.alerta_activa,
                        correo_remitente: data.correo_remitente || prev.correo_remitente,
                        correo_destinatario: data.correo_destinatario || prev.correo_destinatario,
                        encargado: data.encargado || prev.encargado
                    }));
                } catch (error) {
                    console.error(error);
                }
            }
        }
    };

    const saveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!configForm.inventario_id) {
            alert('Selecciona un producto');
            return;
        }
        setSavingConfig(true);
        try {
            await inventarioService.configurarAlerta({
                tipo_inventario: configForm.tipo_inventario,
                inventario_id: parseInt(configForm.inventario_id),
                alerta_activa: configForm.alerta_activa,
                correo_remitente: configForm.correo_remitente,
                correo_destinatario: configForm.correo_destinatario,
                encargado: configForm.encargado
            });
            alert('Configuración guardada exitosamente');
            fetchAlertas();
            // Refresh inventory to reflect new stock_minimo
            fetchInventarios();
        } catch (error) {
            alert('Error al guardar configuración');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAtender = async (id: number) => {
        try {
            await inventarioService.marcarAlertaAtendida(id);
            fetchAlertas();
        } catch (error) {
            alert('Error al actualizar alerta');
        }
    };

    const [resendingId, setResendingId] = useState<number | null>(null);

    const handleReenviar = async (id: number) => {
        if (resendingId) return;
        setResendingId(id);
        try {
            await inventarioService.reenviarCorreoAlerta(id);
            alert('¡Correo reenviado exitosamente a través del servidor!');
            fetchAlertas();
            fetchHistorial();
        } catch (error) {
            alert('Error al reenviar correo. Verifique sus credenciales SMTP y el destinatario.');
        } finally {
            setResendingId(null);
        }
    };

    const handleDeleteAlerta = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar esta alerta del registro?')) return;
        try {
            await inventarioService.deleteAlerta(id);
            alert('Alerta eliminada');
            fetchAlertas();
        } catch (error) {
            alert('Error al eliminar alerta');
        }
    };

    const handleDeleteConfig = async () => {
        if (!configForm.inventario_id) return;
        if (!window.confirm('¿Está seguro de eliminar la configuración de stock para este producto?')) return;
        setSavingConfig(true);
        try {
            await inventarioService.deleteConfigAlerta(configForm.tipo_inventario, parseInt(configForm.inventario_id));
            alert('Configuración eliminada exitosamente');
            
            // Limpiar formulario y recargar
            setConfigForm(prev => ({
                ...prev,
                inventario_id: '',
                stock_minimo: '',
                alerta_activa: true,
                correo_remitente: 'sistema@saborxpress.com',
                correo_destinatario: 'admin@saborxpress.com',
                encargado: 'Juan Pérez'
            }));
            fetchAlertas();
            fetchInventarios();
        } catch (error) {
            alert('Error al eliminar configuración');
        } finally {
            setSavingConfig(false);
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFilterEstado('Todos');
        setFilterTipo('Todos');
        setFechaDesde('');
        setFechaHasta('');
    };

    const renderProductosOptions = () => {
        const list = configForm.tipo_inventario === 'Materia Prima' ? inventarioBruto : inventarioProcesado;
        return list.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
        ));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Alertas de Inventario</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Gestiona y configura las alertas automáticas de inventario</p>
                    <p className="text-xs text-red-500 font-bold">{debugInfo}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => document.getElementById('config-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5 text-sm font-bold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-xl shadow-sm transition-all flex items-center gap-2">
                        <Settings size={18} /> Configurar Alertas
                    </button>
                    <button onClick={() => document.getElementById('historial-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2">
                        <History size={18} /> Historial de Alertas
                    </button>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-red-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <Bell size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{alertas.length}</div>
                        <div className="text-sm font-bold text-slate-600">Total de Alertas</div>
                        <div className="text-xs text-slate-400">Todas las alertas generadas</div>
                    </div>
                </div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-orange-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{alertas.filter(a => a.estado === 'Pendiente').length}</div>
                        <div className="text-sm font-bold text-slate-600">Pendientes</div>
                        <div className="text-xs text-slate-400">Requieren atención</div>
                    </div>
                </div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-green-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{alertas.filter(a => a.estado === 'Atendida').length}</div>
                        <div className="text-sm font-bold text-slate-600">Atendidas</div>
                        <div className="text-xs text-slate-400">Alertas solucionadas</div>
                    </div>
                </div>
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-purple-50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <Mail size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-800">{historial.length}</div>
                        <div className="text-sm font-bold text-slate-600">Correos Enviados</div>
                        <div className="text-xs text-slate-400">Notificaciones enviadas</div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gray-50/50 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Buscar por producto, código o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAlertas()}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>
                    </div>
                    <div className="w-40">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Estado</label>
                        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm">
                            <option value="Todos">Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Atendida">Atendida</option>
                        </select>
                    </div>
                    <div className="w-48">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tipo de Inventario</label>
                        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm">
                            <option value="Todos">Todos</option>
                            <option value="Materia Prima">Materia Prima</option>
                            <option value="Elaborado">Elaborado</option>
                        </select>
                    </div>
                    <div className="w-40">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fecha Desde</label>
                        <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"/>
                    </div>
                    <div className="w-40">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fecha Hasta</label>
                        <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"/>
                    </div>
                    <button onClick={limpiarFiltros} className="px-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2">
                        <Filter size={18} /> Limpiar Filtros
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Código</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Stock Actual</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Stock Mínimo</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Encargado</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Fecha / Hora</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Correo Enviado</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={9} className="p-8 text-center text-gray-400">Cargando alertas...</td></tr>
                            ) : alertas.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No se encontraron alertas</td></tr>
                            ) : (
                                alertas.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{a.codigo}</td>
                                        <td className="p-4 text-sm text-slate-700 font-medium flex items-center gap-2">
                                            {/* Fake icon to match design */}
                                            <div className="w-6 h-6 rounded-full bg-red-100 flex-shrink-0"></div>
                                            {a.producto_nombre}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{a.tipo_inventario}</td>
                                        <td className="p-4 text-sm font-black text-red-500 text-center">{Number(a.stock_actual).toFixed(2)}</td>
                                        <td className="p-4 text-sm font-bold text-slate-700 text-center">{Number(a.stock_minimo).toFixed(2)}</td>
                                        <td className="p-4 text-sm text-slate-600">{a.encargado || 'No asignado'}</td>
                                        <td className="p-4 text-sm text-slate-600">{new Date(a.created_at).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.estado === 'Pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {a.estado}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {a.fecha_envio_correo ? new Date(a.fecha_envio_correo).toLocaleString() : 'No enviado'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Ver Detalle">
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleReenviar(a.id)} 
                                                    disabled={resendingId === a.id}
                                                    className={`p-1.5 rounded-lg transition-colors ${resendingId === a.id ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-purple-400 hover:text-purple-600 hover:bg-purple-50'}`} 
                                                    title="Reenviar Correo"
                                                >
                                                    {resendingId === a.id ? (
                                                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <Send size={16} />
                                                    )}
                                                </button>
                                                {a.estado === 'Pendiente' && (
                                                    <button onClick={() => handleAtender(a.id)} className="p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Marcar como Atendida">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteAlerta(a.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Alerta">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Config Form */}
                <div id="config-section" className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-black text-slate-800">Configurar Stock Mínimo</h2>
                    <p className="text-xs font-medium text-slate-500 mb-6">Define el stock mínimo permitido para cada producto</p>

                    <form onSubmit={saveConfig} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Producto</label>
                                <select 
                                    required 
                                    value={configForm.inventario_id}
                                    onChange={(e) => handleConfigChange('inventario_id', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                >
                                    <option value="" disabled>Seleccionar producto</option>
                                    {renderProductosOptions()}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Unidad</label>
                                <input 
                                    type="text" 
                                    disabled 
                                    value={configForm.unidad}
                                    placeholder="Unidad..."
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tipo de Inventario</label>
                                <select 
                                    value={configForm.tipo_inventario}
                                    onChange={(e) => {
                                        handleConfigChange('tipo_inventario', e.target.value);
                                        handleConfigChange('inventario_id', '');
                                    }}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                >
                                    <option value="Materia Prima">Materia Prima</option>
                                    <option value="Elaborado">Elaborado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Encargado</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={configForm.encargado}
                                    onChange={(e) => handleConfigChange('encargado', e.target.value)}
                                    placeholder="Nombre del encargado"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Remitente</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={configForm.correo_remitente}
                                    onChange={(e) => handleConfigChange('correo_remitente', e.target.value)}
                                    placeholder="ej. sistema@saborxpress.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Correo Destinatario</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={configForm.correo_destinatario}
                                    onChange={(e) => handleConfigChange('correo_destinatario', e.target.value)}
                                    placeholder="ej. admin@saborxpress.com"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                                />
                            </div>
                            <div className="col-span-1 flex items-center justify-between mt-2">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Alerta Activa</label>
                                    <p className="text-xs text-gray-400">Recibir notificaciones cuando el stock sea bajo</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={configForm.alerta_activa}
                                        onChange={(e) => handleConfigChange('alerta_activa', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <button type="button" onClick={() => setConfigForm({...configForm, inventario_id: ''})} className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
                            <div className="flex gap-2">
                                {configForm.inventario_id && (
                                    <button type="button" onClick={handleDeleteConfig} disabled={savingConfig} className="px-5 py-2.5 text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm">
                                        Eliminar
                                    </button>
                                )}
                                <button type="submit" disabled={savingConfig} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
                                    {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Historial */}
                <div id="historial-section" className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 flex flex-col h-[500px]">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Historial de Alertas Enviadas</h2>
                        <p className="text-xs font-medium text-slate-500 mb-6">Últimas notificaciones enviadas por correo</p>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                                    <th className="pb-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                                    <th className="pb-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Envío</th>
                                    <th className="pb-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatario</th>
                                    <th className="pb-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {historial.map(h => (
                                    <tr key={h.id} className="hover:bg-gray-50/50">
                                        <td className="py-3 px-2 font-bold text-gray-700">{h.codigo}</td>
                                        <td className="py-3 px-2 text-gray-600">{h.producto_nombre}</td>
                                        <td className="py-3 px-2 text-gray-600">{new Date(h.fecha_envio_correo).toLocaleString()}</td>
                                        <td className="py-3 px-2 text-gray-600">{h.correo_destinatario}</td>
                                        <td className="py-3 px-2 text-right">
                                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-600">Enviado</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-2">
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Ver historial completo →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
