import { useState, useEffect } from 'react';
import { History as HistoryIcon, Package, Calendar, Hash, Coins, Loader2 } from 'lucide-react';
import { getDeliveries } from '../../../api/deliveries';
import { formatCurrency } from '../../../utils/format';

export default function SupplierDeliveryTable({ supplierId }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getDeliveries(supplierId);
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [supplierId]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-sage-400">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Hydrating History...</p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="bg-sage-50/30 border border-dashed border-sage-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sage-200 mb-4 shadow-sm">
          <HistoryIcon size={24} />
        </div>
        <p className="font-bold font-display text-sage-400 text-sm tracking-tight">No delivery records found</p>
        <p className="text-sage-300 text-[10px] uppercase font-semibold tracking-[0.1em] mt-1">Start by recording a new delivery</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-100 shadow-sm transition-all duration-500 animate-in fade-in slide-in-from-top-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-sage-50/50 border-b border-sage-100">
            <th className="px-6 py-4">
              <div className="flex items-center gap-2 text-sage-400">
                <Calendar size={12} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Date</span>
              </div>
            </th>
            <th className="px-6 py-4">
              <div className="flex items-center gap-2 text-sage-400">
                <Package size={12} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Product</span>
              </div>
            </th>
            <th className="px-6 py-4">
              <div className="flex items-center gap-2 text-sage-400">
                <Hash size={12} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Qty</span>
              </div>
            </th>
            <th className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2 text-sage-400">
                <Coins size={12} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Cost (Unit / Total)</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-sage-50">
          {deliveries.map((delivery) => (
            <tr key={delivery.delivery_id} className="hover:bg-sage-50/20 transition-colors group">
              <td className="px-6 py-4 text-sm text-sage-500 font-medium">
                {formatDate(delivery.delivered_at)}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-bold font-display text-sage-800 group-hover:text-teal-600 transition-colors">
                  {delivery.product_name}
                </p>
                {delivery.notes && (
                  <p className="text-[10px] text-sage-400 mt-0.5 line-clamp-1 italic">
                    "{delivery.notes}"
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-teal-50 text-teal-600 text-xs font-semibold min-w-[32px]">
                  {delivery.qty_received}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <p className="text-sm font-bold font-display text-sage-800">
                  {formatCurrency(delivery.unit_cost * delivery.qty_received)}
                </p>
                <p className="text-[10px] text-sage-400 font-medium">
                  {formatCurrency(delivery.unit_cost)} / unit
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
