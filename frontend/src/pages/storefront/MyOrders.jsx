import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { getMyOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/format';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const STATUS_TABS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

/**
 * My Orders page — lists all customer orders with status filtering tabs.
 * Redirects unauthenticated users to the login page.
 */
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * Fetches the customer's orders from the API, filtered by activeTab status.
   */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders({ status: activeTab });
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrders();
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

  /**
   * Returns a styled badge element for a given payment status.
   */
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid': return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Paid</span>;
      case 'unpaid': return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">Unpaid</span>;
      case 'failed': return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-coral-50 text-coral-600 border border-coral-100">Failed</span>;
      default: return null;
    }
  };

  if (authLoading) {
    return (
      <div className="py-20">
      <LoadingSpinner message="Loading your orders..." />
      </div>
    );
  }

  if (!isAuthenticated()) return null;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-teal-50 rounded-xl">
          <Package className="text-teal-500 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-sage-900">My Orders</h1>
          <p className="text-sage-500 text-sm">Track and view your order history</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto flex-nowrap pb-2 scrollbar-none snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.value
                ? 'bg-teal-500 text-white shadow-sm ring-2 ring-teal-100'
                : 'bg-white text-sage-600 border border-sage-200 hover:border-teal-300 hover:text-teal-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 mb-6 bg-coral-50 border border-coral-100 rounded-xl text-coral-600 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading your orders..." />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-sage-100 shadow-sm">
          <Package className="w-16 h-16 text-sage-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold font-display text-sage-900 mb-2">
            {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
          </h3>
          <p className="text-sage-500 mb-6 max-w-md mx-auto">
            {activeTab === 'all' 
              ? "You haven't placed any orders yet. Explore our collection of premium aquatic life and supplies."
              : `You don't have any orders with a ${activeTab} status.`}
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-teal-500 text-white hover:bg-teal-600 transition shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const StatusIcon = getStatusConfig(order.status).icon;
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <div 
                key={order.order_id} 
                className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden hover:border-teal-200 transition-colors duration-200 group"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border ${statusConfig.bg}`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sage-900 text-lg">
                          {order.order_number || `#${order.order_id}`}
                        </h3>
                        {getPaymentBadge(order.payment_status)}
                      </div>
                      <p className="text-sage-500 text-sm mb-1">
                        Placed on {formatDate(order.ordered_at)}
                      </p>
                      <p className="text-sage-600 text-sm font-medium">
                        {order.item_count} {order.item_count === 1 ? 'item' : 'items'} • {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-sage-100">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusConfig.bg} ${statusConfig.color}`}>
                      {order.status}
                    </span>
                    <Link
                      to={`/my-orders/${order.order_id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                    >
                      <Eye size={16} />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
