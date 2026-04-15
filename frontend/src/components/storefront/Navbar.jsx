import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Waves, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-sage-100 h-20 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group decoration-transparent">
          <Waves className="text-teal-500 group-hover:scale-110 transition-transform" size={28} />
          <span className="text-2xl font-bold text-teal-600">Althea's Aquatic</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sage-500 hover:text-mint-300 font-medium decoration-transparent hidden sm:block">Home</Link>
          
          <div className="flex items-center gap-4 bg-sage-50 p-1.5 rounded-2xl border border-sage-100">
            <Link to="/cart" className="relative p-2.5 text-sage-500 hover:text-teal-500 transition rounded-xl hover:bg-white decoration-transparent">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-teal-100">
                  {count}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-sage-100 mx-1" />

            {user ? (
              <div className="flex items-center gap-2">
                {['admin', 'staff'].includes(user.role) && (
                  <Link 
                    to="/admin" 
                    className="p-2.5 text-sage-500 hover:text-teal-500 transition rounded-xl hover:bg-white decoration-transparent"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard size={22} />
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2.5 text-sage-500 hover:text-coral-500 transition rounded-xl hover:bg-white"
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sage-500 hover:text-teal-500 font-bold transition rounded-xl hover:bg-white"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
