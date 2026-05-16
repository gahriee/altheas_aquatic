import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { ArrowLeft, Mail } from 'lucide-react';

/**
 * Forgot Password page — allows users to request a password reset link.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates email and submits the forgot password request.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setEmail('');
    } catch (_err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-teal-600/10 border border-teal-50 p-3 mb-8">
           <img src="/logo_nobg.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-center text-4xl font-bold font-display text-teal-600 tracking-tight uppercase">
          Althea's <span className="block text-teal-400 text-2xl mt-1 tracking-[0.3em]">Aquatic Farm</span>
        </h2>
        <p className="mt-2 text-center text-sm text-sage-500 font-medium">
          Forgot Password
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow-xl shadow-teal-500/5 rounded-2xl sm:rounded-3xl sm:px-10 border border-sage-100 relative">
          
          <Link to="/admin/login" className="absolute top-6 left-6 text-sage-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-xl flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>

          <div className="text-center mb-8 px-8">
            <h3 className="text-xl font-bold text-sage-800 font-display">Reset your password</h3>
            <p className="text-sm text-sage-500 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-11"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                loading={isSubmitting}
                className="w-full"
              >
                Send Reset Link
              </Button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
