import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../../../api/orders';
import { Loader2, Mail, Phone, MessageSquare, Package, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function OrderDetailsExpansion({ orderId, onUpdate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === order.status) return;
    
    try {
      setUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      await fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      // Errors are handled by apiFetch toast
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="animate-spin text-teal-500" size={24} />
        <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest">Diving for details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 bg-coral-50 border border-coral-100 rounded-2xl text-coral-500 text-xs font-semibold">
        {error}
      </div>
    );
  }

  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Left Column: Customer & Status */}
      <div className="space-y-8">
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold text-sage-400 uppercase tracking-[0.2em]">Customer Contact</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Mail size={14} />
              </div>
              <div>
                <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Email</p>
                <p className="text-sm text-sage-700 font-semibold">{order.customer_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Phone size={14} />
              </div>
              <div>
                <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Phone</p>
                <p className="text-sm text-sage-700 font-semibold">{order.customer_phone}</p>
              </div>
            </div>
            {order.notes && (
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <MessageSquare size={14} />
                </div>
                <div className="pt-1">
                  <p className="text-[10px] text-sage-400 font-bold uppercase tracking-wider">Customer Notes</p>
                  <p className="text-xs text-sage-600 font-medium leading-relaxed italic mt-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                    "{order.notes}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-sage-100">
          <h4 className="text-[10px] font-bold text-sage-400 uppercase tracking-[0.2em]">Fulfillment Status</h4>
          <div className="relative">
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="w-full bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 text-sm font-bold text-sage-700 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all disabled:opacity-50"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-sage-400">
              {updating ? <Loader2 className="animate-spin" size={16} /> : <ChevronRight size={16} className="rotate-90" />}
            </div>
          </div>
          <p className="text-[10px] text-sage-400 font-medium italic">
            Updating status will notify the system and update inventory logs.
          </p>
        </div>
      </div>

      {/* Right Column: Items */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold text-sage-400 uppercase tracking-[0.2em]">Ordered Specimens</h4>
            <Link to={`/admin/orders/${orderId}`} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                Full Details <ChevronRight size={12} />
            </Link>
        </div>
        <div className="bg-white rounded-3xl border border-sage-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-sage-50/50">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-sage-400 uppercase tracking-widest border-b border-sage-100">Product</th>
                <th className="px-5 py-3 text-[10px] font-bold text-sage-400 uppercase tracking-widest border-b border-sage-100 text-center">Qty</th>
                <th className="px-5 py-3 text-[10px] font-bold text-sage-400 uppercase tracking-widest border-b border-sage-100 text-right">Price</th>
                <th className="px-5 py-3 text-[10px] font-bold text-sage-400 uppercase tracking-widest border-b border-sage-100 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-50">
              {order.items.map((item) => (
                <tr key={item.item_id} className="hover:bg-sage-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-50 border border-sage-100 overflow-hidden flex-shrink-0">
                        {item.image_path ? (
                          <img 
                            src={`/image.php?file=${encodeURIComponent(item.image_path)}`} 
                            className="w-full h-full object-cover" 
                            alt={item.product_name} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sage-300">
                            <Package size={14} />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-sage-700 font-bold tracking-tight">{item.product_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-sage-500 font-bold text-center">×{item.qty}</td>
                  <td className="px-5 py-3 text-sm text-sage-500 font-medium text-right">₱{Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-sage-800 font-bold text-right">₱{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-teal-50/30">
              <tr>
                <td colSpan={3} className="px-5 py-4 text-right">
                  <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mr-2">Total Amount Paid</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-lg font-bold font-display text-teal-600 tracking-tight">₱{Number(order.total_amount).toFixed(2)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Meta */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full border border-sage-100">
                <CreditCard size={12} className="text-teal-500" />
                <span>Method: {order.payment_method}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full border border-sage-100">
                <CheckCircle2 size={12} className={order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'} />
                <span>Payment: {order.payment_status}</span>
            </div>
            {order.payment_intent_id && (
                <div className="px-3 py-1.5 bg-sage-50 rounded-full border border-sage-100">
                    ID: {order.payment_intent_id}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
