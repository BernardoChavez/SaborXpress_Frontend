import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@nextui-org/react';
import { LayoutGrid, CloudSun, CheckCircle2, MapPin } from 'lucide-react';
import api from '../../../api/axios';

export interface SelectedMesaInfo {
  id: number;
  numero: string;
  zona: string;
  capacidad: number;
}

interface MesaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMesa: (mesa: SelectedMesaInfo) => void;
  selectedMesaId?: number | null;
}

// Componente para dibujar la mesa con sus sillas
const TableShapeSelect = ({ mesa, isSelected, onSelect }: { mesa: any, isSelected: boolean, onSelect: () => void }) => {
  const capacidad = parseInt(mesa.capacidad || '4');
  const estado = (mesa.estado || 'libre').toLowerCase();
  const isLibre = estado === 'libre';
  
  let tableBg = '#e2e8f0'; // libre
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
    tableBg = '#f59e0b'; // Ámbar
    chairBg = '#fbbf24';
    textColor = '#ffffff';
    estadoText = 'Reservada';
  }

  const renderChairs = (side: 'left' | 'right') => {
    const chairCount = Math.ceil(capacidad / 2);
    return Array.from({ length: chairCount }).map((_, i) => (
      <div 
        key={`${side}-${i}`} 
        className="w-2.5 h-7 rounded-full my-1 transition-colors duration-200 shadow-sm" 
        style={{ backgroundColor: chairBg }}
      />
    ));
  };

  return (
    <div 
      onClick={() => {
        if (isLibre || isSelected) {
          onSelect();
        }
      }}
      className={`flex flex-col items-center justify-center p-3 transition-transform ${
        isLibre || isSelected ? 'cursor-pointer hover:scale-105 group' : 'cursor-not-allowed opacity-75'
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="flex flex-col mr-1.5">{renderChairs('left')}</div>
        
        <div 
          className="w-20 flex flex-col items-center justify-center rounded-2xl shadow-md transition-all duration-200 relative border border-black/5" 
          style={{ 
            height: `${Math.max(capacidad * 14, 65)}px`,
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
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1 shadow-inner"
            style={{ 
              backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
              color: isSelected ? '#ffffff' : textColor 
            }}
          >
            {estadoText}
          </span>
        </div>

        <div className="flex flex-col ml-1.5">{renderChairs('right')}</div>
      </div>
      <span className="text-xs text-gray-400 font-medium mt-2">
        {capacidad} pers. {!isLibre && !isSelected && '🔒'}
      </span>
    </div>
  );
};

export const MesaSelectorModal: React.FC<MesaSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectMesa,
  selectedMesaId
}) => {
  const [zonas, setZonas] = useState<any[]>([]);
  const [selectedZona, setSelectedZona] = useState<number | null>(null);
  const [tempSelectedTable, setTempSelectedTable] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchZonas();
    }
  }, [isOpen]);

  const fetchZonas = () => {
    setIsLoading(true);
    api.get('/zonas')
      .then(res => {
        const filtered = res.data.filter((z: any) => 
          z.nombre.toLowerCase().includes('terraza') || z.nombre.toLowerCase().includes('salón') || z.nombre.toLowerCase().includes('salon') || true
        );
        setZonas(filtered);
        if (filtered.length > 0 && !selectedZona) {
          setSelectedZona(filtered[0].id);
        }
        
        // Si hay una mesa ya seleccionada, buscarla y ponerla como temporal
        if (selectedMesaId) {
          for (const z of filtered) {
            const found = (z.mesas || []).find((m: any) => m.id === selectedMesaId);
            if (found) {
              setTempSelectedTable(found);
              setSelectedZona(z.id);
              break;
            }
          }
        } else {
          setTempSelectedTable(null);
        }
      })
      .catch(err => console.error("Error cargando mapa de mesas:", err))
      .finally(() => setIsLoading(false));
  };

  const getZoneIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('terraza') || n.includes('outdoor')) return <CloudSun size={18} />;
    return <LayoutGrid size={18} />;
  };

  const selectedZonaData = zonas.find(z => z.id === selectedZona);
  const allMesas = [...(selectedZonaData?.mesas || [])].sort((a: any, b: any) => (a.fila || 1) - (b.fila || 1) || a.id - b.id);
  const rowNumbers = Array.from(new Set(allMesas.map((m: any) => m.fila || 1))).sort((a: number, b: number) => a - b);
  if (rowNumbers.length === 0) rowNumbers.push(1);

  const handleConfirm = () => {
    if (tempSelectedTable && selectedZonaData) {
      onSelectMesa({
        id: tempSelectedTable.id,
        numero: tempSelectedTable.numero,
        zona: selectedZonaData.nombre,
        capacidad: parseInt(tempSelectedTable.capacidad || '4')
      });
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl" 
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        wrapper: "z-[999999]",
        backdrop: "z-[999998] bg-black/60 backdrop-blur-md",
        base: "bg-white text-gray-900 shadow-2xl border border-gray-200 z-[999999]"
      }}
    >
      <ModalContent className="rounded-[2.5rem] bg-white text-gray-900 shadow-2xl overflow-hidden">
        <ModalHeader className="flex flex-col gap-1 p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-xl font-black text-gray-900">
            <MapPin className="text-[#ff5722]" size={24} />
            Selecciona una Mesa Libre para el Consumo
          </div>
          <p className="text-xs font-normal text-gray-500">
            Haz clic en una mesa en color claro (Libre) para asignarla al pedido en curso.
          </p>
        </ModalHeader>

        <ModalBody className="p-6 bg-slate-100">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="lg" color="primary" label="Cargando disponibilidad del salón..." />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pestañas de Zonas */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {zonas.map(zona => {
                  const isActive = selectedZona === zona.id;
                  return (
                    <Button 
                      key={zona.id} 
                      radius="full"
                      size="md"
                      className={`font-bold px-5 h-10 transition-all ${
                        isActive 
                          ? 'bg-[#ff5722] text-white shadow-md shadow-[#ff5722]/30' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onPress={() => setSelectedZona(zona.id)}
                      startContent={getZoneIcon(zona.nombre)}
                    >
                      {zona.nombre}
                    </Button>
                  );
                })}
              </div>

              {/* Leyenda rápida */}
              <div className="flex flex-wrap items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-gray-200/60 text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e2e8f0]"></span> Libre (Disponible)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ff5722]"></span> Seleccionada</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Reservada (No disponible)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#64748b]"></span> Ocupada (No disponible)</span>
              </div>

              {/* Contenedor del Grid por Filas */}
              <div className="space-y-6">
                {rowNumbers.map(rowNum => {
                  const rowTables = allMesas.filter((m: any) => (m.fila || 1) === rowNum);
                  
                  return (
                    <div key={rowNum} className="w-full bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                        <span className="bg-gray-800 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                          Fila {rowNum}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {rowTables.filter((m: any) => (m.estado || '').toLowerCase() === 'libre').length} mesas libres en esta fila
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 min-h-[120px]">
                        {rowTables.map((mesa: any) => (
                          <TableShapeSelect
                            key={mesa.id}
                            mesa={mesa}
                            isSelected={tempSelectedTable?.id === mesa.id}
                            onSelect={() => setTempSelectedTable(mesa)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <div>
            {tempSelectedTable ? (
              <div className="flex items-center gap-2 text-sm font-bold text-gray-800 bg-orange-50 px-3.5 py-2 rounded-xl border border-orange-200">
                <CheckCircle2 className="text-[#ff5722]" size={18} />
                <span>
                  Seleccionada: <strong className="text-[#ff5722]">{tempSelectedTable.numero}</strong> ({tempSelectedTable.capacidad} pers.) - {selectedZonaData?.nombre}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400 font-medium">Ninguna mesa seleccionada aún</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="flat" color="default" onPress={onClose} className="font-bold">
              Cancelar
            </Button>
            <Button 
              color="primary" 
              onPress={handleConfirm} 
              isDisabled={!tempSelectedTable}
              className="bg-[#ff5722] font-bold text-white shadow-md shadow-[#ff5722]/30"
            >
              Confirmar Mesa
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
