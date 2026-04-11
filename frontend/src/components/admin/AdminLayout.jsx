import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { LogOut, User, Clock, Bell, ChevronDown, Settings } from 'lucide-react';
import Toast from '../ui/Toast';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex min-h-screen bg-sage-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-sage-100 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Clock size={20} />
            </div>
            <h2 className="text-lg font-black text-teal-600 tracking-tight font-mono">
              {manilaTime} <span className="text-[10px] text-teal-400 bg-teal-50 px-1 py-0.5 rounded tracking-widest ml-1 font-sans">PH/MNL</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Notifications */}
            <button className="relative p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all group">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-coral-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
            </button>

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
                  <p className="text-sm font-black text-sage-700 leading-none capitalize">{user?.username}</p>
                  <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider mt-1">Administrator</p>
                </div>
                <ChevronDown size={14} className={`text-sage-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-sage-100 rounded-[2rem] shadow-2xl shadow-teal-900/10 overflow-hidden animate-in fade-in zoom-in duration-150 origin-top-right z-50">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-sage-50 mb-1">
                      <p className="text-xs font-black text-sage-300 uppercase tracking-widest">Account Settings</p>
                    </div>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-sage-500 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-colors">
                      <Settings size={18} />
                      Profile Settings
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-coral-500 hover:bg-coral-50 rounded-2xl transition-colors group"
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
      <Toast />
    </div>
  );
}
