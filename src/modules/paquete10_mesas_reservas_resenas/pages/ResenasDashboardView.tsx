import { useState, useEffect } from 'react';
import { Button, Spinner, Chip } from '@nextui-org/react';
import { Star, MessageSquare, TrendingUp, Award, Filter, Calendar, Eye, EyeOff } from 'lucide-react';
import api from '../../../api/axios';

export const ResenasDashboardView = () => {
  const [data, setData] = useState<{ resenas: any[], estadisticas: { promedio: number, total: number } }>({ 
    resenas: [], 
    estadisticas: { promedio: 0, total: 0 } 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterLeido, setFilterLeido] = useState<string>('todos'); // 'todos', 'pendientes', 'leidos'

  useEffect(() => {
    api.get('/resenas')
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleLeido = async (resena: any) => {
    const newLeidoStatus = !resena.leido;
    try {
      await api.put(`/resenas/${resena.id}`, {
        ...resena,
        leido: newLeidoStatus
      });
      setData(prev => ({
        ...prev,
        resenas: prev.resenas.map(r => r.id === resena.id ? { ...r, leido: newLeidoStatus } : r)
      }));
    } catch (err) {
      console.error("Error actualizando estado de lectura:", err);
    }
  };

  const renderStars = (rating: number, size = 18) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={size} 
        className={i < rating ? "text-[#f59e0b] fill-[#f59e0b]" : "text-gray-200"} 
      />
    ));
  };

  // Calcular conteo por estrellas
  const counts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: data.resenas.filter(r => Math.round(r.calificacion) === stars).length,
    percentage: data.estadisticas.total > 0 
      ? Math.round((data.resenas.filter(r => Math.round(r.calificacion) === stars).length / data.estadisticas.total) * 100) 
      : 0
  }));

  const filteredResenas = data.resenas.filter(r => {
    if (filterRating && Math.round(r.calificacion) !== filterRating) return false;
    if (filterLeido === 'pendientes' && r.leido) return false;
    if (filterLeido === 'leidos' && !r.leido) return false;
    return true;
  });

  const pendientesCount = data.resenas.filter(r => !r.leido).length;
  const leidosCount = data.resenas.filter(r => r.leido).length;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Spinner size="lg" color="primary" label="Cargando reseñas y estadísticas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado Estático */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Satisfacción del Cliente
              {pendientesCount > 0 && (
                <span className="text-xs font-bold bg-[#ff5722] text-white px-3 py-1 rounded-full shadow-sm">
                  {pendientesCount} por leer
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1 font-medium text-sm">Monitorea las opiniones y gestiona su lectura de forma instantánea</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-semibold text-gray-700">
            <Award size={18} className="text-[#ff5722]" />
            <span>Excelente reputación</span>
          </div>
        </div>

        {/* Tarjetas de Métricas Principales (Estáticas y sin efectos pesados) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Tarjeta Promedio */}
          <div className="rounded-2xl p-6 text-white shadow-md flex items-center justify-between" style={{ backgroundColor: '#ff5722' }}>
            <div>
              <p className="text-white/90 font-bold text-xs tracking-wide uppercase">Calificación Promedio</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black">{Number(data.estadisticas.promedio || 0).toFixed(1)}</span>
                <span className="text-lg font-bold text-white/80">/ 5.0</span>
              </div>
              <div className="flex gap-1 mt-2">
                {renderStars(Math.round(data.estadisticas.promedio || 5), 18)}
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Star size={32} className="fill-white" />
            </div>
          </div>
          
          {/* Tarjeta Total Reseñas */}
          <div className="rounded-2xl p-6 text-white shadow-md flex items-center justify-between" style={{ backgroundColor: '#10b981' }}>
            <div>
              <p className="text-white/90 font-bold text-xs tracking-wide uppercase">Opiniones Recibidas</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black">{data.estadisticas.total || 0}</span>
              </div>
              <p className="text-xs font-semibold text-white/90 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> +12% este mes
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <MessageSquare size={32} />
            </div>
          </div>

          {/* Tarjeta Desglose por Estrellas (Ligera para filtrar) */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Filter size={14} className="text-[#ff5722]" /> Desglose por estrellas
              </span>
            </div>
            <div className="space-y-1.5">
              {counts.map(({ stars, count, percentage }) => (
                <div 
                  key={stars} 
                  onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                  className={`flex items-center gap-2 cursor-pointer p-1 rounded transition-colors ${
                    filterRating === stars ? 'bg-orange-50 font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-600 w-6 flex items-center">
                    {stars} <Star size={10} className="ml-0.5 text-[#f59e0b] fill-[#f59e0b]" />
                  </span>
                  <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444' 
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Filtros Activos y Pestañas de Estado de Lectura */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-bold text-gray-800">Comentarios Recientes</h2>
            {filterRating && (
              <Chip 
                onClose={() => setFilterRating(null)} 
                variant="flat" 
                style={{ backgroundColor: '#ff5722', color: '#fff' }}
                className="font-bold text-xs"
              >
                Filtrado: {filterRating} ★
              </Chip>
            )}
          </div>

          {/* Pestañas de Lectura Estáticas */}
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setFilterLeido('todos')}
              className={`px-3 py-1.5 rounded transition-colors ${filterLeido === 'todos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Todas ({data.resenas.length})
            </button>
            <button
              onClick={() => setFilterLeido('pendientes')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${filterLeido === 'pendientes' ? 'bg-[#ff5722] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              🔴 Por Leer ({pendientesCount})
            </button>
            <button
              onClick={() => setFilterLeido('leidos')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${filterLeido === 'leidos' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ✅ Leídas ({leidosCount})
            </button>
          </div>
        </div>

        {/* Grid de Comentarios Estático */}
        {filteredResenas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResenas.map((resena: any) => (
              <div 
                key={resena.id} 
                className={`bg-white rounded-xl p-5 shadow-sm border flex flex-col justify-between ${
                  !resena.leido ? 'border-orange-300 bg-orange-50/10' : 'border-gray-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                      {renderStars(resena.calificacion)}
                    </div>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(resena.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 font-medium text-sm leading-relaxed italic mb-4">
                    "{resena.comentario || 'El comensal no dejó comentario escrito, solo calificación.'}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold gap-2">
                  <span className="text-[#ff5722] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                    Pedido #{resena.venta_id}
                  </span>
                  
                  {/* Botón Toggle de Lectura Estático y Snappy */}
                  <button
                    onClick={() => handleToggleLeido(resena)}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      resena.leido 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200' 
                        : 'bg-[#ff5722] text-white hover:bg-[#e64a19] shadow-sm'
                    }`}
                  >
                    {resena.leido ? (
                      <>
                        <EyeOff size={13} /> Leída
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Marcar Leída
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-700">No se encontraron reseñas</h3>
            <p className="text-gray-400 text-xs mt-1">No hay comentarios que coincidan con los filtros seleccionados.</p>
            <div className="flex justify-center gap-2 mt-4">
              {filterRating && (
                <Button 
                  size="sm" 
                  style={{ backgroundColor: '#ff5722', color: '#fff' }}
                  className="font-bold text-xs" 
                  onPress={() => setFilterRating(null)}
                >
                  Quitar filtro de estrellas
                </Button>
              )}
              {filterLeido !== 'todos' && (
                <Button 
                  size="sm" 
                  variant="flat"
                  className="font-bold text-xs" 
                  onPress={() => setFilterLeido('todos')}
                >
                  Ver todas
                </Button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
