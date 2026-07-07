import { useState, useEffect } from 'react';
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { LayoutGrid, CloudSun, Users, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import api from '../../../api/axios';

// Componente para dibujar la mesa con sus sillas
const TableShape = ({ mesa, isSelected, onClick }: { mesa: any, isSelected: boolean, onClick: () => void }) => {
  const capacidad = parseInt(mesa.capacidad);
  const estado = mesa.estado.toLowerCase();
  
  // Colores HEX inmutables para que Tailwind no los borre jamás
  let tableBg = '#e2e8f0'; // gris claro (libre)
  let chairBg = '#cbd5e1'; 
  let textColor = '#475569';
  let estadoText = 'Libre';
  
  if (isSelected) {
    tableBg = '#ff5722'; // Naranja SaborXpress
    chairBg = '#ff8a65';
    textColor = '#ffffff';
    estadoText = 'Seleccionada';
  } else if (estado === 'ocupada') {
    tableBg = '#64748b'; // Gris oscuro
    chairBg = '#94a3b8';
    textColor = '#ffffff';
    estadoText = 'Ocupada';
  } else if (estado === 'reservada') {
    tableBg = '#f59e0b'; // Ámbar/Naranja oscuro para reservadas
    chairBg = '#fbbf24';
    textColor = '#ffffff';
    estadoText = 'Reservada';
  }

  const renderChairs = (side: 'left' | 'right') => {
    const chairCount = Math.ceil(capacidad / 2);
    return Array.from({ length: chairCount }).map((_, i) => (
      <div 
        key={`${side}-${i}`} 
        className="w-3 h-8 rounded-full my-1 transition-colors duration-200 shadow-sm" 
        style={{ backgroundColor: chairBg }}
      />
    ));
  };

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center justify-center cursor-pointer p-3 group hover:scale-105 transition-transform"
    >
      <div className="flex items-center justify-center">
        <div className="flex flex-col mr-1.5">{renderChairs('left')}</div>
        
        <div 
          className="w-20 flex flex-col items-center justify-center rounded-2xl shadow-md transition-all duration-200 relative border border-black/5" 
          style={{ 
            height: `${Math.max(capacidad * 14, 70)}px`,
            backgroundColor: tableBg 
          }}
        >
          <span 
            className="text-lg font-black tracking-tight" 
            style={{ color: textColor }}
          >
            {mesa.numero}
          </span>
          
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1 shadow-inner truncate max-w-[70px]"
            style={{ 
              backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
              color: isSelected ? '#ffffff' : textColor 
            }}
          >
            {estado === 'reservada' && mesa.reserva_nombre ? `Res: ${mesa.reserva_nombre.split(' ')[0]}` : estadoText}
          </span>
        </div>

        <div className="flex flex-col ml-1.5">{renderChairs('right')}</div>
      </div>
      <span className="text-xs text-gray-400 font-medium mt-2 group-hover:text-gray-600 transition-colors">
        {capacidad} pers.
      </span>
    </div>
  );
};

export const MesasMapView = () => {
  const [zonas, setZonas] = useState<any[]>([]);
  const [selectedZona, setSelectedZona] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure();

  // Estados para CRUD de edición de mesa existente
  const [newEstado, setNewEstado] = useState<string>('libre');
  const [newFila, setNewFila] = useState<number>(1);
  const [newCapacidad, setNewCapacidad] = useState<string>('4');
  const [reservaNombre, setReservaNombre] = useState<string>('');
  const [reservaTelefono, setReservaTelefono] = useState<string>('');
  const [reservaHora, setReservaHora] = useState<string>('');

  // Estado para buscar reserva en tiempo real cuando llega un cliente
  const [searchReserva, setSearchReserva] = useState<string>('');

  // Estados para crear nueva mesa
  const [newTableNumero, setNewTableNumero] = useState('');
  const [newTableCapacidad, setNewTableCapacidad] = useState('4');
  const [selectedFilaForCreate, setSelectedFilaForCreate] = useState<number>(1);

  const fetchZonas = () => {
    setIsLoading(true);
    api.get('/zonas')
      .then(res => {
        const filtered = res.data.filter((z: any) => 
          z.nombre.toLowerCase().includes('terraza') || z.nombre.toLowerCase().includes('salón') || z.nombre.toLowerCase().includes('salon')
        );
        setZonas(filtered);
        if (filtered.length > 0 && !selectedZona) {
          setSelectedZona(filtered[0].id);
        }
      })
      .catch(err => console.error("Error cargando zonas:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchZonas();
  }, []);

  const selectedZonaData = zonas.find(z => z.id === selectedZona);

  const getZoneIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('terraza') || n.includes('outdoor')) return <CloudSun size={18} />;
    return <LayoutGrid size={18} />;
  };

  const handleOpenModal = () => {
    if (selectedTable) {
      setNewEstado(selectedTable.estado);
      setNewFila(selectedTable.fila || 1);
      setNewCapacidad(selectedTable.capacidad ? selectedTable.capacidad.toString() : '4');
      setReservaNombre(selectedTable.reserva_nombre || '');
      setReservaTelefono(selectedTable.reserva_telefono || '');
      setReservaHora(selectedTable.reserva_hora || '');
      onOpen();
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedTable) return;
    setIsUpdating(true);
    try {
      const updatedData = {
        ...selectedTable,
        estado: newEstado,
        fila: newFila,
        capacidad: parseInt(newCapacidad),
        reserva_nombre: newEstado === 'reservada' ? reservaNombre : null,
        reserva_telefono: newEstado === 'reservada' ? reservaTelefono : null,
        reserva_hora: newEstado === 'reservada' ? reservaHora : null,
      };
      await api.put(`/mesas/${selectedTable.id}`, updatedData);

      if (newEstado === 'reservada' && reservaNombre) {
        try {
          await api.post('/reservas', {
            mesa_id: selectedTable.id,
            cliente_nombre: `${reservaNombre} (${reservaTelefono})`,
            fecha: new Date().toISOString().split('T')[0],
            hora: reservaHora || '20:00',
            personas: parseInt(newCapacidad),
            estado: 'confirmada'
          });
        } catch (e) {
          console.error("No se pudo crear historial de reserva:", e);
        }
      }

      setZonas(prev => prev.map(z => {
        if (z.id === selectedTable.zona_id) {
          return {
            ...z,
            mesas: z.mesas.map((m: any) => m.id === selectedTable.id ? updatedData : m)
          };
        }
        return z;
      }));
      setSelectedTable(updatedData);
      onClose();
    } catch (err) {
      console.error("Error actualizando mesa:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOcuparReserva = async (mesa: any) => {
    try {
      const updatedData = {
        ...mesa,
        estado: 'ocupada',
        reserva_nombre: null,
        reserva_telefono: null,
        reserva_hora: null,
      };
      await api.put(`/mesas/${mesa.id}`, updatedData);
      setZonas(prev => prev.map(z => {
        if (z.id === mesa.zona_id) {
          return {
            ...z,
            mesas: z.mesas.map((m: any) => m.id === mesa.id ? updatedData : m)
          };
        }
        return z;
      }));
      setSearchReserva('');
    } catch (err) {
      console.error("Error al ocupar mesa reservada:", err);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableNumero.trim()) return;
    setIsCreating(true);
    try {
      await api.post('/mesas', {
        zona_id: selectedZona,
        numero: newTableNumero.startsWith('M') ? newTableNumero : `M${newTableNumero}`,
        capacidad: parseInt(newTableCapacidad),
        estado: 'libre',
        fila: selectedFilaForCreate
      });
      await fetchZonas();
      setNewTableNumero('');
      onCloseCreate();
    } catch (err) {
      console.error("Error creando mesa:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    if (!window.confirm(`¿Estás seguro de eliminar la Mesa ${selectedTable.numero}?`)) return;
    setIsDeleting(true);
    try {
      await api.delete(`/mesas/${selectedTable.id}`);
      await fetchZonas();
      setSelectedTable(null);
      onClose();
    } catch (err) {
      console.error("Error eliminando mesa:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && zonas.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <Spinner size="lg" color="primary" label="Cargando mapa de mesas..." />
      </div>
    );
  }

  // Agrupar las mesas por número de fila (fila 1, 2, 3...)
  const allMesas = [...(selectedZonaData?.mesas || [])].sort((a: any, b: any) => (a.fila || 1) - (b.fila || 1) || a.id - b.id);
  const rowNumbers = Array.from(new Set(allMesas.map((m: any) => m.fila || 1))).sort((a: number, b: number) => a - b);
  if (rowNumbers.length === 0) rowNumbers.push(1);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col min-h-[850px]">
        
        {/* Header Superior */}
        <div className="flex items-center justify-between p-6 md:px-10 border-b border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Mapa de Mesas por Filas</h1>
            <p className="text-sm text-gray-500 mt-1">Cada fila tiene un límite máximo de 4 mesas. Haz clic en cualquier mesa para gestionar su estado o editarla.</p>
          </div>
          
          {/* Leyenda de Colores */}
          <div className="hidden sm:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200/60 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e2e8f0]"></span> Libre</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Reservada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#64748b]"></span> Ocupada</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff5722]"></span> Seleccionada</span>
          </div>
        </div>

        {/* Pestañas de Zonas */}
        <div className="flex justify-between items-center px-6 md:px-10 py-5 bg-gray-50/50 border-b border-gray-100">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {zonas.map(zona => {
              const isActive = selectedZona === zona.id;
              return (
                <Button 
                  key={zona.id} 
                  radius="full"
                  size="lg"
                  className={`font-bold px-6 h-12 transition-colors ${
                    isActive 
                      ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/30' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onPress={() => {
                    setSelectedZona(zona.id);
                    setSelectedTable(null);
                  }}
                  startContent={getZoneIcon(zona.nombre)}
                >
                  {zona.nombre}
                </Button>
              );
            })}
          </div>

          <Button
            onPress={() => {
              const maxRow = rowNumbers.length > 0 ? Math.max(...rowNumbers) + 1 : 1;
              const nextNum = (selectedZonaData?.mesas?.length || 0) + 1;
              setNewTableNumero(`M${nextNum}`);
              setSelectedFilaForCreate(maxRow);
              onOpenCreate();
            }}
            className="font-bold bg-gray-800 text-white shadow-md hover:bg-gray-900 px-5 h-11"
            radius="lg"
            startContent={<Plus size={18} />}
          >
            + Crear Nueva Fila
          </Button>
        </div>

        {/* Buscador Rápido de Reservas por WhatsApp / Nombre */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 md:px-10 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm w-full md:w-auto">
            <span className="text-lg font-black">Res.</span>
            <span>Recepción / Reservas (WhatsApp):</span>
          </div>
          <div className="flex items-center gap-2 w-full md:max-w-md relative">
            <input
              type="text"
              placeholder="Buscar reserva por nombre o celular (Ej: Carlos, 7712)..."
              value={searchReserva}
              onChange={(e) => setSearchReserva(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-amber-300 bg-white text-gray-800 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">Q</span>
            {searchReserva && (
              <button onClick={() => setSearchReserva('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 font-bold">X</button>
            )}
          </div>
        </div>

        {/* Banner de Resultados de Reserva Encontrada */}
        {searchReserva.trim() !== '' && (
          <div className="bg-amber-100 border-b border-amber-300 px-6 md:px-10 py-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2">Resultados de Búsqueda de Reserva:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zonas.flatMap(z => z.mesas.map((m: any) => ({ ...m, zonaNombre: z.nombre }))).filter((m: any) => 
                m.estado === 'reservada' && (
                  (m.reserva_nombre && m.reserva_nombre.toLowerCase().includes(searchReserva.toLowerCase())) ||
                  (m.reserva_telefono && m.reserva_telefono.includes(searchReserva))
                )
              ).map((m: any) => (
                <div key={m.id} className="bg-white p-3 rounded-2xl border-2 border-amber-400 shadow-md flex items-center justify-between gap-3 animate-pulse">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-500 text-white font-black text-xs px-2 py-0.5 rounded-md">{m.numero}</span>
                      <span className="text-xs font-bold text-gray-600">({m.zonaNombre})</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 mt-1">Cliente: {m.reserva_nombre}</p>
                    <p className="text-xs text-amber-700 font-semibold">Tel: {m.reserva_telefono || 'Sin cel'} • Hora: {m.reserva_hora || 'Sin hora'}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white font-black shadow-md shrink-0"
                    onPress={() => handleOcuparReserva(m)}
                  >
                    Sentar Cliente
                  </Button>
                </div>
              ))}
              {zonas.flatMap(z => z.mesas).filter((m: any) => 
                m.estado === 'reservada' && (
                  (m.reserva_nombre && m.reserva_nombre.toLowerCase().includes(searchReserva.toLowerCase())) ||
                  (m.reserva_telefono && m.reserva_telefono.includes(searchReserva))
                )
              ).length === 0 && (
                <p className="text-sm text-amber-800 italic font-medium">No se encontró ninguna mesa reservada que coincida con "{searchReserva}".</p>
              )}
            </div>
          </div>
        )}

        {/* Contenedor del Grid por Filas (Máximo 4 mesas por fila) */}
        <div className="flex-1 bg-white p-6 md:p-12 relative overflow-y-auto space-y-10">
          {rowNumbers.map(rowNum => {
            const rowTables = allMesas.filter((m: any) => (m.fila || 1) === rowNum);
            const canAddMore = rowTables.length < 4;

            return (
              <div key={rowNum} className="w-full bg-gray-50/60 rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm transition-all">
                {/* Cabecera de Fila */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200/80">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#ff5722] text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      Fila {rowNum}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {rowTables.length} de 4 mesas máximas
                    </span>
                  </div>

                  {canAddMore ? (
                    <Button
                      size="sm"
                      radius="full"
                      onPress={() => {
                        const nextNum = (selectedZonaData?.mesas?.length || 0) + 1;
                        setNewTableNumero(`M${nextNum}`);
                        setSelectedFilaForCreate(rowNum);
                        onOpenCreate();
                      }}
                      className="bg-emerald-600 text-white font-bold text-xs px-4 shadow-sm hover:bg-emerald-700"
                      startContent={<Plus size={14} />}
                    >
                      + Agregar Mesa en Fila {rowNum}
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1.5">
                      <span>🔒</span> Límite de 4 mesas alcanzado en esta fila
                    </span>
                  )}
                </div>

                {/* Mesas dentro de la Fila */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 md:gap-12 min-h-[140px] px-2">
                  {rowTables.map((mesa: any) => (
                    <TableShape 
                      key={mesa.id} 
                      mesa={mesa} 
                      isSelected={selectedTable?.id === mesa.id}
                      onClick={() => setSelectedTable(mesa)}
                    />
                  ))}
                  
                  {/* Botón rápido "Slot Vacío" si hay espacio en la fila */}
                  {canAddMore && (
                    <div
                      onClick={() => {
                        const nextNum = (selectedZonaData?.mesas?.length || 0) + 1;
                        setNewTableNumero(`M${nextNum}`);
                        setSelectedFilaForCreate(rowNum);
                        onOpenCreate();
                      }}
                      className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group p-2 text-center ml-2 shadow-sm"
                    >
                      <Plus size={24} className="text-gray-400 group-hover:text-emerald-600 mb-1 transition-transform group-hover:scale-110" />
                      <span className="text-[11px] font-bold text-gray-500 group-hover:text-emerald-700">
                        + Agregar Mesa
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {allMesas.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-400 py-32">
              <LayoutGrid size={64} className="opacity-20 mb-4" />
              <p className="text-lg font-medium">No hay filas ni mesas en esta zona.</p>
              <Button
                onPress={() => {
                  setNewTableNumero('M1');
                  setSelectedFilaForCreate(1);
                  onOpenCreate();
                }}
                className="mt-4 bg-[#ff5722] text-white font-bold px-6"
                radius="full"
              >
                Crear Primera Mesa
              </Button>
            </div>
          )}
        </div>

        {/* Barra Inferior Flotante de Acción */}
        <div className="p-6 md:px-10 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-600">
            {selectedTable ? (
              <span>Mesa seleccionada: <strong className="text-[#ff5722] text-base">Mesa {selectedTable.numero}</strong> (Fila {selectedTable.fila || 1} - {selectedTable.capacidad} personas - <span className="uppercase font-bold">{selectedTable.estado}</span>)</span>
            ) : (
              <span>Haz clic en cualquier mesa del mapa para gestionarla</span>
            )}
          </div>

          <Button 
            size="lg" 
            radius="lg"
            onPress={handleOpenModal}
            className={`font-bold px-8 h-14 transition-colors ${
              selectedTable 
                ? 'bg-[#ff5722] text-white shadow-lg shadow-[#ff5722]/30 hover:bg-[#e64a19]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            isDisabled={!selectedTable}
          >
            {selectedTable ? `Gestionar Mesa ${selectedTable.numero}` : 'Selecciona una mesa'}
          </Button>
        </div>

      </div>

      {/* Modal de Gestión de Mesa (Cambiar estado, fila, capacidad o eliminar) */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
        <ModalContent className="rounded-3xl p-3 bg-white shadow-2xl">
          {selectedTable && (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-black text-gray-800">
                Gestión de Mesa {selectedTable.numero}
                <span className="text-xs font-normal text-gray-500">
                  Zona: {selectedZonaData?.nombre} | Fila Actual: {selectedTable.fila || 1}
                </span>
              </ModalHeader>
              
              <ModalBody className="py-3 space-y-4">
                {/* Selector de Estado */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                  <p className="text-xs font-black text-gray-700 uppercase mb-3 tracking-wide">Estado de la mesa:</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewEstado('libre')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors font-bold text-xs ${
                        newEstado === 'libre' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle2 size={20} className="mb-1 text-emerald-500" />
                      LIBRE
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewEstado('ocupada')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors font-bold text-xs ${
                        newEstado === 'ocupada' 
                          ? 'border-slate-500 bg-slate-100 text-slate-800 shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Users size={20} className="mb-1 text-slate-600" />
                      OCUPADA
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewEstado('reservada')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors font-bold text-xs ${
                        newEstado === 'reservada' 
                          ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Clock size={20} className="mb-1 text-amber-500" />
                      RESERVADA
                    </button>
                  </div>
                </div>

                {/* Formulario de Datos si el estado es Reservada */}
                {newEstado === 'reservada' && (
                  <div className="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-300 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                      <Clock size={18} className="text-amber-600" />
                      <span>Datos de la Reserva (WhatsApp / Recepción)</span>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-amber-900 mb-1">Nombre y Apellido del Cliente</label>
                        <input
                          type="text"
                          placeholder="Ej: Carlos Mendoza"
                          value={reservaNombre}
                          onChange={(e) => setReservaNombre(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-gray-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-amber-900 mb-1">Celular / WhatsApp</label>
                          <input
                            type="text"
                            placeholder="Ej: 77123456"
                            value={reservaTelefono}
                            onChange={(e) => setReservaTelefono(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-gray-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black uppercase text-amber-900 mb-1">Hora y Detalle</label>
                          <input
                            type="text"
                            placeholder="Ej: 20:30 hs - Cumple"
                            value={reservaHora}
                            onChange={(e) => setReservaHora(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-gray-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edición de Fila y Capacidad */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4 shadow-inner">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 tracking-wide">Mover a Fila</label>
                    <select
                      value={newFila}
                      onChange={(e) => setNewFila(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-sm focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all cursor-pointer"
                    >
                      {Array.from({ length: Math.max(...rowNumbers, newFila) + 1 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Fila {num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 tracking-wide">Capacidad</label>
                    <select
                      value={newCapacidad}
                      onChange={(e) => setNewCapacidad(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-sm focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all cursor-pointer"
                    >
                      <option value="2">2 personas</option>
                      <option value="4">4 personas</option>
                      <option value="6">6 personas</option>
                      <option value="8">8 personas</option>
                      <option value="10">10 personas</option>
                      <option value="12">12 personas</option>
                    </select>
                  </div>
                </div>

              </ModalBody>

              <ModalFooter className="flex justify-between items-center">
                <Button 
                  color="danger" 
                  variant="flat" 
                  onPress={handleDeleteTable}
                  isLoading={isDeleting}
                  className="font-bold text-xs"
                  startContent={<Trash2 size={16} />}
                >
                  Eliminar
                </Button>
                <div className="flex gap-2">
                  <Button variant="flat" color="default" onPress={onClose} className="font-bold">
                    Cancelar
                  </Button>
                  <Button 
                    style={{ backgroundColor: '#ff5722', color: '#fff' }}
                    onPress={handleSaveStatus} 
                    isLoading={isUpdating}
                    className="font-bold shadow-md shadow-[#ff5722]/30"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal CRUD: Crear Nueva Mesa */}
      <Modal isOpen={isOpenCreate} onClose={onCloseCreate} size="sm" backdrop="blur">
        <ModalContent className="rounded-3xl p-3 bg-white shadow-2xl">
          <ModalHeader className="flex flex-col gap-1 text-xl font-black text-gray-800">
            + Agregar Mesa en Fila {selectedFilaForCreate}
            <span className="text-xs font-normal text-gray-500">
              Zona: {selectedZonaData?.nombre} | Límite: 4 mesas/fila
            </span>
          </ModalHeader>

          <ModalBody className="py-3">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4 shadow-inner">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 tracking-wide">
                  Número o Nombre de la Mesa
                </label>
                <input 
                  type="text"
                  placeholder="Ej: M5, VIP 1"
                  value={newTableNumero}
                  onChange={(e) => setNewTableNumero(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-sm focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5 tracking-wide">
                  Capacidad (Personas)
                </label>
                <select
                  value={newTableCapacidad}
                  onChange={(e) => setNewTableCapacidad(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 shadow-sm focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 transition-all cursor-pointer"
                >
                  <option value="2">2 personas</option>
                  <option value="4">4 personas</option>
                  <option value="6">6 personas</option>
                  <option value="8">8 personas</option>
                  <option value="10">10 personas</option>
                  <option value="12">12 personas</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center px-2 pt-1">
              Esta mesa se creará con estado <strong className="text-emerald-600">LIBRE</strong> en la Fila {selectedFilaForCreate}.
            </div>
          </ModalBody>

          <ModalFooter className="pt-2">
            <Button variant="flat" color="default" onPress={onCloseCreate} className="font-bold">
              Cancelar
            </Button>
            <Button 
              style={{ backgroundColor: '#10b981', color: '#fff' }}
              onPress={handleCreateTable} 
              isLoading={isCreating}
              className="font-bold shadow-md shadow-emerald-500/30 px-6"
            >
              Crear en Fila {selectedFilaForCreate}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
};
