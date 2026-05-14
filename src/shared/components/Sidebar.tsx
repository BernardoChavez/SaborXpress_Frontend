import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Menu,
  X,
  Building2,
  ShieldAlert,
  Package,
  Store,
  ChefHat,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../../core/store/useAuthStore';
import type { TipoUsuario } from '../../core/types/auth.types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  permission?: string; // Código de la matriz (ej: 'CU17:ver')
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',   to: '/',                icon: <LayoutDashboard size={20} /> },
  { label: 'Venta (POS)', to: '/pos',             icon: <Store size={20} />,           permission: 'CU17:ver' },
  { label: 'Caja',        to: '/caja',            icon: <Wallet size={20} />,          permission: 'CU16:ver' },
  { label: 'Cocina',      to: '/cocina',          icon: <ChefHat size={20} />,         permission: 'CU20:ver' },
  { label: 'Catálogo',    to: '/admin/catalogo',   icon: <UtensilsCrossed size={20} />, permission: 'CU8:ver' },
  { label: 'Usuarios',    to: '/admin/usuarios',   icon: <Users size={20} />,           permission: 'CU5:ver' },
  { label: 'Bitácora',    to: '/admin/bitacora',   icon: <ScrollText size={20} />,      permission: 'CU7:ver' },
  { label: 'Empresa',     to: '/admin/empresa',    icon: <Building2 size={20} />,       adminOnly: true },
  { label: 'Inventario',  to: '/admin/inventario', icon: <Package size={20} />,         permission: 'CU30:ver' },
  { label: 'Roles',       to: '/admin/roles',      icon: <ShieldAlert size={20} />,     permission: 'CU6:ver' },
];

interface SidebarProps {
  tipoUsuario: TipoUsuario | null;
}

const EXPANDED_W = 240;
const COLLAPSED_W = 68;

const Sidebar = ({ tipoUsuario }: SidebarProps) => {
  const { permisos } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Filtrar items según permisos y rol admin
  const visibleItems = navItems.filter((item) => {
    // 1. Si eres Admin, ves todo
    if (tipoUsuario === 'Admin') return true;

    // 2. Si el item es solo para Admin y no eres Admin, ocultar
    if (item.adminOnly && tipoUsuario !== 'Admin') return false;

    // 3. Si el item requiere un permiso específico de la matriz
    if (item.permission) {
      return permisos.includes(item.permission);
    }

    // 4. Si no tiene restricciones, mostrar (ej: Dashboard)
    return true;
  });

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <UtensilsCrossed size={16} className="text-white" />
        </div>
        <AnimatePresence initial={false}>
          {(isMobile || !collapsed) && (
            <motion.span
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="text-base font-bold tracking-tight whitespace-nowrap"
            >
              SaborXpress
            </motion.span>
          )}
        </AnimatePresence>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors duration-150 group',
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white',
              ].join(' ')
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <AnimatePresence initial={false}>
              {(isMobile || !collapsed) && (
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {!isMobile && (
        <div className="border-t border-white/10 px-4 py-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full"
          >
            <span className="shrink-0">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  key="collapse-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  Colapsar
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-lg hover:bg-[#1e293b]"
      >
        <Menu size={20} />
      </button>

      <motion.aside
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative hidden md:flex flex-col h-full bg-[#0f172a] text-white shrink-0 overflow-hidden"
      >
        {sidebarContent(false)}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] md:hidden flex flex-col bg-[#0f172a] text-white shadow-2xl"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
