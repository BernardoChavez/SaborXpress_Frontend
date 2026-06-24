import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, UploadCloud, Clock, Save, Loader, Settings, ShieldAlert } from 'lucide-react';

const BackupPage = () => {
    // Estado para Backup Manual
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    const [lastBackupDate, setLastBackupDate] = useState('Nunca');

    // Estado para Backup Automático
    const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
    const [backupTime, setBackupTime] = useState('02:00');
    const [savingSettings, setSavingSettings] = useState(false);

    const handleManualBackup = () => {
        setIsBackingUp(true);
        setBackupProgress(0);

        const interval = setInterval(() => {
            setBackupProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsBackingUp(false);
                    setLastBackupDate(new Date().toLocaleString());
                    return 100;
                }
                return prev + 5;
            });
        }, 150);
    };

    const handleSaveAutoBackup = () => {
        setSavingSettings(true);
        setTimeout(() => {
            setSavingSettings(false);
            alert('Configuración de Backup Automático guardada con éxito.');
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestión de Copias de Seguridad</h1>
                    <p className="text-gray-500 font-medium">Administra y resguarda la base de datos del sistema SaborXpress.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* ── PANEL DE BACKUP MANUAL ──────────────────────────────────────── */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-blue-50">
                        <Download size={120} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                <Database size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Backup Manual</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Generar copia ahora</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-8 max-w-sm">
                            Descarga una copia completa de la base de datos en este instante. Recomendado antes de realizar actualizaciones importantes.
                        </p>

                        <div className="bg-gray-50 rounded-3xl p-5 mb-8 border border-gray-100">
                            <p className="text-xs font-black text-gray-400 uppercase mb-1">Última copia generada</p>
                            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={18} className="text-blue-500" /> {lastBackupDate}
                            </p>
                        </div>

                        <div className="mt-auto">
                            {isBackingUp ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-black text-blue-600 uppercase">
                                        <span>Generando...</span>
                                        <span>{backupProgress}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-blue-50 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-blue-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${backupProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleManualBackup}
                                    className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                                >
                                    <Download size={18} /> DESCARGAR BACKUP
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── PANEL DE BACKUP AUTOMÁTICO ──────────────────────────────────── */}
                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-orange-50">
                        <UploadCloud size={120} strokeWidth={1} />
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Backup Automático</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sincronización en la nube</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-8 max-w-sm">
                            Configura el sistema para que realice copias de seguridad de forma desatendida y las suba a un servidor seguro.
                        </p>

                        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900">Habilitar Sincronización</h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Guarda copias en la nube</p>
                                </div>
                                <button 
                                    onClick={() => setAutoBackupEnabled(!autoBackupEnabled)} 
                                    className={`relative w-14 h-8 rounded-full transition-colors ${autoBackupEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <motion.div 
                                        layout 
                                        className="w-6 h-6 bg-white rounded-full mx-1 shadow-sm"
                                        animate={{ x: autoBackupEnabled ? 24 : 0 }}
                                    />
                                </button>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: autoBackupEnabled ? 1 : 0.4, height: 'auto' }} 
                                className="space-y-4 pt-4 border-t border-gray-200"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
                                        <Clock size={12} /> Hora de ejecución diaria
                                    </label>
                                    <input 
                                        type="time" 
                                        disabled={!autoBackupEnabled}
                                        value={backupTime}
                                        onChange={(e) => setBackupTime(e.target.value)}
                                        className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-orange-500 font-bold text-lg disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                                    />
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl text-blue-800 text-xs font-medium">
                                    <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                                    <p>Las copias se guardarán encriptadas en el servidor S3 de AWS vinculado a SaborXpress.</p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                disabled={savingSettings}
                                onClick={handleSaveAutoBackup}
                                className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                            >
                                {savingSettings ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                GUARDAR CONFIGURACIÓN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupPage;
