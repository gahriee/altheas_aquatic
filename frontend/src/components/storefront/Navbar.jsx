import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Waves, LogIn, LogOut, Package, User, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-sage-100 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group decoration-transparent">
          <img src="/logo_nobg.svg" alt="Logo" className="w-16 h-16 group-hover:scale-105 transition-transform object-contain" />
          <span className="text-2xl font-bold font-display text-teal-600 tracking-tight">Althea's Aquatic Farm</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sage-500 hover:text-mint-300 font-medium decoration-transparent hidden sm:block">Home</Link>

          
          <div className="flex items-center gap-4 bg-sage-50 p-1.5 rounded-2xl border border-sage-100">
            <Link id="nav-cart-icon" to="/cart" className="relative p-2.5 text-sage-500 hover:text-teal-500 transition rounded-xl hover:bg-white decoration-transparent">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-teal-100">
                  {count}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-sage-100 mx-1" />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 text-sage-500 hover:text-teal-500 transition rounded-xl hover:bg-white focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <User size={18} />
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-lg border border-sage-100 overflow-hidden z-50">
                    <div className="p-2 space-y-1">
                      <Link
                        to="/my-profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sage-600 hover:text-teal-600 hover:bg-sage-50 rounded-xl transition-colors decoration-transparent"
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sage-600 hover:text-teal-600 hover:bg-sage-50 rounded-xl transition-colors decoration-transparent"
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      <div className="h-px bg-sage-100 my-1" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-coral-500 hover:bg-coral-50 rounded-xl transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sage-500 hover:text-teal-500 font-semibold transition rounded-xl hover:bg-white"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
}
