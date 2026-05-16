import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle, FileText, MapPin, CreditCard, Box } from 'lucide-react';
import { getMyOrderDetail } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

/**
 * Order detail page — displays a single order's status, items, customer info,
 * and delivery details. Redirects to order list if order not found.
 */
export default function MyOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches order details by ID from the API. On 'not found' error,
   * redirects to the orders list after a short delay.
   */
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrderDetail(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      if (err.message === 'Order not found') {
        setTimeout(() => navigate('/my-orders'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [authLoading, isAuthenticated, navigate]);

  /**
   * Returns color, background, and icon config for a given order status.
   */
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100', icon: Clock };
      case 'confirmed': return { color: 'text-teal-500', bg: 'bg-teal-50 border-teal-100', icon: CheckCircle };
      case 'completed': return { color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100', icon: CheckCircle };
      case 'cancelled': return { color: 'text-coral-500', bg: 'bg-coral-50 border-coral-100', icon: XCircle };
      default: return { color: 'text-sage-500', bg: 'bg-sage-50 border-sage-100', icon: AlertCircle };
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
      <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
      <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link to="/my-orders" className="inline-flex items-center gap-2 text-sage-500 hover:text-teal-600 font-medium mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to My Orders
        </Link>
        <div className="p-6 bg-coral-50 border border-coral-100 rounded-2xl text-coral-600 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="mb-3" />
          <h2 className="text-xl font-bold font-display mb-2">{error}</h2>
          <p className="text-coral-500">Redirecting you back to your orders list...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      <Link to="/my-orders" className="inline-flex items-center gap-2 text-sage-500 hover:text-teal-600 font-medium mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to My Orders
      </Link>

      <div className="bg-white rounded-3xl border border-sage-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-sage-100 bg-sage-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border ${statusConfig.bg} shadow-sm`}>
              <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-sage-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                {order.order_number || `#${order.order_id}`}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusConfig.bg} ${statusConfig.color}`}>
                  {order.status}
                </span>
              </h1>
              <p className="text-sage-500 mt-1 flex items-center gap-2">
                <Clock size={14} />
                Placed on {formatDateTime(order.ordered_at)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end p-4 md:p-0 bg-white md:bg-transparent rounded-xl border md:border-0 border-sage-100">
            <span className="text-sage-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Amount</span>
            <span className="text-2xl font-bold font-display text-sage-900">
              {formatCurrency(order.total_amount)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CreditCard size={14} className={order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'} />
              <span className={`text-sm font-semibold capitalize ${
                order.payment_status === 'paid' ? 'text-emerald-600' : 
                order.payment_status === 'failed' ? 'text-coral-600' : 'text-amber-600'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-sage-900 mb-4 flex items-center gap-2">
            <Package className="text-teal-500" size={20} /> Order Items
          </h2>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item.item_id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-sage-50/50 border border-sage-100">
                <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 bg-white rounded-xl border border-sage-200 overflow-hidden flex items-center justify-center">
                  {item.image_path ? (
                    <img 
                      src={`/image.php?file=${item.image_path}`} 
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box className="w-8 h-8 text-sage-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sage-900 truncate text-sm sm:text-base">{item.product_name}</h3>
                  <div className="text-sage-500 text-xs sm:text-sm mt-1">
                    {formatCurrency(item.unit_price)} × {item.qty}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sage-900">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-sage-900 mb-4 flex items-center gap-2">
            <FileText className="text-teal-500" size={20} /> Customer Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-semibold text-sage-400 uppercase tracking-wider mb-1">Name</span>
              <p className="font-medium text-sage-900">{order.customer_name}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-sage-400 uppercase tracking-wider mb-1">Email</span>
              <p className="font-medium text-sage-900">{order.customer_email || '—'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-sage-400 uppercase tracking-wider mb-1">Phone</span>
              <p className="font-medium text-sage-900">{order.customer_phone || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-sage-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-sage-900 mb-4 flex items-center gap-2">
            <MapPin className="text-teal-500" size={20} /> Delivery Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-semibold text-sage-400 uppercase tracking-wider mb-1">Address</span>
              <p className="font-medium text-sage-900 whitespace-pre-wrap leading-relaxed">
                {order.delivery_address || 'No delivery address provided'}
              </p>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-sage-100">
                <span className="block text-xs font-semibold text-sage-400 uppercase tracking-wider mb-1">Order Notes</span>
                <p className="font-medium text-sage-700 italic bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
