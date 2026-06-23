import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, Loader2, MapPin, Banknote } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPaymentIntent } from '../../api/payments';
import { submitCodOrder } from '../../api/orders';
import { fetchProfile } from '../../api/profile';
import { formatCurrency } from '../../utils/format';
import { regions, provincesByCode, cities, barangays } from 'select-philippines-address';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import QRCodeModal from '../../components/storefront/QRCodeModal';

/**
 * Checkout page — collects customer information (name, email, phone, address)
 * and initiates the PayMongo GCash payment flow. Pre-fills data from the
 * user's saved profile when available.
 */
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPayload, setQrPayload] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('qrph');
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

    if (user) {
      fetchProfile().then(response => {
        if (response?.profile) {
          const profile = response.profile;
          setFormData(prev => ({
            ...prev,
            name: profile.display_name || prev.name,
            email: profile.email || user?.email || prev.email,
            phone: profile.phone || prev.phone,
            street: profile.street || prev.street,
            regionCode: profile.region_code || prev.regionCode,
            region: profile.region || prev.region,
            provinceCode: profile.province_code || prev.provinceCode,
            province: profile.province || prev.province,
            cityCode: profile.city_code || prev.cityCode,
            city: profile.city || prev.city,
            barangayCode: profile.barangay_code || prev.barangayCode,
            barangay: profile.barangay || prev.barangay
          }));

          if (profile.region_code) {
            provincesByCode(profile.region_code).then(res => setProvinceOptions(res.map(p => ({ label: p.province_name, value: p.province_code }))));
          }
          if (profile.province_code) {
            cities(profile.province_code).then(res => setCityOptions(res.map(c => ({ label: c.city_name, value: c.city_code }))));
          }
          if (profile.city_code) {
            barangays(profile.city_code).then(res => setBarangayOptions(res.map(b => ({ label: b.brgy_name, value: b.brgy_code }))));
          }
        }
      }).catch(err => console.error('Failed to pre-fill profile', err));
    }
  }, [user]);


  /**
   * Generic form field change handler for text/email inputs.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Strips non-digit characters, removes leading 0, formats as xxx-xxx-xxxx.
   */
  const handlePhoneChange = (e) => {
    let raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.startsWith('0')) {
      raw = raw.substring(1);
    }
    raw = raw.slice(0, 10);
    let formatted = '';
    if (raw.length > 6) {
      formatted = raw.slice(0, 3) + '-' + raw.slice(3, 6) + '-' + raw.slice(6);
    } else if (raw.length > 3) {
      formatted = raw.slice(0, 3) + '-' + raw.slice(3);
    } else {
      formatted = raw;
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  /**
   * Handles region dropdown change, resets dependent address fields.
   */
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

  /**
   * Handles province dropdown change, resets city and barangay.
   */
  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const label = provinceOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, provinceCode: code, province: label, cityCode: '', city: '', barangayCode: '', barangay: '' }));
    cities(code).then(res => {
      setCityOptions(res.map(c => ({ label: c.city_name, value: c.city_code })));
      setBarangayOptions([]);
    });
  };

  /**
   * Handles city dropdown change, resets barangay.
   */
  const handleCityChange = (e) => {
    const code = e.target.value;
    const label = cityOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, cityCode: code, city: label, barangayCode: '', barangay: '' }));
    barangays(code).then(res => {
      setBarangayOptions(res.map(b => ({ label: b.brgy_name, value: b.brgy_code })));
    });
  };

  /**
   * Handles barangay dropdown change.
   */
  const handleBarangayChange = (e) => {
    const code = e.target.value;
    const label = barangayOptions.find(o => o.value === code)?.label || '';
    setFormData(prev => ({ ...prev, barangayCode: code, barangay: label }));
  };

  /**
   * Submits the checkout form: builds full address, calls createPaymentIntent,
   * clears the cart, and redirects to PayMongo checkout URL.
   */
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
      if (paymentMethod === 'cod') {
        const response = await submitCodOrder({
          customer: {
              name: formData.name,
              email: formData.email,
              phone: '+63' + formData.phone.replace(/-/g, ''),
              notes: formData.notes,
              address: fullAddress
          },
          items: items.map(item => ({
            product_id: item.id,
            qty: item.qty,
            name: item.name
          }))
        });

        setIsSuccess(true);
        await clearCart();
        navigate(`/order-confirmation/${response.order_id}`);
        return;
      }

      const response = await createPaymentIntent({
        customer: {
            name: formData.name,
            email: formData.email,
            phone: '+63' + formData.phone.replace(/-/g, ''),
            notes: formData.notes,
            address: fullAddress
        },
        items: items.map(item => ({
          product_id: item.id,
          qty: item.qty,
          name: item.name
        }))
      });

      if (response.checkout_type === 'qrph') {
        setQrPayload({
          qrData: response.qr_data,
          qrMimeType: response.qr_mime_type,
          expiresAt: response.qr_expires_at,
          orderId: response.order_id,
          orderNumber: response.order_number,
          paymentIntentId: response.payment_intent_id
        });
        setShowQRModal(true);
      } else if (response.redirect_url) {
        if (response.payment_intent_id) {
          sessionStorage.setItem('last_payment_intent_id', response.payment_intent_id);
        }
        
        await clearCart();
        window.location.href = response.redirect_url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isSuccess, setIsSuccess] = useState(false);

  const handlePaymentSuccess = async () => {
    setIsSuccess(true);
    await clearCart();
    navigate(`/order-confirmation/${qrPayload.orderId}?pi=${qrPayload.paymentIntentId}`);
  };

  const handleModalClose = () => {
    setShowQRModal(false);
    setLoading(false);
  };

  useEffect(() => {
    if (!isSuccess && (!items || items.length === 0)) {
      navigate('/cart');
    }
  }, [items, navigate, isSuccess]);

  if (!isSuccess && (!items || items.length === 0)) {
    return null;
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto px-4 py-4 sm:py-8">
      {showQRModal && qrPayload && (
        <QRCodeModal 
          {...qrPayload}
          onClose={handleModalClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-sage-400 hover:text-teal-600 font-semibold text-xs uppercase tracking-widest transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Selection
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold font-display text-sage-800 tracking-tight">Personal Details</h1>
            <p className="text-sm sm:text-base text-sage-400 font-medium">We need this information to process your aquatic collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-sage-100 shadow-sm space-y-6">
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
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-500 font-semibold text-sm pointer-events-none select-none">+63</span>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="9XX-XXX-XXXX"
                    maxLength={12}
                    required
                    className="pl-12"
                  />
                </div>
              </div>

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

            <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-sage-100 shadow-sm">
              <h3 className="text-lg font-bold font-display text-sage-800 mb-4">Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div 
                  onClick={() => setPaymentMethod('qrph')}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex gap-4 transition-colors ${paymentMethod === 'qrph' ? 'border-teal-500 bg-teal-50/50' : 'border-sage-100 hover:border-sage-200'}`}
                >
                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 mt-0.5 flex items-center justify-center ${paymentMethod === 'qrph' ? 'border-teal-500' : 'border-sage-300'}`}>
                    {paymentMethod === 'qrph' && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sage-800 font-bold font-display mb-1">
                      <CreditCard size={18} className="text-teal-600" />
                      Online Payment
                    </div>
                    <p className="text-xs text-sage-500 font-medium leading-relaxed">
                      GCash, Maya, or QR Ph banking app
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`cursor-pointer rounded-2xl border-2 p-4 flex gap-4 transition-colors ${paymentMethod === 'cod' ? 'border-teal-500 bg-teal-50/50' : 'border-sage-100 hover:border-sage-200'}`}
                >
                  <div className={`w-5 h-5 shrink-0 rounded-full border-2 mt-0.5 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-teal-500' : 'border-sage-300'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sage-800 font-bold font-display mb-1">
                      <Banknote size={18} className="text-teal-600" />
                      Cash on Delivery
                    </div>
                    <p className="text-xs text-sage-500 font-medium leading-relaxed">
                      Pay when you receive your order
                    </p>
                  </div>
                </div>
              </div>
              
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
                    {paymentMethod === 'cod' ? (
                      <>
                        Place Order — {formatCurrency(total)}
                        <ShoppingBag className="group-hover:scale-110 transition-transform" size={24} />
                      </>
                    ) : (
                      <>
                        Pay {formatCurrency(total)}
                        <ShieldCheck className="group-hover:scale-110 transition-transform" size={24} />
                      </>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[48px] border border-sage-100 shadow-sm divide-y divide-sage-50">
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
                <span className="text-2xl sm:text-3xl font-bold font-display text-sage-800 tracking-tight">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
