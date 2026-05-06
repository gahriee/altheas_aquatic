import { useState, useEffect } from 'react';
import { getOrder } from '../../../api/orders';
import { Loader2, Mail, Phone, MessageSquare, Package, CreditCard } from 'lucide-react';

export default function OrderDetailsExpansion({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    fetchDetails();
  }, [orderId]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Customer Info */}
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

      {/* Order Items */}
      <div className="lg:col-span-2 space-y-6">
        <h4 className="text-[10px] font-bold text-sage-400 uppercase tracking-[0.2em]">Ordered Specimens</h4>
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
                <tr key={item.order_item_id} className="hover:bg-sage-50/30 transition-colors">
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
        <div className="flex items-center gap-4 text-[10px] font-bold text-sage-400 uppercase tracking-widest">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 rounded-full border border-sage-100">
                <CreditCard size={12} className="text-teal-500" />
                <span>Method: {order.payment_method}</span>
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
