import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@nextui-org/react';
import { Plus, PackageSearch, Trash2, Edit2 } from 'lucide-react';
import { marketingApi } from '../../../api/services/marketingService';
import ComboModal from '../components/ComboModal';

export default function CombosPage() {
    const [combos, setCombos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comboToEdit, setComboToEdit] = useState<any>(null);

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const data = await marketingApi.getCombos();
                setCombos(data);
            } catch (error) {
                console.error("Error al cargar combos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCombos();
    }, []);

    const handleSaveCombo = async (comboData: any, id?: number) => {
        try {
            if (id) {
                await marketingApi.updateCombo(id, comboData);
            } else {
                await marketingApi.createCombo(comboData);
            }
            // Recargar la tabla
            const data = await marketingApi.getCombos();
            setCombos(data);
        } catch (error) {
            console.error("Error guardando el combo:", error);
        }
    };

    const handleDeleteCombo = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este combo?')) return;
        try {
            await marketingApi.deleteCombo(id);
            setCombos(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error eliminando combo:", error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            
            {/* Header Premium con Gradiente */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-500/30">
                <div className="text-white mb-4 md:mb-0">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Gestión de Combos</h1>
                    <p className="text-orange-100 font-medium text-lg opacity-90">
                        Arma paquetes atractivos para tus clientes y aumenta tus ventas.
                    </p>
                </div>
                <Button 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-md text-white border-2 border-white/20 font-bold shadow-lg hover:bg-white hover:text-orange-600 transition-all duration-300 rounded-2xl px-8"
                    startContent={<Plus size={22} />}
                    onClick={() => { setComboToEdit(null); setIsModalOpen(true); }}
                >
                    Nuevo Combo
                </Button>
            </div>

            {/* Contenedor de la Tabla */}
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] bg-white/60 backdrop-blur-xl">
                <CardBody className="p-2 md:p-6">
                    <Table 
                        aria-label="Tabla de combos del restaurante"
                        removeWrapper
                        selectionMode="single"
                        className="w-full"
                        classNames={{
                            th: "bg-gray-50/50 text-gray-500 font-bold text-sm py-4",
                            td: "py-4 border-b border-gray-100/50",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>NOMBRE DEL COMBO</TableColumn>
                            <TableColumn>PRECIO DE VENTA</TableColumn>
                            <TableColumn>PRODUCTOS INCLUIDOS</TableColumn>
                            <TableColumn>ESTADO</TableColumn>
                            <TableColumn align="center">ACCIONES</TableColumn>
                        </TableHeader>
                        
                        <TableBody 
                            isLoading={loading}
                            emptyContent={
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <PackageSearch size={64} className="mb-4 opacity-50 text-orange-400" />
                                    <p className="text-xl font-bold text-gray-600">Aún no hay combos registrados</p>
                                    <p className="text-sm mt-1">Crea tu primer combo para deslumbrar a tus clientes.</p>
                                </div>
                            }
                        >
                            {combos.map((combo) => (
                                <TableRow key={combo.id}>
                                    <TableCell className="font-bold text-gray-800">{combo.nombre}</TableCell>
                                    <TableCell>
                                        <Chip color="success" variant="flat" className="font-bold">
                                            Bs. {combo.precio_venta}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {combo.productos?.map((p: any) => (
                                                <Chip key={p.id} size="sm" variant="faded">{p.cantidad}x {p.producto?.nombre}</Chip>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${Number(combo.estado) === 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${Number(combo.estado) === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {Number(combo.estado) === 1 ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={() => { setComboToEdit(combo); setIsModalOpen(true); }} isIconOnly size="sm" variant="light" color="primary"><Edit2 size={16}/></Button>
                                            <Button onClick={() => handleDeleteCombo(combo.id)} isIconOnly size="sm" variant="light" color="danger"><Trash2 size={16}/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <ComboModal 
                isOpen={isModalOpen} 
                comboEdit={comboToEdit}
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSaveCombo} 
            />
        </div>
    );
}
