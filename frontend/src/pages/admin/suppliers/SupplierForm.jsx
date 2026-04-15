import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Truck, User, Phone, Mail, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { createSupplier, updateSupplier, getSuppliers } from '../../../api/suppliers';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchSupplier();
    }
  }, [id]);

  async function fetchSupplier() {
    try {
      setFetching(true);
      // We don't have a single fetchById endpoint in suppliers.js yet, 
      // but we can filter from all or I'll just use the list.
      // Actually, I should probably check if I added getSupplier to suppliers.js
      // I did: getSupplier(id) exists in my plan. Let's check if I implemented it.
      // Wait, I only updated the routes. Let me check suppliers.js content again.
      const suppliers = await getSuppliers();
      const supplier = suppliers.find(s => s.supplier_id.toString() === id);
      
      if (supplier) {
        setFormData({
          name: supplier.name,
          contact_person: supplier.contact_person || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || ''
        });
      } else {
        setError('Supplier not found');
      }
    } catch (err) {
      setError('Failed to load supplier details');
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

      if (isEdit) {
        await updateSupplier(id, formData);
      } else {
        await createSupplier(formData);
      }

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
        <p className="text-sage-400 font-bold uppercase text-[10px] tracking-widest">Loading Supplier...</p>
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
            <h1 className="text-2xl font-black text-sage-800 tracking-tight">
              {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
            </h1>
            <p className="text-sm text-sage-400 font-medium">
              {isEdit ? 'Update existing partner details' : 'Register a new aquatic species partner'}
            </p>
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
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600">
              <Truck size={18} />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Business Identity</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" required>Supplier Name</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Oceanic Wonders Ltd."
                required
                className="bg-sage-50/50"
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600">
              <User size={18} />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Primary Contact</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Name</Label>
                <Input 
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="bg-sage-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@supplier.com"
                  className="bg-sage-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-sage-50/50"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600">
              <MapPin size={18} />
              <h3 className="font-bold uppercase text-[10px] tracking-widest">Location</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <textarea 
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Business location details..."
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
            {isEdit ? 'Update Supplier' : 'Register Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
}
