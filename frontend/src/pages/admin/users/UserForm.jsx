import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createUser, updateUser, fetchUsers } from '../../../api/users';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Label from '../../../components/ui/Label';
import Select from '../../../components/ui/Select';

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff'
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadUser() {
    try {
      setLoading(true);
      const data = await fetchUsers();
      const user = data.users.find(u => u.id === parseInt(id, 10));
      
      if (!user) {
        toast.error('User not found');
        navigate('/admin/users');
        return;
      }
      
      setFormData({
        email: user.email,
        password: '',
        role: user.role_label
      });
    } catch (err) {
      // apiFetch handles the error toast
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!isEditMode && !formData.email) {
      toast.error('Email is required');
      return false;
    }
    
    // Basic email validation
    if (!isEditMode && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Invalid email format');
      return false;
    }

    if (!isEditMode && (!formData.password || formData.password.length < 8)) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    if (isEditMode && formData.password && formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        // Only send password if it's not empty
        const payload = { role: formData.role };
        if (formData.password) {
          payload.password = formData.password;
        }
        await updateUser(id, payload);
        // apiFetch handles the success toast
      } else {
        await createUser({
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        // apiFetch handles the success toast
      }
      
      navigate('/admin/users');
    } catch (err) {
      // apiFetch handles the error toast
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sage-500 font-medium animate-pulse">Loading user details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/users"
            className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-display text-sage-800 tracking-tight">
              {isEditMode ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-sage-500 text-sm mt-1">
              {isEditMode ? 'Update user role or password' : 'Create a new admin or staff account'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-sage-100 shadow-sm space-y-6">
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" required={!isEditMode}>Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="pl-11"
                required={!isEditMode}
                readOnly={isEditMode}
                disabled={isEditMode}
              />
            </div>
            {isEditMode && <p className="text-xs text-sage-400 mt-1">Email cannot be changed.</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" required={!isEditMode}>
              {isEditMode ? 'New Password' : 'Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? "Leave blank to keep current password" : "Minimum 8 characters"}
                className="pl-11 pr-12"
                required={!isEditMode}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" required>Role</Label>
            <div className="relative">
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full"
                required
                options={[
                  { label: 'Administrator (Full Access)', value: 'admin' },
                  { label: 'Staff (Limited Access)', value: 'staff' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-sage-100">
          <Button type="submit" variant="primary" loading={submitting} className="w-full sm:w-auto">
            <Save size={18} />
            {isEditMode ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </div>
  );
}
