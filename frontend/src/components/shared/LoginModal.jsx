import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ErrorMessage from './ErrorMessage';
import { X } from 'lucide-react';
import Label from '../ui/Label';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, pendingAction } = useAuth();
  const { addItem } = useCart();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password, false); // false for customer login
      
      // Handle pending actions (e.g., auto add to cart)
      if (pendingAction && pendingAction.type === 'ADD_TO_CART') {
        addItem(pendingAction.payload.id, 1);
      }

      closeLoginModal();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-teal-600/60 backdrop-blur-sm"
        onClick={closeLoginModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={closeLoginModal}
          className="absolute top-6 right-6 p-2 text-sage-300 hover:text-sage-500 hover:bg-sage-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-teal-600 mb-2">Welcome Back</h2>
            <p className="text-sage-500 font-medium">Sign in to Althea's Aquatic</p>
          </div>

          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label>
                Username
              </Label>
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <Label>
                Password
              </Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-sage-500">
            Don't have an account? <span className="text-mint-300 font-bold cursor-not-allowed opacity-50">Create one</span>
          </p>
        </div>
      </div>
    </div>
  );
}
