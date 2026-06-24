import { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet, TrendingUp, Package, ArrowLeft, FileText, Mic, MicOff, BarChart2, MessageSquare, TableProperties, Database, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axios';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'];

const ReportesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'estatico' | 'dinamico' | 'voz'>('estatico');
  
  // -- Estático --
  const [downloading, setDownloading] = useState<{ type: 'ventas' | 'inventario'; format: 'csv' | 'pdf' } | null>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // -- Dinámico --
  const [dinamicoData, setDinamicoData] = useState<any>(null);
  const [loadingDinamico, setLoadingDinamico] = useState(false);

  // -- Voz --
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResultData, setVoiceResultData] = useState<any[]>([]);
  const [voiceResultType, setVoiceResultType] = useState<string>(''); // 'productos', 'ventas', 'inventario', 'usuarios'
  const [voiceLoading, setVoiceLoading] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Inicializar SpeechRecognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
        handleVoiceCommand(result.toLowerCase());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Cargar datos dinámicos al cambiar a la pestaña
  useEffect(() => {
    if (activeTab === 'dinamico' && !dinamicoData) {
      fetchDinamicoData();
    }
  }, [activeTab]);

  const fetchDinamicoData = async () => {
    setLoadingDinamico(true);
    try {
      const { data } = await axiosInstance.get('/reportes/dinamico');
      setDinamicoData(data);
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
    } finally {
      setLoadingDinamico(false);
    }
  };

  const downloadReport = async (type: 'ventas' | 'inventario', format: 'csv' | 'pdf') => {
    setDownloading({ type, format });
    try {
      let url = `/reportes/${type}`;
      if (format === 'pdf') url += '/pdf';
      
      if (type === 'ventas') {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        const queryString = params.toString();
        if (queryString) {
          url += `${format === 'pdf' ? '?' : '&'}${queryString}`;
        }
      }

      const response = await axiosInstance.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      const filename = type === 'ventas' ? `reporte_ventas_${fechaInicio || 'inicio'}_a_${fechaFin || dateStr}.${ext}` : `reporte_inventario_${dateStr}.${ext}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Error downloading ${type} ${format} report:`, error);
    } finally {
      setDownloading(null);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    setVoiceLoading(true);
    setVoiceResultData([]);
    let type = '';
    let url = '';

    if (command.includes('producto') || command.includes('catálogo')) {
      type = 'Productos';
      url = '/productos';
    } else if (command.includes('venta') || command.includes('vendido')) {
      type = 'Ventas';
      url = '/ventas';
    } else if (command.includes('inventario') || command.includes('stock')) {
      type = 'Inventario';
      url = '/inventario/bruto'; // Por simplicidad traemos materia prima
    } else if (command.includes('usuario') || command.includes('personal')) {
      type = 'Usuarios';
      url = '/usuarios';
    }

    if (type && url) {
      try {
        const { data } = await axiosInstance.get(url);
        // data.data suele ser la estructura paginada, o data directamente
        const items = data.data || data;
        setVoiceResultData(Array.isArray(items) ? items : [items]);
        setVoiceResultType(type);
        speak(`Aquí tienes la información de ${type}`);
      } catch (error) {
        console.error('Voice fetch error', error);
        speak(`Hubo un error al consultar la información de ${type}`);
      }
    } else {
      speak('No entendí el comando. Intenta decir mostrar productos o ventas.');
    }
    setVoiceLoading(false);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Exportar tabla generada por voz
  const exportVoiceCSV = () => {
    if (!voiceResultData.length) return;
    const keys = Object.keys(voiceResultData[0]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + keys.join(";") + "\n"
      + voiceResultData.map(row => {
          return keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            if (typeof cell === 'object') cell = JSON.stringify(cell);
            return `"${String(cell).replace(/"/g, '""')}"`;
          }).join(";");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consulta_voz_${voiceResultType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportVoicePDF = () => {
    if (!voiceResultData.length) return;
    const doc = new jsPDF();
    const keys = Object.keys(voiceResultData[0]).filter(k => typeof voiceResultData[0][k] !== 'object'); // Filter out nested objects for simple table
    
    doc.text(`Consulta Generada por Voz: ${voiceResultType}`, 14, 15);
    
    const body = voiceResultData.map(row => keys.map(k => {
      let val = row[k];
      if(typeof val === 'boolean') return val ? 'Sí' : 'No';
      return val?.toString() || '';
    }));

    autoTable(doc, {
      head: [keys.map(k => k.toUpperCase())],
      body: body,
      startY: 20,
      styles: { fontSize: 8 }
    });

    doc.save(`consulta_voz_${voiceResultType.toLowerCase()}.pdf`);
  };

  // Exportar Reporte Dinámico
  const exportDinamicoCSV = () => {
    if (!dinamicoData) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Ventas por día
    csvContent += "Ventas por Dia\n";
    csvContent += "Fecha;Total(Bs)\n";
    dinamicoData.ventas_dias.forEach((d: any) => {
      csvContent += `${d.fecha};${d.total}\n`;
    });
    
    csvContent += "\nMetodos de Pago\n";
    csvContent += "Metodo;Cantidad\n";
    dinamicoData.ventas_metodos.forEach((m: any) => {
      csvContent += `${m.nombre};${m.cantidad}\n`;
    });
    
    csvContent += "\nInventario Critico\n";
    csvContent += "Producto;Tipo;Stock Actual;Minimo Requerido\n";
    dinamicoData.inventario_critico.forEach((i: any) => {
      csvContent += `${i.nombre};${i.tipo};${i.stock} ${i.unidad_medida};${i.stock_minimo} ${i.unidad_medida}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_dinamico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportDinamicoPDF = () => {
    if (!dinamicoData) return;
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];
    
    doc.text(`Reporte Dinamico (${dateStr})`, 14, 15);
    
    // Ventas por día
    doc.setFontSize(12);
    doc.text('Ventas por Dia (Ultimos 7 dias)', 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Total (Bs)']],
      body: dinamicoData.ventas_dias.map((d: any) => [d.fecha, d.total]),
      styles: { fontSize: 8 }
    });
    
    // Metodos de pago
    let nextY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Metodos de Pago', 14, nextY);
    autoTable(doc, {
      startY: nextY + 5,
      head: [['Metodo', 'Cantidad de Transacciones']],
      body: dinamicoData.ventas_metodos.map((m: any) => [m.nombre, m.cantidad]),
      styles: { fontSize: 8 }
    });
    
    // Inventario Critico
    nextY = (doc as any).lastAutoTable.finalY + 10;
    if (nextY > 250) {
      doc.addPage();
      nextY = 20;
    }
    doc.text('Inventario Critico', 14, nextY);
    autoTable(doc, {
      startY: nextY + 5,
      head: [['Producto', 'Tipo', 'Stock Actual', 'Minimo Requerido']],
      body: dinamicoData.inventario_critico.map((i: any) => [i.nombre, i.tipo, `${i.stock} ${i.unidad_medida}`, `${i.stock_minimo} ${i.unidad_medida}`]),
      styles: { fontSize: 8 }
    });

    doc.save(`reporte_dinamico_${dateStr}.pdf`);
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* ── Cabecera ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-orange-500 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Volver al Inicio
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Reportes</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Administración</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
            PANEL DE <span className="text-orange-500">REPORTES</span>
          </h1>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 overflow-x-auto shadow-inner">
          <button 
            onClick={() => setActiveTab('estatico')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'estatico' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-gray-200 hover:text-slate-700'}`}
          >
            <FileSpreadsheet size={16} /> Estático
          </button>
          <button 
            onClick={() => setActiveTab('dinamico')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'dinamico' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-gray-200 hover:text-slate-700'}`}
          >
            <BarChart2 size={16} /> Dinámico
          </button>
          <button 
            onClick={() => setActiveTab('voz')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'voz' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-gray-200 hover:text-slate-700'}`}
          >
            <Mic size={16} /> Por Voz
          </button>
        </div>
      </div>

      {/* ── Contenido de Reportes ─────────────────────────────────────────── */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        
        {/* --- TAB ESTÁTICO --- */}
        {activeTab === 'estatico' && (
          <div className="animate-in fade-in duration-500">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Descarga de Comprobantes Gerenciales</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Exportación de datos del sistema POS en formato CSV o PDF</p>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tarjeta Ventas */}
              <div className="group relative overflow-hidden rounded-[32px] p-6 border border-gray-100 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 opacity-[0.02] rounded-bl-[80px] transition-all group-hover:opacity-[0.05]" />
                <div className="relative z-10 space-y-6">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-orange-100 text-orange-600 mb-4 group-hover:scale-110 transition-transform"><TrendingUp size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Movimientos y Ventas</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Consolida la información de transacciones realizadas en el POS.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-wider"><Calendar size={12} className="text-orange-500" /> Filtrar por Fecha</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Desde</label>
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full text-xs font-bold text-slate-800 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/50 focus:outline-none focus:border-orange-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hasta</label>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full text-xs font-bold text-slate-800 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50/50 focus:outline-none focus:border-orange-500 transition-all" />
                      </div>
                    </div>
                    {(fechaInicio || fechaFin) && (
                      <button onClick={() => { setFechaInicio(''); setFechaFin(''); }} className="text-[9px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest block ml-auto mt-1">Limpiar Filtro</button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
                  <button onClick={() => downloadReport('ventas', 'csv')} disabled={downloading !== null} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md disabled:opacity-50"><FileSpreadsheet size={14} /> {downloading?.type === 'ventas' && downloading?.format === 'csv' ? 'Generando...' : 'Descargar Excel'}</button>
                  <button onClick={() => downloadReport('ventas', 'pdf')} disabled={downloading !== null} className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md disabled:opacity-50"><FileText size={14} /> {downloading?.type === 'ventas' && downloading?.format === 'pdf' ? 'Generando...' : 'Descargar PDF'}</button>
                </div>
              </div>

              {/* Tarjeta Inventario */}
              <div className="group relative overflow-hidden rounded-[32px] p-6 border border-gray-100 bg-gradient-to-br from-slate-50 to-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-[0.02] rounded-bl-[80px] transition-all group-hover:opacity-[0.05]" />
                <div className="relative z-10 space-y-6">
                  <div>
                    <div className="p-3 w-fit rounded-2xl bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-110 transition-transform"><Package size={20} /></div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Stock e Inventarios</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Exporta los niveles actuales de stock físico de materias primas y productos procesados.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex flex-col justify-center h-28 text-center text-xs font-bold italic text-slate-400">Todo el inventario consolidado en una única hoja de datos.</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
                  <button onClick={() => downloadReport('inventario', 'csv')} disabled={downloading !== null} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md disabled:opacity-50"><FileSpreadsheet size={14} /> {downloading?.type === 'inventario' && downloading?.format === 'csv' ? 'Generando...' : 'Descargar Excel'}</button>
                  <button onClick={() => downloadReport('inventario', 'pdf')} disabled={downloading !== null} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md disabled:opacity-50"><FileText size={14} /> {downloading?.type === 'inventario' && downloading?.format === 'pdf' ? 'Generando...' : 'Descargar PDF'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB DINÁMICO --- */}
        {activeTab === 'dinamico' && (
          <div className="animate-in fade-in duration-500 p-8">
            {loadingDinamico ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : dinamicoData ? (
              <div className="space-y-8">
                <div className="flex justify-end gap-4">
                  <button onClick={exportDinamicoCSV} className="flex items-center gap-2 py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"><FileSpreadsheet size={14} /> Descargar CSV</button>
                  <button onClick={exportDinamicoPDF} className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"><FileText size={14} /> Descargar PDF</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Gráfico de Ventas */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic mb-6">Ventas (Últimos 7 días)</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dinamicoData.ventas_dias}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="fecha" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(val) => `Bs${val}`} />
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Gráfico Métodos de Pago */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic mb-6">Métodos de Pago</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dinamicoData.ventas_metodos} dataKey="cantidad" nameKey="nombre" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                            {dinamicoData.ventas_metodos.map((_entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Inventario Crítico */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-500 italic mb-4">Alertas de Inventario (Stock Crítico)</h3>
                  {dinamicoData.inventario_critico.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No hay productos en stock crítico.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-red-50">
                            <th className="p-3 text-[10px] font-black uppercase tracking-wider text-red-600 rounded-tl-xl">Producto</th>
                            <th className="p-3 text-[10px] font-black uppercase tracking-wider text-red-600">Tipo</th>
                            <th className="p-3 text-[10px] font-black uppercase tracking-wider text-red-600">Stock Actual</th>
                            <th className="p-3 text-[10px] font-black uppercase tracking-wider text-red-600 rounded-tr-xl">Mínimo Requerido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dinamicoData.inventario_critico.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="p-3 text-sm font-bold text-slate-800">{item.nombre}</td>
                              <td className="p-3 text-xs font-semibold text-slate-500">{item.tipo}</td>
                              <td className="p-3 text-sm font-black text-red-500">{item.stock} {item.unidad_medida}</td>
                              <td className="p-3 text-sm font-semibold text-slate-400">{item.stock_minimo} {item.unidad_medida}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">Error al cargar datos.</div>
            )}
          </div>
        )}

        {/* --- TAB POR VOZ --- */}
        {activeTab === 'voz' && (
          <div className="animate-in fade-in duration-500 p-8 max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex p-4 rounded-full bg-orange-100 text-orange-500 shadow-inner">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Asistente de Consultas</h2>
              <p className="text-slate-500 text-sm max-w-lg mx-auto">
                Presiona el micrófono y pide por voz lo que necesitas ver. Por ejemplo: <br/>
                <span className="font-bold text-orange-500">"Muéstrame todos los productos"</span> o <span className="font-bold text-orange-500">"Quiero ver las ventas"</span>.
              </p>
              
              <button
                onClick={toggleListen}
                className={`relative group p-6 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse' 
                    : 'bg-slate-900 hover:bg-slate-800 shadow-xl hover:shadow-2xl'
                }`}
              >
                {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                {isListening && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-red-500 uppercase tracking-widest">Escuchando...</span>
                )}
              </button>
            </div>

            {transcript && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center mb-8">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block mb-1">Has dicho:</span>
                <span className="text-lg text-slate-800 font-medium italic">"{transcript}"</span>
              </div>
            )}

            {voiceLoading && (
              <div className="text-center text-orange-500 font-bold animate-pulse">Procesando consulta...</div>
            )}

            {voiceResultData.length > 0 && (
              <div className="animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <h3 className="text-lg font-black uppercase tracking-widest text-slate-800">Resultados: {voiceResultType}</h3>
                  <div className="flex gap-2">
                    <button onClick={exportVoiceCSV} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2">
                      <FileSpreadsheet size={14} /> CSV
                    </button>
                    <button onClick={exportVoicePDF} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2">
                      <FileText size={14} /> PDF
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 sticky top-0 shadow-sm">
                      <tr>
                        {Object.keys(voiceResultData[0]).filter(k => typeof voiceResultData[0][k] !== 'object').map((key) => (
                          <th key={key} className="p-3 font-black uppercase tracking-wider text-slate-500">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {voiceResultData.map((row, i) => (
                        <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                          {Object.keys(row).filter(k => typeof row[k] !== 'object').map((key) => {
                            const val = row[key];
                            return (
                              <td key={key} className="p-3 text-slate-700 font-medium max-w-[200px] truncate" title={val?.toString()}>
                                {typeof val === 'boolean' ? (val ? 'Sí' : 'No') : val?.toString()}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportesPage;

