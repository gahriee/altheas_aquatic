import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { LogOut, User } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-sage-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-sage-100 h-16 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-teal-600 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sage-500">
              <User size={20} />
              <span className="font-medium">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-coral-500 hover:text-coral-600 font-medium transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
