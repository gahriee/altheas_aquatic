import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, ShoppingCart, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ isCollapsed }) {
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-teal-600 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative shadow-2xl z-40 ${isCollapsed ? 'delay-200' : 'delay-0'}`}>
      <div className={`border-b border-teal-500 transition-all duration-300 overflow-hidden flex items-center relative ${isCollapsed ? 'justify-center h-16 delay-200' : 'px-6 h-32 delay-0'}`}>
        {/* Text Logo - Expanded Mode */}
        <div className={`transition-all duration-300 ease-in-out absolute left-6 ${!isCollapsed ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 -translate-x-10 delay-0 pointer-events-none'}`}>
          <h1 className="text-xl font-bold font-display text-white leading-tight tracking-tight">
            <span className="whitespace-nowrap">Althea's Aquatic</span><br/>
            <span className="text-mint-300 text-xs tracking-[0.2em] font-bold uppercase whitespace-nowrap">Farm</span>
          </h1>
        </div>

        {/* Icon Logo - Collapsed Mode */}
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 scale-100 delay-200' : 'opacity-0 scale-50 delay-0 pointer-events-none'}`}>
          <img 
            src="/logo_whitebg.svg" 
            alt="Logo" 
            className="w-10 h-10 object-contain drop-shadow-md" 
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const content = (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center py-4 transition-all duration-300 ease-in-out ${
                  isActive ? 'bg-teal-500 text-white' : 'text-teal-100 hover:bg-teal-500 hover:text-white'
                } ${isCollapsed ? 'px-[30px] delay-200' : 'px-6 delay-0'}`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${!isCollapsed ? 'opacity-100 translate-x-0 ml-3 max-w-[200px] delay-200' : 'opacity-0 -translate-x-4 ml-0 max-w-0 delay-0 pointer-events-none'}`}>
                {item.label}
              </span>
            </NavLink>
          );

          return (
            <Tooltip key={item.path} text={item.label} position="right" className="w-full" disabled={!isCollapsed}>
              {content}
            </Tooltip>
          );
        })}
      </nav>

      <div className={`text-xs text-teal-100/60 border-t transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 max-h-0 py-0 px-[30px] border-transparent delay-0 pointer-events-none' : 'opacity-100 max-h-[100px] py-6 px-6 border-teal-500 delay-200'}`}>
        Admin Panel v1.0
      </div>
    </aside>
  );
}
