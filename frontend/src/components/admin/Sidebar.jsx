import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, ShoppingCart, BarChart3, Waves } from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <Waves className="text-blue-400" />
        <h1 className="text-xl font-bold tracking-tight">Althea's Aquatic</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-slate-500 border-t border-slate-800">
        Admin Panel v1.0
      </div>
    </aside>
  );
}
