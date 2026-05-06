import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFlyToCart } from '../../hooks/useFlyToCart';

export default function ProductCard({ id, name, price, imagePath }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated, setPendingAction } = useAuth();
  const navigate = useNavigate();
  const fly = useFlyToCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setPendingAction({
        type: 'ADD_TO_CART',
        payload: { id, name, price }
      });
      navigate('/login');
      return;
    }

    setAdded(true);
    await fly(e.currentTarget);
    addItem(id, 1);
    
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-[32px] border border-sage-100 overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 hover:-translate-y-1">
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-sage-50 group-hover:after:opacity-100 after:opacity-0 after:absolute after:inset-0 after:bg-teal-500/10 after:transition-opacity after:duration-500">
        <img
          src={imagePath ? `/image.php?file=${imagePath}` : 'https://placehold.co/400x400?text=No+Image'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </Link>
      
      <div className="p-6">
        <Link to={`/product/${id}`} className="block mb-1 group-hover:text-teal-600 transition-colors decoration-transparent text-sage-800">
          <h3 className="text-xl font-bold font-display truncate tracking-tight">{name}</h3>
        </Link>
        <p className="text-2xl font-bold font-display text-teal-600 mb-6 tracking-tight">₱{Number(price).toFixed(2)}</p>
        
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-3 font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg active:scale-95 ${
            added
              ? 'bg-emerald-500 shadow-emerald-500/20 scale-[0.97]'
              : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/20'
          }`}
        >
          <span className={`transition-all duration-300 ${added ? 'scale-125' : 'scale-100'}`}>
            {added ? <Check size={20} strokeWidth={3} className="text-white" /> : <ShoppingCart size={20} className="text-white" />}
          </span>
          <span className="text-white">{added ? 'Added!' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
