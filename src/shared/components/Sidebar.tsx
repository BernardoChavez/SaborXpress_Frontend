import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Utensils,
  Menu,
  X,
  Building,
  Shield,
  Package,
  ShoppingBag,
  ChefHat,
  Wallet,
  BarChart3,
  Monitor,
  Settings,
  Receipt,
  Truck,
  Key,
  FileText,
  Database,
  Star,
  Tag,
  Percent,
  Gift
} from 'lucide-react';
import { useAuthStore } from '../../core/store/useAuthStore';
import type { TipoUsuario } from '../../core/types/auth.types';

interface NavSubItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  permission?: string;
  adminOnly?: boolean;
}

interface NavGroupItem {
  type: 'group';
  label: string;
  icon: React.ReactNode;
  items: NavSubItem[];
}

interface NavSingleItem {
  type: 'single';
  label: string;
  to: string;
  icon: React.ReactNode;
}

type MenuItem = NavSingleItem | NavGroupItem;

const adminStructure: MenuItem[] = [
  {
    type: 'single',
    label: 'Dashboard',
    to: '/',
    icon: <LayoutDashboard size={20} />
  },
  {
    type: 'group',
    label: 'P1: Seguridad',
    icon: <Shield size={20} />,
    items: [
      { label: 'Roles y Privilegios', to: '/admin/roles', icon: <Key size={18} />, permission: 'CU06:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P2: Personal',
    icon: <Users size={20} />,
    items: [
      { label: 'Usuarios', to: '/admin/usuarios', icon: <Users size={18} />, permission: 'CU05:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P3: Configuración',
    icon: <Settings size={20} />,
    items: [
      { label: 'Datos Empresa', to: '/admin/empresa', icon: <Building size={18} />, adminOnly: true },
      { label: 'Copias de Seguridad', to: '/admin/backup', icon: <Database size={18} />, adminOnly: true },
      { label: 'Catálogo', to: '/admin/catalogo', icon: <Utensils size={18} />, permission: 'CU08:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P4: Inventarios',
    icon: <Package size={20} />,
    items: [
      { label: 'Inventario General', to: '/admin/inventario', icon: <Package size={18} />, permission: 'CU11:ver' },
      { label: 'Insumos Procesados', to: '/admin/insumos', icon: <Package size={18} />, permission: 'CU12:ver' },
      { label: 'Proveedores', to: '/admin/proveedores', icon: <Truck size={18} />, permission: 'CU10:ver' },
      { label: 'Fichas/Recetas', to: '/admin/recetas', icon: <ScrollText size={18} />, permission: 'CU35:ver' },
      { label: 'Alertas de Inventario', to: '/admin/alertas-inventario', icon: <Package size={18} />, adminOnly: true }
    ]
  },
  {
    type: 'group',
    label: 'P5: Ventas y Caja',
    icon: <Wallet size={20} />,
    items: [
      { label: 'Caja', to: '/caja', icon: <Wallet size={18} />, permission: 'CU15:ver' },
      { label: 'Venta (POS)', to: '/pos', icon: <ShoppingBag size={18} />, permission: 'CU16:ver' },
      { label: 'Caja Chica', to: '/caja-chica', icon: <Wallet size={18} />, permission: 'CU32:ver' },
      { label: 'Servicios de Catering', to: '/admin/catering', icon: <ScrollText size={18} />, adminOnly: true }
    ]
  },
  {
    type: 'group',
    label: 'P6: Producción',
    icon: <ChefHat size={20} />,
    items: [
      { label: 'Comandas', to: '/cocina', icon: <ChefHat size={18} />, permission: 'CU20:ver' },
      { label: 'Pantalla Cliente', to: '/admin/seguimiento', icon: <Monitor size={18} />, permission: 'CU19:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P7: Comprobantes',
    icon: <Receipt size={20} />,
    items: [
      { label: 'Tickets Operativos', to: '/admin/tickets', icon: <Receipt size={18} />, permission: 'CU22:ver' },
      { label: 'Facturas Emitidas', to: '/admin/facturas', icon: <FileText size={18} />, permission: 'CU25:ver' },
      { label: 'Anulaciones', to: '/admin/anulaciones', icon: <X size={18} />, permission: 'CU26:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P8: Compras',
    icon: <Truck size={20} />,
    items: [
      { label: 'Órdenes de Compra', to: '/admin/ordenes', icon: <ScrollText size={18} />, permission: 'CU27:ver' },
      { label: 'Recepción', to: '/admin/recepcion', icon: <Package size={18} />, permission: 'CU28:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P9: Auditoría',
    icon: <BarChart3 size={20} />,
    items: [
      { label: 'Bitácora', to: '/admin/bitacora', icon: <ScrollText size={18} />, permission: 'CU07:ver' },
      { label: 'Reportes y Finanzas', to: '/admin/reportes', icon: <BarChart3 size={18} />, permission: 'CU33:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P10: CRM & Mesas',
    icon: <Star size={20} />,
    items: [
      { label: 'Mapa de Mesas', to: '/admin/mesas', icon: <LayoutDashboard size={18} />, permission: 'CU16:ver' }, // Using CU16 as temporary since CU37 isn't seeded
      { label: 'Reseñas', to: '/admin/resenas', icon: <Star size={18} />, permission: 'CU16:ver' }
    ]
  },
  {
    type: 'group',
    label: 'P10: Combos & Promos',
    icon: <Gift size={20} />,
    items: [
      { label: 'Gestión de Combos', to: '/admin/combos', icon: <Package size={18} />, permission: 'CU16:ver' },
      { label: 'Promociones', to: '/admin/promociones', icon: <Percent size={18} />, permission: 'CU16:ver' }
    ]
  }
];

interface SidebarProps {
  tipoUsuario: TipoUsuario | null;
}

const EXPANDED_W = 240;
const COLLAPSED_W = 68;

const Sidebar = ({ tipoUsuario }: SidebarProps) => {
  const permisos = useAuthStore((state) => state.permisos) as string[];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Guardar qué grupos están expandidos
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Mi Portal': true,
    'Portal Cliente': false
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const hasPermission = (item: { permission?: string; adminOnly?: boolean }) => {
    if (tipoUsuario === 'Admin') return true;
    if (item.adminOnly) return false;
    if (item.permission) {
      return (permisos || []).includes(item.permission);
    }
    return true;
  };

  const getFilteredMenu = () => {
    if (tipoUsuario === 'Cliente') {
      return [
        {
          type: 'group' as const,
          label: 'Mi Portal',
          icon: <ShoppingBag size={20} />,
          items: [
            { label: 'Comprar', to: '/cliente/comprar', icon: <ShoppingBag size={18} /> },
            { label: 'Mis Tickets', to: '/cliente/tickets', icon: <ScrollText size={18} /> },
            { label: 'Mis Pedidos', to: '/cliente/notificaciones', icon: <Monitor size={18} /> },
          ]
        }
      ];
    }

    // Para administradores y personal
    const filtered = adminStructure.map(group => {
      if (group.type === 'single') {
        return group;
      }
      // Filtrar sub-items
      const visibleSubItems = group.items.filter(item => hasPermission(item));
      if (visibleSubItems.length === 0) return null;
      return {
        ...group,
        items: visibleSubItems
      };
    }).filter(Boolean) as MenuItem[];

    // Si es Admin, agregamos el "Portal Cliente (Simulado)"
    if (tipoUsuario === 'Admin') {
      filtered.push({
        type: 'group' as const,
        label: 'Portal Cliente',
        icon: <Users size={20} />,
        items: [
          { label: 'Comprar (Cliente)', to: '/cliente/comprar', icon: <ShoppingBag size={18} /> },
          { label: 'Mis Tickets (Cliente)', to: '/cliente/tickets', icon: <ScrollText size={18} /> },
          { label: 'Mis Pedidos (Cliente)', to: '/cliente/notificaciones', icon: <Monitor size={18} /> },
        ]
      });
    }

    return filtered;
  };

  const menu = getFilteredMenu();

  // Auto-expandir el grupo que contiene el path activo al cambiar de ruta
  useEffect(() => {
    const activeGroup = menu.find(group => 
      group.type === 'group' && group.items?.some((item: any) => location.pathname === item.to)
    );
    if (activeGroup) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeGroup.label]: true
      }));
    }
  }, [location.pathname, tipoUsuario]);

  const handleGroupClick = (groupLabel: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedGroups({ [groupLabel]: true });
    } else {
      setExpandedGroups(prev => ({
        ...prev,
        [groupLabel]: !prev[groupLabel]
      }));
    }
  };

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
          <LayoutDashboard size={16} className="text-white" />
        </div>
        <AnimatePresence mode="wait">
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
        {menu.map((item) => {
          if (item.type === 'single') {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors duration-150 group ${isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <AnimatePresence mode="wait">
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
            );
          }

          // Es un grupo (dropdown collapsable)
          const isExpanded = !!expandedGroups[item.label];
          const isAnyChildActive = item.items?.some((child: any) => location.pathname === child.to);

          return (
            <div key={item.label} className="mx-2 space-y-1">
              {/* Cabecera del Grupo */}
              <button
                onClick={() => handleGroupClick(item.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isAnyChildActive 
                    ? 'bg-white/5 text-orange-400 font-semibold' 
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <AnimatePresence mode="wait">
                    {(isMobile || !collapsed) && (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="text-sm font-medium whitespace-nowrap truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {(isMobile || !collapsed) && (
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-orange-400' : ''}`}
                  />
                )}
              </button>

              {/* Sub-items del Grupo */}
              <AnimatePresence initial={false}>
                {isExpanded && (isMobile || !collapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 border-l border-white/10 ml-5 space-y-1"
                  >
                    {item.items?.map((child: any) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 text-xs ${isActive
                            ? 'bg-orange-500 text-white font-bold'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <span className="shrink-0">{child.icon}</span>
                        <span className="font-medium whitespace-nowrap truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="border-t border-white/10 px-4 py-3 shrink-0">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm w-full"
          >
            <span className="shrink-0">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
            <AnimatePresence mode="wait">
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
    </div>
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
        className="relative hidden md:flex flex-col h-full bg-[#0f172a] text-white shrink-0 overflow-hidden border-r border-white/5"
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
