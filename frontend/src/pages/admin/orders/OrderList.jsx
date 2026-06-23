import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/admin/DataTable';
import { getOrders } from '../../../api/orders';
import { getOrderStatusStyle } from '../../../utils/status';
import OrderDetailsExpansion from '../../../components/admin/orders/OrderDetailsExpansion';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

export default function OrderList() {
  const [data, setData] = useState({ orders: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    payment_status: 'all',
    payment_method: 'all',
    search: '',
    from: '',
    to: ''
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(filters);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);




  const columns = [
    { 
      key: 'order_number', 
      label: 'Order #', 
      sortable: true,
      render: (row) => (
        <Link to={`/admin/orders/${row.order_id}`} className="font-bold text-teal-600 tracking-tight hover:underline">
          {row.order_number || `#${row.order_id}`}
        </Link>
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
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getOrderStatusStyle(row.status)}`}>
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

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl xl:text-4xl font-bold font-display text-teal-600 tracking-tight">Orders</h1>
          <p className="text-sage-500 text-sm xl:text-lg mt-1">Manage aquatic collections and fulfillment status.</p>
        </div>
      </div>

      {/* Filters Row (Above Tabs) */}
      <div className="flex flex-wrap items-center gap-3 w-full bg-white p-4 rounded-2xl border border-sage-100 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400 z-10" size={16} />
          <Input
            type="text"
            placeholder="Search by Order # or Customer name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 !py-2.5"
          />
        </div>
        <div className="w-36">
          <Select
            options={[
              { value: 'all', label: 'All Methods' },
              { value: 'cod', label: 'COD' },
              { value: 'qrph', label: 'QRPH' }
            ]}
            value={filters.payment_method}
            onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
            className="!py-2.5"
          />
        </div>
        <div className="w-36">
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'failed', label: 'Failed' }
            ]}
            value={filters.payment_status}
            onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
            className="!py-2.5"
          />
        </div>
      </div>

      {/* Status Tabs and Date Filters Row */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-sage-100 gap-4 pb-4">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-2 w-full xl:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilters({ ...filters, status: tab.id })}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                filters.status === tab.id 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 translate-y-[-2px]' 
                  : 'text-sage-400 hover:text-teal-500 hover:bg-teal-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filters.status === tab.id ? 'bg-white/20 text-white' : 'bg-sage-100 text-sage-500'
              }`}>
                {data.counts?.[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          <div className="w-36">
            <Input
              type="date"
              value={filters.from}
              max={filters.to}
              onChange={(e) => {
                const newFrom = e.target.value;
                setFilters({
                  ...filters,
                  from: newFrom,
                  to: (filters.to && newFrom > filters.to) ? newFrom : filters.to
                });
              }}
              className="!py-2.5"
            />
          </div>
          <div className="w-36">
            <Input
              type="date"
              value={filters.to}
              min={filters.from}
              onChange={(e) => {
                const newTo = e.target.value;
                setFilters({
                  ...filters,
                  to: newTo,
                  from: (filters.from && newTo < filters.from) ? newTo : filters.from
                });
              }}
              className="!py-2.5"
            />
          </div>
        </div>

      </div>
      
      {error && (
        <div className="p-4 bg-coral-50 border border-coral-100 rounded-2xl text-coral-500 text-sm font-medium">
          {error}
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={data.orders} 
        loading={loading}
        renderExpanded={(row) => (
          <OrderDetailsExpansion 
            orderId={row.order_id} 
            onUpdate={() => fetchOrders()}
          />
        )}
        emptyMessage="No orders found. Adjust your filters or check back later."
      />
    </div>
  );
}
