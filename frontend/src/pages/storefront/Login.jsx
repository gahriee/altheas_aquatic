import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Lock, LogIn, Loader2, Info, Mail, Send, ArrowLeft } from 'lucide-react';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { forgotPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';

/**
 * Login page — allows existing customers to sign in with email and password.
 * Handles pending cart actions (e.g., add-to-cart) that triggered a login redirect.
 * Also includes an inline "Forgot Password" view.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  
  const { user, login, pendingAction, setPendingAction } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  /**
   * Handles form submission — calls login API, then resolves any pending
   * cart action (like add-to-cart) that was queued before redirect.
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password, false);
      
      if (pendingAction && pendingAction.type === 'ADD_TO_CART') {
        addItem(pendingAction.payload.id, 1);
        setPendingAction(null);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles forgot password submission
   */
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await forgotPassword(email);
      toast.success('If an account with that email exists, a reset link has been sent.', { duration: 5000 });
      setIsForgotPasswordMode(false);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-sage-50 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-sage-100 p-2">
           <img src="/logo_nobg.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold font-display text-sage-800 tracking-tight">
          {isForgotPasswordMode ? 'Reset Password' : 'Welcome Home'}
        </h2>
        <p className="mt-2 text-center text-sm text-sage-500 font-medium">
          {isForgotPasswordMode 
            ? "Enter your email to receive a password reset link" 
            : "Sign in to Althea's Aquatic Farm"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-4 shadow-2xl shadow-teal-500/10 rounded-2xl sm:rounded-[32px] sm:px-12 border border-sage-100">
          {successMessage && !isForgotPasswordMode && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
              <Info size={18} />
              {successMessage}
            </div>
          )}

          {error && <div className="mb-6"><ErrorMessage message={error} /></div>}

          {isForgotPasswordMode ? (
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-12 bg-sage-50/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Send Reset Link
                      <Send size={18} />
                    </>
                  )}
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setError('');
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sage-500 hover:text-teal-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-12 bg-sage-50/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(true);
                      setError('');
                    }}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-12 bg-sage-50/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Sign in
                      <LogIn size={20} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {!isForgotPasswordMode && (
            <div className="mt-8 pt-8 border-t border-sage-50 text-center">
              <p className="text-sm text-sage-500 font-medium">
                New here?{' '}
                <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline decoration-teal-100 underline-offset-4 decoration-2">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
