import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, QrCode, Banknote, Power } from 'lucide-react';
import { cajaService } from '../services/cajaService';

interface Props {
    isOpen: boolean;
    onSuccess: () => void;
}

const AperturaCajaModal = ({ isOpen, onSuccess }: Props) => {
    const [montoEfectivo, setMontoEfectivo] = useState('0');
    const [montoQR, setMontoQR] = useState('0');
    const [loading, setLoading] = useState(false);

    const handleAbrir = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // El backend ahora acepta ambos montos
            const res = await fetch(`${import.meta.env.VITE_API_URL}/caja/abrir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    monto_apertura: Number(montoEfectivo),
                    monto_apertura_qr: Number(montoQR)
                })
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess();
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Error al abrir caja');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="bg-gray-900 p-8 text-white text-center space-y-2">
                    <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                        <Power size={32} />
                    </div>
                    <h2 className="text-2xl font-black italic">Apertura de Turno</h2>
                    <p className="text-gray-400 text-sm">Registra el saldo inicial de hoy</p>
                </div>

                <form onSubmit={handleAbrir} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Banknote size={14} className="text-green-500" />
                                Efectivo Inicial (Base)
                            </label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                value={montoEfectivo}
                                onChange={e => setMontoEfectivo(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:border-orange-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <QrCode size={14} className="text-purple-500" />
                                Saldo Inicial QR (Banco)
                            </label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                value={montoQR}
                                onChange={e => setMontoQR(e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black focus:border-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-3xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? 'ABRIENDO...' : 'ABRIR CAJA Y EMPEZAR'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AperturaCajaModal;
