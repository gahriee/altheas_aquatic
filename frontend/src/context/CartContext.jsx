import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCart, removeFromCart, clearCart as apiClearCart } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (productId, qty = 1) => {
    await addToCart({ product_id: productId, qty });
    await fetchCart();
  };

  const updateItem = async (productId, qty) => {
    await updateCart({ product_id: productId, qty });
    await fetchCart();
  };

  const removeItem = async (productId) => {
    await removeFromCart(productId);
    await fetchCart();
  };

  const clearCart = async () => {
    await apiClearCart();
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ items, total, count, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
