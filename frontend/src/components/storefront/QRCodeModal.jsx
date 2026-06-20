import { useState, useEffect } from 'react';
import { X, Loader2, RefreshCcw } from 'lucide-react';
import { checkPaymentStatus } from '../../api/payments';
import Button from '../ui/Button';

export default function QRCodeModal({ 
  qrData, 
  qrMimeType, 
  expiresAt, 
  orderId, 
  orderNumber, 
  paymentIntentId, 
  onClose, 
  onPaymentSuccess 
}) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [status, setStatus] = useState('processing');
  
  useEffect(() => {
    // Countdown Timer
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      let targetTime = Number(expiresAt);
      
      // Fallback to 30 minutes if missing or invalid (matches PayMongo default)
      if (!targetTime || isNaN(targetTime)) {
        targetTime = now + (30 * 60);
      }
      
      const remaining = targetTime - now;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(remaining);
      }
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerInterval);
  }, [expiresAt]);
  
  useEffect(() => {
    // Payment Status Polling
    if (isExpired) return;
    
    let pollCount = 0;
    const maxPolls = 60; // 3 minutes total at 3s intervals
    
    const pollStatus = async () => {
      try {
        const response = await checkPaymentStatus(paymentIntentId);
        if (response.status === 'succeeded') {
          setStatus('succeeded');
          onPaymentSuccess();
          clearInterval(pollInterval);
        } else if (response.status === 'awaiting_payment_method') {
          // It failed or is still awaiting.
          // PayMongo usually keeps it awaiting until paid or expired.
          // For safety, we keep polling until max polls.
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err);
      }
      
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
      }
    };
    
    const pollInterval = setInterval(pollStatus, 3000);
    
    return () => clearInterval(pollInterval);
  }, [paymentIntentId, isExpired, onPaymentSuccess]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-50/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-sage-100 shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-800 transition-colors bg-sage-50 rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          
          <div className="text-center space-y-2 mt-4 mb-6">
            <h2 className="text-2xl font-bold font-display text-sage-800">Scan to Pay</h2>
            <p className="text-sage-500 text-sm">
              Open your GCash, Maya, or banking app and scan this QR code to complete order {orderNumber || `#${orderId}`}.
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="relative p-4 bg-white rounded-2xl border-2 border-teal-100 shadow-sm animate-pulse-slow">
              <div className="absolute inset-0 border-2 border-teal-500/20 rounded-2xl animate-ping opacity-20"></div>
              {isExpired ? (
                <div className="w-64 h-64 bg-sage-50 rounded-xl flex flex-col items-center justify-center text-sage-400">
                  <RefreshCcw size={48} className="mb-4 text-coral-300" />
                  <p className="font-semibold text-coral-500">QR Code Expired</p>
                  <p className="text-xs mt-1">Please try again</p>
                </div>
              ) : (
                <img 
                  src={`data:${qrMimeType};base64,${qrData}`} 
                  alt="QRPH Code" 
                  className="w-64 h-64 object-contain"
                />
              )}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            {isExpired ? (
              <p className="text-coral-500 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                Expired
              </p>
            ) : status === 'succeeded' ? (
              <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                Payment Success!
              </p>
            ) : (
              <>
                <p className="text-sage-500 text-sm font-medium flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-teal-500" />
                  Awaiting payment...
                </p>
                <div className="bg-sage-50 py-2 px-4 rounded-full inline-block">
                  <p className="text-sage-600 font-semibold text-sm">
                    Expires in <span className="text-teal-600 ml-1">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-8">
            <Button onClick={onClose} variant="secondary" className="w-full">
              {isExpired ? 'Return to Checkout' : 'Cancel Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
