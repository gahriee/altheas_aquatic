import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Save, Truck, Package, Hash, Coins, StickyNote, Loader2, AlertCircle } from 'lucide-react';
import { getSuppliers } from '../../../api/suppliers';
import { recordDelivery } from '../../../api/deliveries';
import { getAllProducts } from '../../../api/products';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Select from '../../../components/ui/Select';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSupplierId = queryParams.get('supplier_id');

  const [formData, setFormData] = useState({
    supplier_id: initialSupplierId || '',
    product_id: '',
    qty_received: '',
    unit_cost: '',
    notes: ''
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setFetching(true);
      const [suppliersData, productsData] = await Promise.all([
        getSuppliers(),
        getAllProducts()
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load form data');
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      await recordDelivery(formData);

      navigate('/admin/suppliers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-teal-600" size={32} />
        <p className="text-sage-400 font-bold uppercase text-[10px] tracking-widest">Hydrating Form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/suppliers" 
            className="p-3 bg-white border border-sage-100 rounded-2xl text-sage-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-sage-800 tracking-tight">Record Delivery</h1>
            <p className="text-sm text-sage-400 font-medium">Log incoming stock and update inventory automatically</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-coral-50 text-coral-500 rounded-2xl border border-coral-100 flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="font-bold text-sm tracking-tight">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-sage-100 shadow-xl shadow-teal-500/5 overflow-hidden">
        <div className="p-8 md:p-12 space-y-12">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <Truck size={18} />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Source</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_id" required>Select Supplier</Label>
                <Select 
                  id="supplier_id"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  placeholder="Which partner sent this?"
                  options={suppliers.map(s => ({ label: s.name, value: s.supplier_id }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <Package size={18} />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Inventory Item</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_id" required>Select Product</Label>
                <Select 
                  id="product_id"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  placeholder="Which item is arriving?"
                  options={products.map(p => ({ label: p.name, value: p.product_id }))}
                  required
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <Hash size={18} />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Quantity</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty_received" required>Quantity Received</Label>
                <Input 
                  id="qty_received"
                  name="qty_received"
                  type="number"
                  min="1"
                  value={formData.qty_received}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="bg-sage-50/50"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-teal-600">
                <Coins size={18} />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Cost (Optional)</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_cost">Unit Cost (₱)</Label>
                <Input 
                  id="unit_cost"
                  name="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="bg-sage-50/50"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600">
              <StickyNote size={18} />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Additional Info</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Notes</Label>
              <textarea 
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Batch number, condition details, etc."
                rows={3}
                className="w-full px-5 py-4 bg-sage-50/50 border border-sage-100 rounded-2xl text-sage-600 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-mint-300 focus:bg-white resize-none"
              />
            </div>
          </section>
        </div>

        <div className="px-8 md:px-12 py-8 bg-sage-50/50 border-t border-sage-100 flex items-center justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="flex items-center gap-2 py-4 px-10 shadow-lg shadow-teal-500/20 min-w-[200px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Confirm Delivery
          </Button>
        </div>
      </form>
    </div>
  );
}
