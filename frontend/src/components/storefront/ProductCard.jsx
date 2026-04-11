import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ id, name, price, imagePath }) {
  const { addItem } = useCart();
  const { user, openLoginModal } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    
    if (!user) {
      openLoginModal({
        type: 'ADD_TO_CART',
        payload: { id, name, price }
      });
      return;
    }

    addItem(id, 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-sage-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-sage-50">
        <img
          src={imagePath ? `/image.php?file=${imagePath}` : 'https://placehold.co/400x400?text=No+Image'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </Link>
      
      <div className="p-5">
        <Link to={`/product/${id}`} className="block mb-1 group-hover:text-teal-500 transition-colors decoration-transparent text-teal-600">
          <h3 className="text-lg font-bold truncate">{name}</h3>
        </Link>
        <p className="text-2xl font-bold text-teal-600 mb-4">£{Number(price).toFixed(2)}</p>
        
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-teal-100"
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
