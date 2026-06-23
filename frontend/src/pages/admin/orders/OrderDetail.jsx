import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../../../api/orders';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  Package, 
  CreditCard, 
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { getOrderStatusStyle } from '../../../utils/status';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      await fetchOrder();
    } catch (err) {
      // Error handled by apiFetch
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, { payment_status: newPaymentStatus });
      await fetchOrder();
    } catch (err) {
      // Error handled by apiFetch
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-teal-500" size={40} />
        <p className="text-sm font-bold text-sage-400 uppercase tracking-[0.2em]">Retrieving aquatic records...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-coral-50 border border-coral-100 rounded-3xl text-center space-y-4">
        <AlertCircle size={48} className="text-coral-500 mx-auto" />
        <h2 className="text-lg xl:text-xl font-bold text-coral-600">Order Disappeared</h2>
        <p className="text-sage-500">{error || "This order couldn't be found in our ecosystem."}</p>
        <Link to="/admin/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }



  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link 
            to="/admin/orders" 
            className="flex items-center gap-2 text-xs font-bold text-sage-400 uppercase tracking-widest hover:text-teal-600 transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl xl:text-4xl font-bold font-display text-sage-800 tracking-tight">
              {order.order_number || `#${order.order_id}`}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getOrderStatusStyle(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-sage-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(order.ordered_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              {new Date(order.ordered_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-sage-100 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              options={statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              className="text-sm font-bold text-sage-700"
            />
            {updating && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-sage-400">
                <Loader2 className="animate-spin" size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer & Payment */}
        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl border border-sage-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-sage-400 uppercase tracking-[0.2em]">Customer Information</h3>
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <User size={16} />
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider mb-1">Name</p>
                <p className="text-lg text-sage-800 font-bold tracking-tight">{order.customer_name}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage-50 flex items-center justify-center text-sage-500">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-sage-700 font-semibold">{order.customer_email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage-50 flex items-center justify-center text-sage-500">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-sage-700 font-semibold">{order.customer_phone}</p>
                </div>
              </div>

              {order.notes && (
                <div className="pt-4 border-t border-sage-50">
                  <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-amber-500" />
                    Internal Notes
                  </p>
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 text-sm text-sage-600 italic leading-relaxed">
                    "{order.notes}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-teal-600 rounded-3xl p-6 shadow-xl space-y-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-cream-300 uppercase tracking-[0.2em]">Payment Records</h3>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {order.payment_status === 'paid' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                  {order.payment_status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-cream-300/60 font-bold uppercase tracking-widest mb-1">Method</p>
                  <p className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
                    {order.payment_method}
                    {order.payment_method === 'cod' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        COD
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-cream-300/60 font-bold uppercase tracking-widest mb-1">Currency</p>
                  <p className="text-sm font-bold tracking-tight">PHP (₱)</p>
                </div>
              </div>

              {order.payment_intent_id && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] text-cream-300/60 font-bold uppercase tracking-widest mb-1">Payment Intent ID</p>
                  <code className="text-xs bg-black/20 px-2 py-1 rounded select-all font-mono">
                    {order.payment_intent_id}
                  </code>
                </div>
              )}

              {order.payment_method === 'cod' && order.payment_status === 'unpaid' && (
                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    disabled={updating}
                    onClick={() => handlePaymentStatusUpdate('paid')}
                  >
                    Mark as Paid
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-sage-100 shadow-sm overflow-hidden flex flex-col min-h-full">
            <div className="px-8 py-6 border-b border-sage-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-sage-800 font-display tracking-tight flex items-center gap-2">
                <Package size={20} className="text-teal-500" />
                Ordered Specimens
              </h3>
              <span className="text-xs font-bold text-sage-400 uppercase tracking-widest">
                {order.items.length} Item{order.items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-sage-50/30">
                    <th className="px-8 py-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest text-right">Unit Price</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-50">
                  {order.items.map((item) => (
                    <tr key={item.item_id} className="hover:bg-sage-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-sage-50 border border-sage-100 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            {item.image_path ? (
                              <img 
                                src={`/image.php?file=${encodeURIComponent(item.image_path)}`} 
                                className="w-full h-full object-cover" 
                                alt={item.product_name} 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sage-300">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-base font-bold text-sage-800 tracking-tight">{item.product_name}</p>
                            <p className="text-xs text-sage-400 font-medium italic">Aquatic Specimen</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 font-bold text-sm">
                          {item.qty}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right text-sage-500 font-semibold tabular-nums">
                        ₱{Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-8 py-5 text-right text-sage-800 font-bold tabular-nums">
                        ₱{Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-8 bg-teal-50/30 border-t border-teal-100/50 mt-auto">
              <div className="flex flex-col items-end gap-2">
                <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Grand Total Amount</p>
                <p className="text-2xl xl:text-4xl font-bold font-display text-teal-600 tracking-tight">
                  ₱{Number(order.total_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
