import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { getConfirmation } from '../../api/orders';
import { checkPaymentStatus } from '../../api/payments';
import { formatCurrency } from '../../utils/format';
import Button from '../../components/ui/Button';

/**
 * Order Confirmation page — displays order status and summary after checkout.
 * Polls PayMongo payment intent status for real-time updates until resolved.
 */
export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('pi');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');


  useEffect(() => {
    let pollCount = 0;
    const maxPolls = 15;
    let interval;

    const fetchOrder = async () => {
      try {
        const data = await getConfirmation(id);
        setOrder(data);
        
        if (data.payment_status === 'paid') {
          setPaymentStatus('succeeded');
          return true;
        } else if (data.payment_status === 'failed') {
          setPaymentStatus('awaiting_payment_method');
          return true;
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
      return false;
    };

    const pollPayment = async () => {
      if (!paymentIntentId) return;
      
      try {
        const statusData = await checkPaymentStatus(paymentIntentId);
        if (statusData.status === 'succeeded') {
          setPaymentStatus('succeeded');
          fetchOrder();
          return true;
        } else if (statusData.status === 'awaiting_payment_method') {
          setPaymentStatus('awaiting_payment_method');
          fetchOrder();
          return true;
        }
      } catch (error) {
        console.error('Failed to poll payment status:', error);
      }
      return false;
    };

    const startPolling = async () => {
      setLoading(true);
      const done = await fetchOrder();
      if (done) {
        setLoading(false);
        return;
      }

      if (paymentIntentId) {
        const paymentDone = await pollPayment();
        if (paymentDone) {
          setLoading(false);
          return;
        }
      }
      
      setLoading(false);

      interval = setInterval(async () => {
        pollCount++;
        const orderDone = await fetchOrder();
        const paymentDone = await pollPayment();

        if (orderDone || paymentDone || pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 3000);
    };

    startPolling();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-teal-500" size={48} />
        <p className="text-sage-400 font-semibold uppercase tracking-widest text-xs">Authenticating order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <XCircle className="text-coral-500" size={64} />
        <h1 className="text-3xl font-bold font-display text-sage-800">Order Not Found</h1>
        <Button as={Link} to="/" fullWidth={false} className="px-10">Back to Store</Button>
      </div>
    );
  }

  const isPaid = paymentStatus === 'succeeded' || order.payment_status === 'paid';
  const isFailed = paymentStatus === 'awaiting_payment_method' || order.payment_status === 'failed';
  const isPending = !isPaid && !isFailed;

  return (
    <div className="animate-in fade-in duration-700 max-w-3xl mx-auto px-4 py-6 sm:py-12 text-center">
      <div className="relative mb-8 sm:mb-12">
        <div className={`absolute inset-0 blur-3xl rounded-full opacity-20 mx-auto w-24 sm:w-32 ${isPaid ? 'bg-emerald-500' : isFailed ? 'bg-coral-500' : 'bg-amber-500'}`} />
        <div className="relative inline-flex p-5 sm:p-8 bg-white rounded-3xl sm:rounded-[40px] shadow-xl border border-sage-50">
          {isPaid && <CheckCircle className="text-emerald-500" size={60} strokeWidth={1.5} />}
          {isFailed && <XCircle className="text-coral-500" size={60} strokeWidth={1.5} />}
          {isPending && <Clock className="text-amber-500" size={60} strokeWidth={1.5} />}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold font-display text-sage-800 tracking-tight">
          {isPaid ? 'Order Confirmed!' : isFailed ? 'Payment Failed' : 'Verifying Payment...'}
        </h1>
        <p className="text-sm sm:text-base text-sage-500 font-medium max-w-lg mx-auto">
          {isPaid 
            ? `Excellent choice. Your order ${order.order_number || `#${order.order_id}`} has been secured. Our marine specialists are preparing your specimens for transit.`
            : isFailed 
            ? `We encountered an issue with your GCash transaction. No specimens were reserved. Please try again or use a different method.`
            : `We are awaiting confirmation from the payment gateway. This usually takes just a few seconds.`}
        </p>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[48px] border border-sage-100 shadow-sm text-left space-y-4 sm:space-y-6 mb-8 sm:mb-12">
        <h2 className="text-xl font-bold font-display text-sage-800 flex items-center gap-3">
          <ShoppingBag size={20} className="text-teal-500" />
          Order Summary
        </h2>
        
        <div className="space-y-4 divide-y divide-sage-50">
          {order.items && order.items.map((item) => (
            <div key={item.item_id || item.product_id} className="pt-4 flex justify-between items-center text-sm">
              <div className="min-w-0">
                <p className="font-semibold text-sage-800 truncate">{item.product_name}</p>
                <p className="text-xs text-sage-400 font-medium">{item.qty} × {formatCurrency(item.unit_price)}</p>
              </div>
              <span className="font-bold font-display text-sage-800 shrink-0">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-sage-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sage-400 font-semibold text-sm">Total Investment</span>
            <span className="text-sage-800 text-2xl font-bold font-display">{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">Gateway Status</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-600' : isFailed ? 'bg-coral-100 text-coral-600' : 'bg-amber-100 text-amber-600'}`}>
              {isPaid ? 'PAID' : isFailed ? 'FAILED' : 'AWAITING CONFIRMATION'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button as={Link} to="/" fullWidth={false} className="px-10 py-5 group">
          Keep Exploring
          <ArrowRight className="group-hover:translate-x-1 transition-transform ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
}
