import { useEffect, useState } from 'react';
import DataTable from '../../../components/admin/DataTable';
import { getOrders } from '../../../api/orders';
import OrderDetailsExpansion from '../../../components/admin/orders/OrderDetailsExpansion';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-emerald-100 text-emerald-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      case 'cancelled':
      case 'failed':
        return 'bg-coral-100 text-coral-600';
      default:
        return 'bg-sage-100 text-sage-400';
    }
  };

  const columns = [
    { 
      key: 'order_number', 
      label: 'Order #', 
      sortable: true,
      render: (row) => (
        <span className="font-bold text-teal-600 tracking-tight">{row.order_number || `#${row.order_id}`}</span>
      )
    },
    { key: 'customer_name', label: 'Customer', sortable: true },
    { 
      key: 'total_amount', 
      label: 'Total', 
      sortable: true, 
      render: (row) => (
        <span className="font-bold font-display text-sage-800">₱{Number(row.total_amount).toFixed(2)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(row.status)}`}>
          {row.status}
        </span>
      )
    },
    { 
      key: 'ordered_at', 
      label: 'Date', 
      sortable: true,
      render: (row) => new Date(row.ordered_at).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-display text-sage-800 tracking-tight">Orders</h1>
          <p className="text-sage-400 font-medium">Manage aquatic collections and fulfillment status.</p>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-coral-50 border border-coral-100 rounded-2xl text-coral-500 text-sm font-medium">
          {error}
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={orders} 
        loading={loading}
        renderExpanded={(row) => <OrderDetailsExpansion orderId={row.order_id} />}
        emptyMessage="No orders found. Your sales history will appear here."
      />
    </div>
  );
}
