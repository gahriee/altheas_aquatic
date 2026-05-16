import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile, updateProfile } from '../../api/profile';
import { regions, provincesByCode, cities, barangays } from 'select-philippines-address';
import { toast } from 'react-hot-toast';
import { Loader2, MapPin, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Select from '../../components/ui/Select';

/**
 * My Profile page — allows the customer to view and update their personal
 * information and default delivery address. Pre-fills from existing profile data.
 */
export default function MyProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    display_name: '',
    email: user?.email || '',
    phone: '',
    street: '',
    region_code: '', region: '',
    province_code: '', province: '',
    city_code: '', city: '',
    barangay_code: '', barangay: ''
  });

  const [regionOptions, setRegionOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);

  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    regions().then(response => {
      setRegionOptions(response.map(r => ({ label: r.region_name, value: r.region_code })));
    });

    const loadProfile = async () => {
      try {
        const response = await fetchProfile();
        if (response?.profile) {
          const profile = response.profile;
          setFormData({
            display_name: profile.display_name || '',
            email: profile.email || user?.email || '',
            phone: profile.phone || '',
            street: profile.street || '',
            region_code: profile.region_code || '',
            region: profile.region || '',
            province_code: profile.province_code || '',
            province: profile.province || '',
            city_code: profile.city_code || '',
            city: profile.city || '',
            barangay_code: profile.barangay_code || '',
            barangay: profile.barangay || '',
          });

          if (profile.region_code) {
            const pRes = await provincesByCode(profile.region_code);
            setProvinceOptions(pRes.map(p => ({ label: p.province_name, value: p.province_code })));
          }
          if (profile.province_code) {
            const cRes = await cities(profile.province_code);
            setCityOptions(cRes.map(c => ({ label: c.city_name, value: c.city_code })));
          }
          if (profile.city_code) {
            const bRes = await barangays(profile.city_code);
            setBarangayOptions(bRes.map(b => ({ label: b.brgy_name, value: b.brgy_code })));
          }
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  /**
   * Generic form field change handler.
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
    setFormData(prev => ({ ...prev, region_code: code, region: label, province_code: '', province: '', city_code: '', city: '', barangay_code: '', barangay: '' }));
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
    setFormData(prev => ({ ...prev, province_code: code, province: label, city_code: '', city: '', barangay_code: '', barangay: '' }));
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
    setFormData(prev => ({ ...prev, city_code: code, city: label, barangay_code: '', barangay: '' }));
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
    setFormData(prev => ({ ...prev, barangay_code: code, barangay: label }));
  };

  /**
   * Submits updated profile data to the API and shows a toast notification.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error('Failed to update profile', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-teal-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 max-w-4xl mx-auto px-4 py-4 sm:py-8">
      <div className="space-y-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold font-display text-sage-800 tracking-tight">My Profile</h1>
        <p className="text-sm sm:text-base text-sage-400 font-medium">Manage your personal information and default delivery address.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-sage-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold font-display text-sage-800 flex items-center gap-2">
            <User size={20} className="text-teal-500" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400">
                  <Mail size={16} />
                </span>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="pl-12 bg-sage-50 text-sage-500 border-sage-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
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
                className="pl-12"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-sage-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold font-display text-sage-800 flex items-center gap-2">
            <MapPin size={20} className="text-teal-500" />
            Default Delivery Address
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="region_code">Region</Label>
              <Select
                id="region_code"
                name="region_code"
                value={formData.region_code}
                onChange={handleRegionChange}
                options={regionOptions}
                placeholder="Select Region"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province_code">Province</Label>
              <Select
                id="province_code"
                name="province_code"
                value={formData.province_code}
                onChange={handleProvinceChange}
                options={provinceOptions}
                placeholder="Select Province"
                className={formData.region_code ? '' : 'opacity-50 pointer-events-none'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city_code">City / Municipality</Label>
              <Select
                id="city_code"
                name="city_code"
                value={formData.city_code}
                onChange={handleCityChange}
                options={cityOptions}
                placeholder="Select City"
                className={formData.province_code ? '' : 'opacity-50 pointer-events-none'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barangay_code">Barangay</Label>
              <Select
                id="barangay_code"
                name="barangay_code"
                value={formData.barangay_code}
                onChange={handleBarangayChange}
                options={barangayOptions}
                placeholder="Select Barangay"
                className={formData.city_code ? '' : 'opacity-50 pointer-events-none'}
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
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full md:w-auto px-12 py-4" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
