import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, User, Clock, ChevronDown, Settings, Menu } from 'lucide-react';
import { useToastConfig } from '../../context/ToastContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { setToastsEnabled } = useToastConfig();
  const navigate = useNavigate();

  useEffect(() => {
    setToastsEnabled(true);
  }, [setToastsEnabled]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const manilaTime = currentTime.toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="flex min-h-screen bg-sage-50 overflow-x-auto">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-[768px] overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-sage-100 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                <Clock size={20} />
              </div>
              <h2 className="text-lg font-bold text-teal-600 tracking-tight font-mono">
                {manilaTime} <span className="text-[10px] text-teal-400 bg-teal-50 px-1 py-0.5 rounded tracking-widest ml-1 font-sans font-bold">PH/MNL</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Notifications */}
            <NotificationDropdown />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all ${
                  isDropdownOpen ? 'bg-teal-50 ring-1 ring-teal-100' : 'hover:bg-sage-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold font-display text-sage-700 leading-none capitalize">{user?.username}</p>
                  <p className="text-[10px] text-sage-400 font-semibold uppercase tracking-[0.1em] mt-1">Administrator</p>
                </div>
                <ChevronDown size={14} className={`text-sage-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-sage-100 rounded-[2rem] shadow-2xl shadow-teal-900/10 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right z-50">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-sage-50 mb-1">
                      <p className="text-xs font-bold text-sage-200 uppercase tracking-[0.2em]">Account Settings</p>
                    </div>
                    
                    <Link 
                      to="/admin/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-sage-500 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-colors"
                    >
                      <Settings size={18} />
                      Profile Settings
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-coral-500 hover:bg-coral-50 rounded-2xl transition-colors group"
                    >
                      <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
