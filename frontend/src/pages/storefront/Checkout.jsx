import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, Loader2, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { createPaymentIntent } from '../../api/payments';
import { regions, provincesByCode, cities, barangays } from 'select-philippines-address';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';

/**
 * ----------------------------------------
 * Checkout Page
 * ----------------------------------------
 * Collects customer information and initiates the PayMongo GCash flow.
 */
export default function Checkout() {
  const { items, total, count, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    street: '',
    regionCode: '', region: '',
    provinceCode: '', province: '',
    cityCode: '', city: '',
    barangayCode: '', barangay: ''
  });

  const [regionOptions, setRegionOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);

  useEffect(() => {
    regions().then(response => {
      setRegionOptions(response.map(r => ({ label: r.region_name, value: r.region_code })));
    });
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val || 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e) => {
    const code = e.target.value;
    const label = regionOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, regionCode: code, region: label, provinceCode: '', province: '', cityCode: '', city: '', barangayCode: '', barangay: '' }));
    provincesByCode(code).then(res => {
      setProvinceOptions(res.map(p => ({ label: p.province_name, value: p.province_code })));
      setCityOptions([]);
      setBarangayOptions([]);
    });
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const label = provinceOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, provinceCode: code, province: label, cityCode: '', city: '', barangayCode: '', barangay: '' }));
    cities(code).then(res => {
      setCityOptions(res.map(c => ({ label: c.city_name, value: c.city_code })));
      setBarangayOptions([]);
    });
  };

  const handleCityChange = (e) => {
    const code = e.target.value;
    const label = cityOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, cityCode: code, city: label, barangayCode: '', barangay: '' }));
    barangays(code).then(res => {
      setBarangayOptions(res.map(b => ({ label: b.brgy_name, value: b.brgy_code })));
    });
  };

  const handleBarangayChange = (e) => {
    const code = e.target.value;
    const label = barangayOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, barangayCode: code, barangay: label }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullAddress = [
      formData.street,
      formData.barangay,
      formData.city,
      formData.province,
      formData.region
    ].filter(Boolean).join(', ');

    try {
      const response = await createPaymentIntent({
        customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            notes: formData.notes,
            address: fullAddress
        },
        items: items.map(item => ({
          product_id: item.id,
          qty: item.qty,
          name: item.name
        }))
      });

      if (response.redirect_url) {
        // Store intent ID for the confirmation page polling
        if (response.payment_intent_id) {
          sessionStorage.setItem('last_payment_intent_id', response.payment_intent_id);
        }
        
        // Clear cart local state before redirecting
        await clearCart();
        window.location.href = response.redirect_url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-sage-400 hover:text-teal-600 font-semibold text-xs uppercase tracking-widest transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Selection
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Customer Information Form */}
        <div className="flex-1 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-display text-sage-800 tracking-tight">Personal Details</h1>
            <p className="text-sage-400 font-medium">We need this information to process your aquatic collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-sage-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Juan Dela Cruz"
                    required
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
                    placeholder="juan@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0917XXXXXXX"
                  required
                />
              </div>

                {/* Delivery Address Section */}
                <div className="pt-6 border-t border-sage-50 space-y-6">
                  <h3 className="text-lg font-bold font-display text-sage-800 flex items-center gap-2">
                    <MapPin size={20} className="text-teal-500" />
                    Delivery Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="regionCode">Region</Label>
                      <Select
                        id="regionCode"
                        name="regionCode"
                        value={formData.regionCode}
                        onChange={handleRegionChange}
                        options={regionOptions}
                        placeholder="Select Region"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provinceCode">Province</Label>
                      <Select
                        id="provinceCode"
                        name="provinceCode"
                        value={formData.provinceCode}
                        onChange={handleProvinceChange}
                        options={provinceOptions}
                        placeholder="Select Province"
                        required
                        className={formData.regionCode ? '' : 'opacity-50 pointer-events-none'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cityCode">City / Municipality</Label>
                      <Select
                        id="cityCode"
                        name="cityCode"
                        value={formData.cityCode}
                        onChange={handleCityChange}
                        options={cityOptions}
                        placeholder="Select City"
                        required
                        className={formData.provinceCode ? '' : 'opacity-50 pointer-events-none'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barangayCode">Barangay</Label>
                      <Select
                        id="barangayCode"
                        name="barangayCode"
                        value={formData.barangayCode}
                        onChange={handleBarangayChange}
                        options={barangayOptions}
                        placeholder="Select Barangay"
                        required
                        className={formData.cityCode ? '' : 'opacity-50 pointer-events-none'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street, Building, House Number</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="e.g. 123 Aquatic St., Building Name, Unit 4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Notes for our logistics team..."
                      rows={3}
                    />
                  </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-sage-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-sage-800">Payment Method</h3>
                  <p className="text-sage-400 text-xs font-semibold uppercase tracking-widest">GCash (via PayMongo)</p>
                </div>
              </div>
              <p className="text-sage-500 text-sm leading-relaxed mb-6">
                You will be redirected to the secure PayMongo checkout portal to complete your transaction via GCash.
              </p>
              
              <Button 
                type="submit" 
                className="w-full py-6 text-xl group" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={24} />
                    Processing collection...
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    Pay {formatCurrency(total)}
                    <ShieldCheck className="group-hover:scale-110 transition-transform" size={24} />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Preview */}
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <div className="bg-white p-8 rounded-[48px] border border-sage-100 shadow-sm divide-y divide-sage-50">
            <h2 className="text-xl font-bold font-display text-sage-800 pb-6 flex items-center gap-3">
              <ShoppingBag size={20} className="text-teal-500" />
              Order Preview
            </h2>
            
            <div className="py-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-sage-50 border border-sage-100 shrink-0">
                    <img 
                      src={item.image_path ? `/image.php?file=${item.image_path}` : 'https://placehold.co/100x100'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-display text-sage-800 truncate">{item.name}</p>
                    <p className="text-xs font-semibold text-sage-400">{item.qty} × {formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex justify-between items-center text-sage-400 font-semibold text-sm">
                <span>Subtotal</span>
                <span className="text-sage-800">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center text-sage-400 font-semibold text-sm">
                <span>Shipping</span>
                 <span className="text-teal-600 uppercase tracking-widest text-[10px] font-bold">Free</span>
              </div>
              <div className="pt-4 flex justify-between items-end">
                <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-bold font-display text-sage-800 tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
