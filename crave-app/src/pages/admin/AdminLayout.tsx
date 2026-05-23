import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed,
  TableProperties, Settings, LogOut, Eye, ChefHat,
} from 'lucide-react';
import { useStore } from '../../store';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/orders',    icon: ClipboardList,   label: 'Commandes'  },
  { to: '/admin/menu',      icon: UtensilsCrossed, label: 'Menu'       },
  { to: '/admin/tables',    icon: TableProperties, label: 'Tables'     },
  { to: '/admin/kitchen',   icon: ChefHat,         label: 'Cuisine'    },
  { to: '/admin/settings',  icon: Settings,        label: 'Paramètres' },
];

export default function AdminLayout() {
  const { isAdminAuthenticated, adminLogout, orders } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated) navigate('/admin');
  }, [isAdminAuthenticated, navigate]);

  const activeOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'pending').length;

  const handleLogout = () => { adminLogout(); navigate('/admin'); };

  return (
    <div className="flex h-screen bg-c-deep overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-c-bg border-r border-c-border flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-c-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-c-orange rounded-xl flex items-center justify-center shrink-0">
              <span className="text-base">🍴</span>
            </div>
            <div>
              <p className="text-c-orange font-serif font-bold text-base leading-none">Crave</p>
              <p className="text-c-muted text-[11px] mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-c-orange text-white shadow-md shadow-c-orange/20'
                  : 'text-c-muted hover:bg-c-card hover:text-white'}`
              }
            >
              <Icon size={17} />
              {label}
              {label === 'Commandes' && activeOrders > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-c-border space-y-1">
          <NavLink
            to="/admin/vue-serveur"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-c-muted hover:bg-c-card hover:text-white transition-all"
          >
            <Eye size={17} /> Vue serveur
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-c-muted hover:bg-red-900/30 hover:text-red-400 transition-all"
          >
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-c-deep">
        <Outlet />
      </main>
    </div>
  );
}
