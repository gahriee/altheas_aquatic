import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const selector = searchParams.get('selector');
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function doVerify() {
      if (!selector || !token) {
        setError('Invalid verification link. The URL is missing required parameters.');
        setIsVerifying(false);
        return;
      }

      try {
        await verifyEmail(selector, token);
        setIsSuccess(true);
      } catch (err) {
        setError(err.message || 'The verification link is invalid or has expired.');
      } finally {
        setIsVerifying(false);
      }
    }

    doVerify();
  }, [selector, token]);

  return (
    <div className="bg-sage-50 flex flex-col py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans min-h-[60vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-sage-100 p-2">
           <img src="/logo_nobg.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold font-display text-sage-800 tracking-tight">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 sm:py-10 px-4 shadow-2xl shadow-teal-500/10 rounded-2xl sm:rounded-[32px] sm:px-12 border border-sage-100 text-center">
          {isVerifying ? (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
              <p className="text-sage-600 font-medium text-lg">Verifying your email address...</p>
            </div>
          ) : isSuccess ? (
            <div className="py-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="text-emerald-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-sage-800 font-display mb-2">Verified!</h3>
              <p className="text-sage-500 mb-8">
                Your email address has been successfully verified. You can now log in to your account.
              </p>
              <Link to="/login" className="w-full">
                <Button variant="primary" className="w-full flex justify-center items-center gap-2">
                  Go to Login
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-coral-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-coral-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-sage-800 font-display mb-2">Verification Failed</h3>
              <p className="text-sage-500 mb-8">{error}</p>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
