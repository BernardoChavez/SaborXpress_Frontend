import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@nextui-org/react';
import { Plus, Percent, Trash2, Edit2 } from 'lucide-react';
import { marketingApi } from '../../../api/services/marketingService';
import PromocionModal from '../components/PromocionModal';

export default function PromocionesPage() {
    const [promociones, setPromociones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promoToEdit, setPromoToEdit] = useState<any>(null);

    useEffect(() => {
        const fetchPromociones = async () => {
            try {
                const data = await marketingApi.getPromociones();
                setPromociones(data);
            } catch (error) {
                console.error("Error al cargar promociones", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromociones();
    }, []);

    const handleSavePromocion = async (promoData: any, id?: number) => {
        try {
            if (id) {
                await marketingApi.updatePromocion(id, promoData);
            } else {
                await marketingApi.createPromocion(promoData);
            }
            // Recargar la tabla
            const data = await marketingApi.getPromociones();
            setPromociones(data);
        } catch (error) {
            console.error("Error guardando promoción:", error);
        }
    };

    const handleDeletePromocion = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta promoción?')) return;
        try {
            await marketingApi.deletePromocion(id);
            setPromociones(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error eliminando promoción:", error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            
            {/* Header Premium con Gradiente Distinto (Morado/Rosa para Marketing) */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 p-8 rounded-[2.5rem] shadow-2xl shadow-purple-500/30">
                <div className="text-white mb-4 md:mb-0">
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Reglas de Promociones</h1>
                    <p className="text-purple-100 font-medium text-lg opacity-90">
                        Configura descuentos, 2x1 y días especiales de forma automática.
                    </p>
                </div>
                <Button 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-md text-white border-2 border-white/20 font-bold shadow-lg hover:bg-white hover:text-purple-600 transition-all duration-300 rounded-2xl px-8"
                    startContent={<Plus size={22} />}
                    onClick={() => { setPromoToEdit(null); setIsModalOpen(true); }}
                >
                    Nueva Promoción
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] bg-white/60 backdrop-blur-xl">
                <CardBody className="p-2 md:p-6">
                    <Table 
                        aria-label="Tabla de promociones"
                        removeWrapper
                        className="w-full"
                        classNames={{
                            th: "bg-gray-50/50 text-gray-500 font-bold text-sm py-4",
                        }}
                    >
                        <TableHeader>
                            <TableColumn>PROMOCIÓN</TableColumn>
                            <TableColumn>TIPO</TableColumn>
                            <TableColumn>VIGENCIA</TableColumn>
                            <TableColumn>APLICA A</TableColumn>
                            <TableColumn>ESTADO</TableColumn>
                            <TableColumn align="center">ACCIONES</TableColumn>
                        </TableHeader>
                        
                        <TableBody 
                            isLoading={loading}
                            emptyContent={
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <Percent size={64} className="mb-4 opacity-50 text-purple-400" />
                                    <p className="text-xl font-bold text-gray-600">Sin promociones activas</p>
                                    <p className="text-sm mt-1">Crea reglas para impulsar las ventas en días bajos.</p>
                                </div>
                            }
                        >
                            {promociones.map((promo) => (
                                <TableRow key={promo.id}>
                                    <TableCell>
                                        <div className="font-bold text-gray-800">{promo.nombre}</div>
                                        <div className="text-xs text-gray-500">{promo.dias_aplicables?.join(', ')}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color="secondary" variant="flat" className="font-bold uppercase text-xs">
                                            {promo.tipo_descuento} {promo.valor_descuento && `(${promo.valor_descuento})`}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">Inicio: {new Date(promo.fecha_inicio).toLocaleDateString()}</div>
                                        <div className="text-sm">Fin: {promo.fecha_fin ? new Date(promo.fecha_fin).toLocaleDateString() : 'Indefinido'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {promo.aplicaciones?.map((ap: any) => (
                                                <Chip key={ap.id} size="sm" variant="bordered">{ap.aplicable?.nombre || ap.aplicable_type.split('\\').pop()}</Chip>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${Number(promo.estado) === 1 ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${Number(promo.estado) === 1 ? 'bg-purple-500' : 'bg-red-500'}`}></span>
                                            {Number(promo.estado) === 1 ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={() => { setPromoToEdit(promo); setIsModalOpen(true); }} isIconOnly size="sm" variant="light" color="primary"><Edit2 size={16}/></Button>
                                            <Button onClick={() => handleDeletePromocion(promo.id)} isIconOnly size="sm" variant="light" color="danger"><Trash2 size={16}/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <PromocionModal 
                isOpen={isModalOpen} 
                promoEdit={promoToEdit}
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSavePromocion} 
            />
        </div>
    );
}
