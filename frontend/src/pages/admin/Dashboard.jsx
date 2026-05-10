import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Plus, 
  ShoppingCart, 
  BarChart3,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getDashboardStats } from '../../api/dashboard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Button from '../../components/ui/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [data, setData] = useState({
    stats: {
      total_products: 0,
      low_stock_count: 0,
      today_sales: 0,
      pending_orders: 0
    },
    trend: [],
    recent_orders: []
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await getDashboardStats(days);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (loading && data.trend.length === 0) return <div className="flex items-center justify-center h-96"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;

  const { stats, trend, recent_orders } = data;

  const cards = [
    {
      title: 'Total Products',
      value: stats.total_products,
      icon: Package,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      path: '/admin/inventory'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.low_stock_count,
      icon: AlertTriangle,
      color: stats.low_stock_count > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sage-50 text-sage-400 border-sage-100',
      path: '/admin/inventory'
    },
    {
      title: "Today's Sales",
      value: `₱${Number(stats.today_sales).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      path: '/admin/reports'
    },
    {
      title: 'Pending Orders',
      value: stats.pending_orders,
      icon: Clock,
      color: stats.pending_orders > 0 ? 'bg-mint-50 text-teal-600 border-mint-200' : 'bg-sage-50 text-sage-400 border-sage-100',
      path: '/admin/orders'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'confirmed': return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'cancelled': return 'bg-coral-50 text-coral-600 border-coral-100';
      default: return 'bg-sage-50 text-sage-500 border-sage-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-display text-teal-600">Dashboard</h1>
          <p className="text-sage-500 mt-1">Welcome back, here's what's happening in your aquatic farm.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className={`cursor-pointer group p-6 rounded-2xl border transition-all hover:shadow-md ${card.color}`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-white/50 border border-current opacity-80">
                <card.icon size={24} />
              </div>
              <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-2xl font-bold font-display mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-sage-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-teal-700 font-display flex items-center">
              <TrendingUp size={20} className="mr-2" /> Sales Trend
            </h3>
            <div className="flex bg-sage-50 p-1 rounded-lg border border-sage-100">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    days === d 
                      ? 'bg-white text-teal-600 shadow-sm border border-sage-100' 
                      : 'text-sage-400 hover:text-teal-500'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center opacity-50"><LoadingSpinner /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}}
                    dy={10}
                    interval={days > 7 ? 'preserveStartEnd' : 0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}}
                    tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}
                    labelStyle={{ fontWeight: 'bold', color: '#0d9488', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#14b8a6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions - Emphasized */}
        <div className="bg-teal-600 p-8 rounded-3xl shadow-xl shadow-teal-900/20 flex flex-col text-white">
          <h3 className="text-xl font-bold font-display mb-6 flex items-center">
            <Plus size={24} className="mr-3" /> Quick Actions
          </h3>
          <div className="space-y-4 flex-grow">
            <button 
              onClick={() => navigate('/admin/inventory')}
              className="w-full flex items-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
            >
              <div className="p-2 rounded-xl bg-white text-teal-600 mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="font-bold">Add New Product</span>
            </button>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="w-full flex items-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
            >
              <div className="p-2 rounded-xl bg-white text-teal-600 mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingCart size={20} />
              </div>
              <span className="font-bold">View Pending Orders</span>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="w-full flex items-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
            >
              <div className="p-2 rounded-xl bg-white text-teal-600 mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <span className="font-bold">Generate Reports</span>
            </button>
          </div>
          
          <div className="mt-8 p-5 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-xs font-bold text-teal-100 uppercase tracking-widest mb-2 opacity-70">Inventory Insight</p>
            <p className="text-sm font-medium leading-relaxed">
              {stats.low_stock_count > 0 
                ? `Attention: ${stats.low_stock_count} items are critically low on stock.`
                : "Inventory is healthy. All active products are well-stocked."}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-sage-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sage-100 bg-sage-50/30 overflow-hidden">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="float-right text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors mt-1"
          >
            View All Orders
          </button>
          <h3 className="text-lg font-bold text-teal-700 font-display flex items-center whitespace-nowrap">
            <ExternalLink size={20} className="mr-2 flex-shrink-0" /> Recent Orders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-sage-50 text-sage-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100">
              {recent_orders.length > 0 ? (
                recent_orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-sage-50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                    <td className="py-4 px-6 font-bold text-teal-700">{order.order_number}</td>
                    <td className="py-4 px-6 text-sage-600 font-medium">{order.customer_name}</td>
                    <td className="py-4 px-6 font-bold text-teal-600">₱{Number(order.total_amount).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sage-400 text-sm">
                      {new Date(order.ordered_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-sage-400 italic">No orders found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
