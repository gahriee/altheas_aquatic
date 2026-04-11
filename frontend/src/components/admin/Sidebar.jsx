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
    <aside className="w-64 bg-teal-600 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-teal-500 flex items-center gap-3">
        <Waves className="text-mint-300" />
        <h1 className="text-xl font-bold tracking-tight text-white">Althea's Aquatic</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive ? 'bg-teal-500 text-white' : 'text-teal-100 hover:bg-teal-500 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-xs text-teal-100/60 border-t border-teal-500">
        Admin Panel v1.0
      </div>
    </aside>
  );
}
