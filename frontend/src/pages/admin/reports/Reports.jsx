import { useState, useEffect } from 'react';
import * as reportsApi from '../../../api/reports';
import { TrendingUp, Package, Truck, Download, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorMessage from '../../../components/shared/ErrorMessage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ from: firstDay, to: currentDay });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    sales: null,
    inventory: null,
    suppliers: null
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'sales') {
        const res = await reportsApi.getSalesReport(dateRange.from, dateRange.to);
        setData(prev => ({ ...prev, sales: res }));
      } else if (activeTab === 'inventory') {
        const res = await reportsApi.getInventoryReport();
        setData(prev => ({ ...prev, inventory: res.inventory }));
      } else if (activeTab === 'suppliers') {
        const res = await reportsApi.getSuppliersReport(dateRange.from, dateRange.to);
        setData(prev => ({ ...prev, suppliers: res.suppliers }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, dateRange]);

  const handleExport = () => {
    reportsApi.exportCsv(activeTab, dateRange.from, dateRange.to);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-display text-teal-600 tracking-tight">Reports</h1>
          <p className="text-sage-500 text-lg mt-1">Business performance and analytics</p>
        </div>
      </div>

      {/* Tabs and Filters Row */}
      <div className="flex flex-col xl:flex-row justify-between items-end border-b border-sage-200 gap-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-3 flex items-center space-x-2 font-bold text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'sales' ? 'border-teal-500 text-teal-600' : 'border-transparent text-sage-400 hover:text-teal-500 hover:bg-teal-50 rounded-t-xl'
            }`}
          >
            <TrendingUp size={16} /> <span>Sales Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 flex items-center space-x-2 font-bold text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'inventory' ? 'border-teal-500 text-teal-600' : 'border-transparent text-sage-400 hover:text-teal-500 hover:bg-teal-50 rounded-t-xl'
            }`}
          >
            <Package size={16} /> <span>Inventory Status</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-3 flex items-center space-x-2 font-bold text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'suppliers' ? 'border-teal-500 text-teal-600' : 'border-transparent text-sage-400 hover:text-teal-500 hover:bg-teal-50 rounded-t-xl'
            }`}
          >
            <Truck size={16} /> <span>Supplier Deliveries</span>
          </button>
        </div>

        <div className="flex items-end gap-3 mb-2">
          {activeTab !== 'inventory' && (
            <div className="flex items-end gap-2">
              <div className="w-40">
                <Input
                  type="date"
                  label="From"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="w-40">
                <Input
                  type="date"
                  label="To"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
            </div>
          )}
          <Button 
            onClick={handleExport} 
            variant="primary" 
            className="shadow-md shadow-teal-500/10"
          >
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {activeTab === 'sales' && data.sales && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-teal-50 rounded-lg p-6 border border-teal-100">
                    <p className="text-teal-600 font-medium mb-1">Total Orders</p>
                    <p className="text-3xl font-bold font-display text-teal-700">{data.sales.total_orders}</p>
                  </div>
                  <div className="bg-mint-50 rounded-lg p-6 border border-mint-100">
                    <p className="text-teal-600 font-medium mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold font-display text-teal-700">₱{data.sales.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-teal-600 font-display">Top Selling Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-sage-50 border-y border-sage-200 text-sage-500 text-sm">
                      <tr>
                        <th className="py-3 px-4 font-medium">Product Name</th>
                        <th className="py-3 px-4 font-medium">Quantity Sold</th>
                        <th className="py-3 px-4 font-medium">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {data.sales.top_products.length > 0 ? (
                        data.sales.top_products.map((p, idx) => (
                          <tr key={idx} className="hover:bg-sage-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-teal-700">{p.name}</td>
                            <td className="py-3 px-4 text-sage-600">{p.total_qty} units</td>
                            <td className="py-3 px-4 text-teal-600 font-medium">₱{Number(p.total_sales).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="py-8 text-center text-sage-400 italic">No sales data for this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && data.inventory && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-sage-50 border-y border-sage-200 text-sage-500 text-sm">
                      <tr>
                        <th className="py-3 px-4 font-medium">Product Name</th>
                        <th className="py-3 px-4 font-medium">Current Stock</th>
                        <th className="py-3 px-4 font-medium">Threshold</th>
                        <th className="py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {data.inventory.length > 0 ? (
                        data.inventory.map((p) => (
                          <tr key={p.product_id} className="hover:bg-sage-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-teal-700">{p.name}</td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${p.is_out_of_stock ? 'text-coral-500' : p.is_low_stock ? 'text-amber-500' : 'text-sage-600'}`}>
                                {p.stock_qty}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sage-400">{p.low_stock_threshold}</td>
                            <td className="py-3 px-4">
                              {p.is_out_of_stock ? (
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-coral-50 text-coral-600 border border-coral-200">
                                  <AlertCircle size={12} className="mr-1" /> Out of Stock
                                </span>
                              ) : p.is_low_stock ? (
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                  <AlertCircle size={12} className="mr-1" /> Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  Adequate
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="py-8 text-center text-sage-400 italic">No active products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && data.suppliers && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-sage-50 border-y border-sage-200 text-sage-500 text-sm">
                      <tr>
                        <th className="py-3 px-4 font-medium">Supplier Name</th>
                        <th className="py-3 px-4 font-medium text-center">Total Deliveries</th>
                        <th className="py-3 px-4 font-medium text-center">Total Units Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage-100">
                      {data.suppliers.length > 0 ? (
                        data.suppliers.map((s) => (
                          <tr key={s.supplier_id} className="hover:bg-sage-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-teal-700">{s.name}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-sm font-bold bg-teal-100 text-teal-700">
                                {s.total_deliveries}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-sage-600 font-bold">{s.total_units_received}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="py-8 text-center text-sage-400 italic">No supplier data found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
