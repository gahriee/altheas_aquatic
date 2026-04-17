import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductDetails } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ArrowLeft, Loader2, Minus, Plus, Package, Tag, Info } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setPendingAction } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getProductDetails(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction({
        type: 'ADD_TO_CART',
        payload: { id: product.product_id, name: product.name, price: product.price, qty: quantity }
      });
      navigate('/login');
      return;
    }

    addItem(product.product_id, quantity);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock_qty || 1)) {
      setQuantity(newQty);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-teal-500 animate-spin" size={48} />
        <p className="text-sage-300 font-bold tracking-widest uppercase text-xs">Fetching details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-8">
        <div className="bg-coral-50 text-coral-500 p-8 rounded-[40px] space-y-4">
          <Info size={48} className="mx-auto" />
          <h1 className="text-2xl font-black">Something went wrong</h1>
          <p className="text-sage-500 font-medium">{error || 'Product not found'}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/')} className="px-8">
          <ArrowLeft size={18} />
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sage-400 hover:text-teal-500 font-bold transition-all hover:-translate-x-1 mb-8 focus:outline-none"
      >
        <ArrowLeft size={20} />
        Back to Results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
        {/* Product Image */}
        <div className="relative aspect-square rounded-[48px] overflow-hidden bg-white shadow-2xl shadow-teal-500/5 group">
          <img
            src={product.image_path ? `/image.php?file=${product.image_path}` : 'https://placehold.co/800x800?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          <div className="absolute top-8 left-8">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-teal-600 shadow-xl shadow-black/5 flex items-center gap-2 uppercase tracking-widest">
              <Tag size={14} />
              {product.category_name}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-sage-800 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-black text-teal-600">
              ₱{Number(product.price).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-sage-100 shadow-xl shadow-teal-500/5 space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-sage-50">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-sage-300 tracking-widest">Available Stock</span>
                <div className="flex items-center gap-2 text-sage-800 font-bold">
                  <Package size={16} className="text-teal-500" />
                  {product.stock_qty} Units
                </div>
              </div>
              <div className="w-px h-8 bg-sage-50" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-sage-300 tracking-widest">Delivery</span>
                <div className="text-emerald-500 font-bold">Ready to Ship</div>
              </div>
            </div>

            <p className="text-sage-500 leading-relaxed font-medium">
              {product.description || "The Althea's Aquatic signature collection offers unparalleled beauty and health for your aquarium. Each specimen is ethically sourced and meticulously cared for to ensure the highest quality for your home habitat."}
            </p>
          </div>

          <div className="bg-sage-100/50 p-6 rounded-[32px] flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-sage-100">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 text-sage-400 hover:text-teal-500 disabled:opacity-30 disabled:hover:text-sage-400 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="w-12 text-center text-xl font-black text-sage-800">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock_qty}
                className="p-3 text-sage-400 hover:text-teal-500 disabled:opacity-30 disabled:hover:text-sage-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex-1 w-full py-6 text-lg shadow-xl shadow-teal-500/20"
              disabled={product.stock_qty <= 0}
            >
              <ShoppingCart size={24} />
              {product.stock_qty > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
