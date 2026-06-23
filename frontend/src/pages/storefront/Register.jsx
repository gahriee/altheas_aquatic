import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { register } from '../../api/auth';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/shared/ErrorMessage';

/**
 * Register page — allows new customers to create an account with email/password.
 * Validates password length and match before submission.
 */
export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Generic form field change handler.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Validates passwords match and min length, calls register API,
   * then redirects to login on success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: formData.email,
        password: formData.password
      });
      navigate('/login', { 
        state: { message: 'Account created! Please check your email to verify your account before logging in.' } 
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          Join Althea's Aquatic Farm
        </h2>
        <p className="mt-2 text-center text-sm text-sage-500 font-medium lowercase tracking-wide">
          Start your aquatic journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-4 shadow-2xl shadow-teal-500/10 rounded-2xl sm:rounded-[32px] sm:px-12 border border-sage-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-teal-50 rounded-full blur-3xl opacity-50" />
          
          {error && <div className="mb-6 animate-in slide-in-from-top-2 duration-300"><ErrorMessage message={error} /></div>}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-12 bg-sage-50/50"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-12 bg-sage-50/50"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-sage-400 font-semibold uppercase tracking-widest pl-1">Min. 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="pl-12 bg-sage-50/50"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
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
                    Create Account
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-sage-50 text-center">
            <p className="text-sm text-sage-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline decoration-teal-100 underline-offset-4 decoration-2">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] text-sage-300 font-semibold uppercase tracking-[0.2em] leading-relaxed">
            By creating an account, you agree to our<br />
            Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
