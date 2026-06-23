import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const selector = searchParams.get('selector');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function validateToken() {
      if (!selector || !token) {
        setValidationError('Invalid reset link. The URL is missing required parameters.');
        setIsValidating(false);
        return;
      }

      try {
        await verifyResetToken(selector, token);
        setIsTokenValid(true);
      } catch (err) {
        setValidationError(err.message || 'The reset link is invalid or has expired.');
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [selector, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Both password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(selector, token, newPassword, confirmPassword);
      toast.success('Password successfully reset. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-sage-50 flex flex-col py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans min-h-[60vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-sage-100 p-2">
           <img src="/logo_nobg.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold font-display text-sage-800 tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-sage-500 font-medium">
          Create a new secure password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-4 shadow-2xl shadow-teal-500/10 rounded-2xl sm:rounded-[32px] sm:px-12 border border-sage-100">
          
          {isValidating ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={40} />
              <p className="text-sage-500 font-medium">Validating reset link...</p>
            </div>
          ) : !isTokenValid ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-coral-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-sage-800 font-display mb-2">Link Invalid or Expired</h3>
              <p className="text-sm text-sage-500 mb-6">{validationError}</p>
              <Link to="/login" className="inline-block w-full">
                <Button variant="primary" type="button" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" required>New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="pl-12 pr-12 bg-sage-50/50"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 bg-sage-50/50"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Save New Password"
                  )}
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
