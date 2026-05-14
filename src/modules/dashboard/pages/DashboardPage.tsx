import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Tag, ScrollText,
  TrendingUp, ShieldCheck, UtensilsCrossed, CreditCard,
  ArrowRight, Clock, Activity, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../../../core/store/useAuthStore';
import axiosInstance from '../../../api/axios';
import type { BitacoraEntry } from '../../bitacora/types/bitacora.types';

// ── Tipos locales ─────────────────────────────────────────────────────────────
interface Stats {
  usuarios: number;
  categorias: number;
  productos: number;
  bitacora: number;
}

interface UsuarioResumen {
  tipo_usuario: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

const timeAgo = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
};

const parseBitacoraDate = (entry: BitacoraEntry): Date | null => {
  if (!entry.fecha || !entry.hora_inicio) return null;
  const d = new Date(`${entry.fecha}T${entry.hora_inicio}`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const activityTimeLabel = (entry: BitacoraEntry): string => {
  const d = parseBitacoraDate(entry);
  if (d) return timeAgo(d);
  if (entry.fecha && entry.hora_inicio) return `${entry.fecha} · ${entry.hora_inicio}`;
  return '—';
};

const getResponsibleName = (entry: BitacoraEntry) =>
  entry.usuario?.persona?.nombre?.trim() || `Usuario #${entry.id_usuario}`;

// ── Componente principal ──────────────────────────────────────────────────────
const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const tipoUsuario = useAuthStore((s) => s.tipo_usuario);
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({ usuarios: 0, categorias: 0, productos: 0, bitacora: 0 });
  const [recentActivity, setRecentActivity] = useState<BitacoraEntry[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (tipoUsuario === 'Admin') {
          const [usersRes, catsRes, prodsRes, bitRes] = await Promise.allSettled([
            axiosInstance.get('/usuarios'),
            axiosInstance.get('/categorias'),
            axiosInstance.get('/productos'),
            axiosInstance.get('/bitacora'),
          ]);

          const users = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
          const cats = catsRes.status === 'fulfilled' ? catsRes.value.data : [];
          const prods = prodsRes.status === 'fulfilled' ? prodsRes.value.data : [];
          const bits = bitRes.status === 'fulfilled' ? bitRes.value.data : [];

          setStats({
            usuarios: users.length,
            categorias: cats.length,
            productos: prods.length,
            bitacora: bits.length,
          });

          // Últimas 6 actividades (Directo)
          setRecentActivity(bits.slice(0, 6));

          const counts: Record<string, number> = {};
          users.forEach((u: UsuarioResumen) => {
            counts[u.tipo_usuario] = (counts[u.tipo_usuario] || 0) + 1;
          });
          setRoleCounts(counts);
        } else {
          const [catsRes, prodsRes] = await Promise.allSettled([
            axiosInstance.get('/categorias'),
            axiosInstance.get('/productos'),
          ]);
          const cats = catsRes.status === 'fulfilled' ? catsRes.value.data : [];
          const prods = prodsRes.status === 'fulfilled' ? prodsRes.value.data : [];
          setStats((s) => ({ ...s, categorias: cats.length, productos: prods.length }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [tipoUsuario]);

  const isAdmin = tipoUsuario === 'Admin';

  const summaryCards = [
    ...(isAdmin ? [{
      label: 'Personal Activo', value: stats.usuarios, icon: <Users size={22} />,
      gradient: 'from-slate-800 to-slate-950', link: '/admin/usuarios',
    }] : []),
    {
      label: 'Variedad de Catálogo', value: stats.categorias, icon: <Tag size={22} />,
      gradient: 'from-orange-500 to-orange-600', link: isAdmin ? '/admin/catalogo' : undefined,
    },
    {
      label: 'Platos & Bebidas', value: stats.productos, icon: <ShoppingBag size={22} />,
      gradient: 'from-emerald-500 to-emerald-600', link: isAdmin ? '/admin/catalogo' : undefined,
    },
    ...(isAdmin ? [{
      label: 'Acciones Auditadas', value: stats.bitacora, icon: <ShieldCheck size={22} />,
      gradient: 'from-blue-600 to-blue-800', link: '/admin/bitacora',
    }] : []),
  ];

  const roleConfig: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
    Admin: { icon: <ShieldCheck size={20} />, color: 'text-purple-600 bg-purple-50', desc: 'Gestor' },
    Cajero: { icon: <CreditCard size={20} />, color: 'text-blue-600 bg-blue-50', desc: 'Operativo' },
    Cocinero: { icon: <UtensilsCrossed size={20} />, color: 'text-orange-600 bg-orange-50', desc: 'Producción' },
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── Bienvenida Executive ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-md tracking-wider">Sistema Activo</span>
             <span className="text-gray-300">/</span>
             <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{isAdmin ? 'Modo Administración' : 'Modo Operativo'}</span>
           </div>
           <h1 className="text-3xl sm:text-4xl font-black text-gray-900 italic tracking-tighter">
            {getGreeting().toUpperCase()}, <span className="text-orange-500">{user?.persona?.nombre?.split(' ')[0] ?? 'USUARIO'}</span>
           </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-50">
          <Clock size={14} className="text-orange-500"/>
          {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* ── Tarjetas resumen ───────────────────────────────────────────────── */}
      <div className={`grid gap-5 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            onClick={() => card.link && navigate(card.link)}
            className={`group relative overflow-hidden rounded-[32px] p-6 text-white shadow-xl ${card.link ? 'cursor-pointer' : ''}`}
            style={{ background: 'white', color: '#1e293b', border: '1px solid #f1f5f9' }}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-[0.03] rounded-bl-[80px] transition-all group-hover:opacity-[0.07]`} />
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>{card.icon}</div>
                    {card.link && <ArrowUpRight size={18} className="text-slate-300 group-hover:text-orange-500 transition-colors" />}
                </div>
                <div>
                    <p className="text-4xl font-black italic tracking-tighter text-slate-900">
                        {loading ? '...' : card.value}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-1">{card.label}</p>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid Actividad Directa ─────────────────────────────────────────── */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Actividad RECIENTE (Simplificada / Directa) */}
          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Activity size={18}/></div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Movimientos en Vivo</h2>
              </div>
              <button
                onClick={() => navigate('/admin/bitacora')}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm"
              >
                Auditoría Completa
              </button>
            </div>

            <div className="p-2">
                {loading ? (
                <div className="py-20 text-center text-xs font-bold text-gray-300 uppercase italic tracking-widest animate-pulse">Sincronizando flujo de datos...</div>
                ) : recentActivity.length === 0 ? (
                <div className="py-20 text-center text-sm text-gray-400 italic">No hay actividad reciente para mostrar.</div>
                ) : (
                <div className="space-y-1">
                    {recentActivity.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center gap-4 p-4 rounded-3xl hover:bg-gray-50/80 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                                <Users size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight">
                                    <span className="text-orange-500">{getResponsibleName(entry).split(' ')[0]}</span> {entry.accion_detalle}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {activityTimeLabel(entry)}
                                </p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="px-3 py-1 rounded-full bg-gray-100 text-[9px] font-black text-gray-500 uppercase">Directo</div>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
          </div>

          {/* Desglose por rol */}
          <div className="bg-slate-900 rounded-[40px] shadow-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Estructura</h2>
                    <h3 className="text-2xl font-black italic tracking-tighter">EQUIPO DE TRABAJO</h3>
                </div>
                
                <div className="space-y-4">
                    {Object.entries(roleConfig).map(([role, cfg]) => (
                        <div key={role} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${cfg.color} text-slate-800 shadow-lg group-hover:scale-110 transition-transform`}>{cfg.icon}</div>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tighter">{role}</p>
                                    <p className="text-[10px] font-medium text-slate-500">{cfg.desc}</p>
                                </div>
                            </div>
                            <span className="text-3xl font-black italic text-orange-500 tracking-tighter">
                                {loading ? '—' : (roleCounts[role] ?? 0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardPage;
