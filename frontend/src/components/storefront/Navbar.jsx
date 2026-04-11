import { Link } from 'react-router-dom';
import { ShoppingCart, Waves } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { count } = useCart();

  return (
    <nav className="bg-white border-b border-gray-100 h-20 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group decoration-transparent">
          <Waves className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
          <span className="text-2xl font-bold text-slate-900">Althea's Aquatic</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium decoration-transparent">Home</Link>
          <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition decoration-transparent">
            <ShoppingCart size={24} />
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
