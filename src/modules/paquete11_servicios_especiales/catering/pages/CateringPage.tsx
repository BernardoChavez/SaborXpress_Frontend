import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar as CalendarIcon, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import type { CateringServicio } from '../types/catering.types';
import * as cateringService from '../services/cateringService';
import CateringModal from '../components/CateringModal';
import axiosInstance from '../../../../api/axios';

const CateringPage = () => {
  const [servicios, setServicios] = useState<CateringServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<CateringServicio | null>(null);
  
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetchServicios();
    fetchProductos();
  }, [filterEstado, fechaDesde, fechaHasta]);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const data = await cateringService.getCateringServicios({
        estado: filterEstado,
        search: searchTerm,
        fecha_inicio: fechaDesde,
        fecha_fin: fechaHasta
      });
      setServicios(data);
    } catch (error) {
      console.error('Error fetching catering:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
      try {
          const res = await axiosInstance.get('/productos');
          setProductos(res.data);
      } catch(e) {
          console.error(e);
      }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServicios();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await cateringService.deleteCateringServicio(id);
        fetchServicios();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  const openModal = (servicio?: CateringServicio) => {
    setSelectedServicio(servicio || null);
    setShowModal(true);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'Confirmado': return 'bg-emerald-100 text-emerald-700';
      case 'En preparación': return 'bg-blue-100 text-blue-700';
      case 'Entregado': return 'bg-gray-100 text-gray-700';
      case 'Cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 italic tracking-tighter">Servicios de Catering</h1>
          <p className="text-sm text-slate-500">Gestiona los servicios de catering para eventos externos</p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 italic tracking-tighter">Listado de Servicios de Catering</h2>
            <p className="text-xs text-slate-500 mb-4">Consulta y administra los servicios registrados</p>
            
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por cliente, código o evento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Estado</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="En preparación">En preparación</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  />
                </div>

                <button type="button" onClick={() => {setSearchTerm(''); setFilterEstado('Todos'); setFechaDesde(''); setFechaHasta(''); fetchServicios();}} className="px-4 py-2 flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors">
                  <Filter size={16} />
                  Limpiar Filtros
                </button>
            </form>
          </div>
          
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Código</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Modalidad / Lugar</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Personas</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Total Estimado</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">Cargando servicios...</td>
                </tr>
              ) : servicios.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">No se encontraron servicios registrados.</td>
                </tr>
              ) : (
                servicios.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{s.codigo}</td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{s.cliente}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(s.fecha_evento).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-600 font-bold">{s.hora_evento.substring(0, 5)}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-indigo-600">{s.modalidad}</span>
                        {s.modalidad === 'Servicio Externo' && (
                          <span className="text-xs truncate max-w-[150px] text-gray-500">{s.direccion}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 text-center">{s.cantidad_personas}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">Bs. {Number(s.precio_total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(s.estado)}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(s)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver / Editar">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 size={16} />
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

      {/* DASHBOARD BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RESUMEN */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:col-span-1 flex flex-col h-full">
            <h3 className="text-lg font-black text-slate-800 italic tracking-tighter mb-4">Resumen de Servicios</h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center border border-gray-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <ClipboardList size={20} />
                        <span className="text-2xl font-black">{servicios.length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-600">Total Servicios</p>
                    <p className="text-[10px] text-gray-400">Todos los registros</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 flex flex-col justify-center border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <Clock size={20} />
                        <span className="text-2xl font-black">{servicios.filter(s => s.estado === 'Pendiente').length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-600">Pendientes</p>
                    <p className="text-[10px] text-gray-400">Por confirmar</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 flex flex-col justify-center border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Eye size={20} />
                        <span className="text-2xl font-black">{servicios.filter(s => s.estado === 'En preparación').length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-600">En preparación</p>
                    <p className="text-[10px] text-gray-400">Servicios activos</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col justify-center border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <CheckCircle size={20} />
                        <span className="text-2xl font-black">{servicios.filter(s => s.estado === 'Entregado').length}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-600">Entregados</p>
                    <p className="text-[10px] text-gray-400">Completados</p>
                </div>
            </div>
        </div>

        {/* CALENDARIO VISUAL MOCKUP */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="text-indigo-600" size={24} />
                <h3 className="text-lg font-black text-slate-800 italic tracking-tighter">Calendario de Servicios</h3>
             </div>
             
             <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-500 font-bold">&lt;</button>
                        <button className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-500 font-bold">&gt;</button>
                        <button className="px-4 py-1 bg-white border border-gray-200 rounded text-gray-600 font-bold text-sm">Hoy</button>
                    </div>
                    <h4 className="text-md font-black text-gray-800">Este Mes</h4>
                    <div className="flex bg-gray-200 rounded p-0.5">
                        <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold shadow-sm">Mes</button>
                        <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-xs font-bold">Semana</button>
                        <button className="px-3 py-1 text-gray-600 hover:text-gray-900 rounded text-xs font-bold">Día</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
                    {['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map(day => (
                        <div key={day} className="p-2 text-center text-[10px] font-black text-gray-400 uppercase">{day}</div>
                    ))}
                </div>
                {/* Just a mockup grid of days to match the user's screenshot visually */}
                <div className="grid grid-cols-7 h-48 bg-gray-50 gap-px">
                   {[...Array(28)].map((_, i) => {
                       const found = servicios.find(s => {
                           const d = new Date(s.fecha_evento);
                           // Match roughly some day based on id or length
                           return d.getDate() === i + 1;
                       });
                       
                       return (
                           <div key={i} className="bg-white p-1 min-h-[60px] relative">
                               <span className="text-xs text-gray-400 font-medium absolute top-1 right-2">{i+1}</span>
                               {found && (
                                   <div className={`mt-4 text-[9px] p-1 rounded truncate border-l-2 ${found.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-500' : 'bg-emerald-100 text-emerald-800 border-emerald-500'}`}>
                                       {found.codigo}<br/>{found.hora_evento.substring(0,5)} - {found.cliente}
                                   </div>
                               )}
                           </div>
                       );
                   })}
                </div>
             </div>
        </div>

      </div>

      {showModal && (
          <CateringModal 
            isOpen={showModal} 
            onClose={() => {setShowModal(false); fetchServicios();}} 
            servicio={selectedServicio} 
            productos={productos}
          />
      )}
    </div>
  );
};

export default CateringPage;
