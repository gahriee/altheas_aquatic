import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

/**
 * Cart page — displays cart items with quantity controls, order summary sidebar,
 * and a promo code input. Shows an empty state when no items are present.
 */
export default function Cart() {
  const { items, total, count, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState(null);

  /**
   * Prompts a confirmation dialog before clearing all items from the cart.
   */
  const handleClearCart = () => {
    setConfirmAction({
      title: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      onConfirm: () => {
        clearCart();
        setConfirmAction(null);
      }
    });
  };

  /**
   * Prompts a confirmation dialog before removing a single item from the cart.
   */
  const handleRemoveItem = (item) => {
    setConfirmAction({
      title: 'Remove Item',
      message: `Are you sure you want to remove ${item.name} from your cart?`,
      onConfirm: () => {
        removeItem(item.id);
        setConfirmAction(null);
      }
    });
  };

  /**
   * Decreases item quantity by one; if already at 1, triggers removal dialog.
   */
  const handleDecreaseQuantity = (item) => {
    if (item.qty === 1) {
      handleRemoveItem(item);
    } else {
      updateItem(item.id, item.qty - 1);
    }
  };


  if (!items || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-sage-100 shadow-2xl shadow-teal-500/10">
            <ShoppingBag className="text-teal-500" size={60} strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="text-center space-y-3 sm:space-y-4 max-w-md">
          <h1 className="text-2xl sm:text-4xl font-bold font-display text-sage-800 tracking-tight">Your cart is empty</h1>
          <p className="text-sm sm:text-base text-sage-500 font-medium leading-relaxed px-4">
            It looks like you haven't added any aquatic specimens to your collection yet. Explore our vibrant species to get started.
          </p>
        </div>

        <Button onClick={() => navigate('/')} className="px-10 py-6 text-lg group">
          <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6 w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold font-display text-sage-800 tracking-tight flex items-center gap-2 sm:gap-4">
                Your Selection
                <span className="text-sm font-bold bg-teal-100 text-teal-600 px-4 py-1.5 rounded-full uppercase tracking-widest">
                  {count} {count === 1 ? 'Item' : 'Items'}
                </span>
              </h1>
              <button 
                onClick={handleClearCart}
                className="text-sage-400 hover:text-coral-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-sage-100 flex flex-row gap-4 sm:gap-6"
                >
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] sm:rounded-[24px] overflow-hidden bg-sage-50 shrink-0">
                    <img
                      src={item.image_path ? `/image.php?file=${item.image_path}` : 'https://placehold.co/200x200?text=No+Image'}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0 flex flex-col h-full justify-center">
                      <h3 className="text-base sm:text-xl font-bold font-display text-sage-800 truncate mb-1">{item.name}</h3>
                      <p className="text-teal-600 font-bold text-sm sm:text-lg mb-3 sm:mb-4">{formatCurrency(item.price)}</p>
                      
                      <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                        <button 
                          onClick={() => handleRemoveItem(item)}
                          className="text-sage-300 hover:text-coral-500 transition-colors p-1.5 -ml-1.5"
                          title="Remove Item"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <div className="w-px h-4 bg-sage-100" />
                        <Link to={`/product/${item.id}`} className="text-[10px] sm:text-[10px] font-bold uppercase tracking-widest text-teal-500 hover:text-teal-600">
                          View Product
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-sage-50">
                      <div className="flex items-center bg-sage-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-sage-100">
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          className="p-1.5 sm:p-2 text-sage-400 hover:text-coral-500 transition-colors"
                        >
                          <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <span className="w-8 sm:w-10 text-center font-bold text-sage-800 text-sm sm:text-lg">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.qty + 1)}
                          className="p-1.5 sm:p-2 text-sage-400 hover:text-teal-500 transition-colors"
                        >
                          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                      <p className="text-base sm:text-xl font-bold font-display text-sage-800">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0 space-y-4 sm:space-y-6 lg:sticky lg:top-28">
            <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[48px] border border-sage-100 space-y-6 sm:space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000 text-sage-800">
                <ShoppingCart size={200} />
              </div>

              <div className="relative space-y-6">
                <h2 className="text-2xl font-bold font-display text-teal-600 uppercase tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 pt-4 border-t border-sage-100">
                  <div className="flex justify-between items-center text-sage-400">
                    <span className="font-bold">Subtotal</span>
                    <span className="font-bold font-display text-sage-800">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sage-400">
                    <span className="font-bold">Estimated Shipping</span>
                    <span className="text-[10px] font-bold bg-sage-50 px-3 py-1 rounded-full text-sage-500 uppercase tracking-widest border border-sage-100">Free</span>
                  </div>
                  
                  <div className="pt-6 border-t border-sage-100 flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">Total to Pay</span>
                      <span className="text-3xl sm:text-4xl font-bold font-display text-sage-800">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/checkout')} 
                  className="w-full py-6 text-xl shadow-none group"
                >
                  Checkout Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                </Button>

                <div className="flex items-center justify-center gap-2 pt-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sage-300">Secure Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.title}
        message={confirmAction?.message}
        onConfirm={confirmAction?.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
