import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { register } from '../../api/auth';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/shared/ErrorMessage';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
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
        username: formData.username,
        password: formData.password
      });
      // Redirect to login on success
      navigate('/login', { 
        state: { message: 'Account created successfully! Please log in.' } 
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-200 animate-bounce-subtle">
           <Sparkles size={32} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-sage-800 tracking-tight">
          Join Althea's Aquatic
        </h2>
        <p className="mt-2 text-center text-sm text-sage-500 font-medium lowercase tracking-wide">
          Start your aquatic journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-teal-500/10 sm:rounded-[32px] sm:px-12 border border-sage-100 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-teal-50 rounded-full blur-3xl opacity-50" />
          
          {error && <div className="mb-6 animate-in slide-in-from-top-2 duration-300"><ErrorMessage message={error} /></div>}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Choose a Username</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                <Input
                  id="username"
                  name="username"
                  required
                  className="pl-12 bg-sage-50/50"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. fishlover123"
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
              <p className="text-[10px] text-sage-400 font-bold uppercase tracking-widest pl-1">Min. 6 characters</p>
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
              <Link to="/login" className="text-teal-600 font-black hover:text-teal-700 transition-colors underline decoration-teal-100 underline-offset-4 decoration-2">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] text-sage-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
            By creating an account, you agree to our<br />
            Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
