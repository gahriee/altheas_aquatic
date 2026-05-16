import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../api/auth';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * Reset Password page — validates the reset token from the URL and allows
 * the user to set a new password if the token is valid.
 */
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

  /**
   * Validates passwords, calls the reset API, and redirects to login.
   */
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
      navigate('/admin/login', { replace: true });
    } catch (err) {
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
          Set New Password
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-6 sm:py-8 px-4 shadow-xl shadow-teal-500/5 rounded-2xl sm:rounded-3xl sm:px-10 border border-sage-100">
          
          {isValidating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-sage-500 mt-4 font-medium">Validating reset link...</p>
            </div>
          ) : !isTokenValid ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-coral-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-sage-800 font-display mb-2">Link Invalid or Expired</h3>
              <p className="text-sm text-sage-500 mb-6">{validationError}</p>
              <Link to="/forgot-password" className="inline-block">
                <Button variant="primary" type="button">
                  Request New Reset Link
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-sage-800 font-display">Create new password</h3>
                <p className="text-sm text-sage-500 mt-2">
                  Your new password must be at least 8 characters.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" required>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pl-11 pr-12"
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
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 pr-12"
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
                    className="w-full"
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
