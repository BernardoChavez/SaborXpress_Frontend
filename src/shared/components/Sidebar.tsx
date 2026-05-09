import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  //ShoppingBag,
 // ClipboardList,
  //Truck,
  Users,
  ScrollText,
 // ShieldCheck,
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
import type { TipoUsuario } from '../../core/types/auth.types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',   to: '/',                icon: <LayoutDashboard size={20} /> },
  { label: 'Venta (POS)', to: '/pos',             icon: <Store size={20} /> },
  { label: 'Caja',        to: '/caja',            icon: <Wallet size={20} /> },
  { label: 'Cocina',      to: '/cocina',          icon: <ChefHat size={20} /> },
  { label: 'Catálogo',    to: '/admin/catalogo',   icon: <UtensilsCrossed size={20} />, adminOnly: true },
  { label: 'Usuarios',    to: '/admin/usuarios',   icon: <Users size={20} />,           adminOnly: true },
  { label: 'Bitácora',    to: '/admin/bitacora',   icon: <ScrollText size={20} />,      adminOnly: true },
  { label: 'Empresa',     to: '/admin/empresa',    icon: <Building2 size={20} />,       adminOnly: true },
  { label: 'Inventario',  to: '/admin/inventario', icon: <Package size={20} />,         adminOnly: true },
  { label: 'Roles',       to: '/admin/roles',      icon: <ShieldAlert size={20} />,     adminOnly: true },
];

interface SidebarProps {
  tipoUsuario: TipoUsuario | null;
}

const EXPANDED_W = 240;
const COLLAPSED_W = 68;

const Sidebar = ({ tipoUsuario }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar en móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || tipoUsuario === 'Admin'
  );

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
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
              transition={{ duration: 0.2 }}
              className="text-base font-bold tracking-tight whitespace-nowrap"
            >
              SaborXpress
            </motion.span>
          )}
        </AnimatePresence>
        {/* Botón cerrar en móvil */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Nav items ─────────────────────────────────────────────────────── */}
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
                  transition={{ duration: 0.18 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* ── Collapse toggle (solo desktop) ─────────────────────────────── */}
      {!isMobile && (
        <div className="border-t border-white/10 px-4 py-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
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
                  transition={{ duration: 0.15 }}
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
      {/* ── Botón hamburguesa (solo móvil) ──────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-lg hover:bg-[#1e293b] transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* ── Sidebar desktop ────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? COLLAPSED_W : EXPANDED_W }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative hidden md:flex flex-col h-full bg-[#0f172a] text-white shrink-0 overflow-hidden"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* ── Sidebar móvil (drawer overlay) ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
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

