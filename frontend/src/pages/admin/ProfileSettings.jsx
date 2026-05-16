import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { changePassword } from '../../api/auth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('All password fields are required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await changePassword(formData.currentPassword, formData.newPassword, formData.confirmPassword);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // apiFetch handles the success toast
    } catch (err) {
      // apiFetch handles the error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl xl:text-2xl font-bold font-display text-sage-800 tracking-tight">Profile Settings</h2>
        <p className="text-sage-500 text-sm mt-1">Manage your account details and security settings.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-sage-100 shadow-sm space-y-8">
        
        {/* Account Info Section */}
        <div>
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield size={16} className="text-teal-500" />
            Account Details
          </h3>
          <div className="bg-sage-50 rounded-xl p-4 border border-sage-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-sage-400 font-semibold uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-sage-800">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-sage-400 font-semibold uppercase tracking-wider mb-1">Role</p>
                <p className="font-medium text-sage-800 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-sage-100" />

        {/* Security Section */}
        <div>
          <h3 className="text-sm font-bold text-sage-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Lock size={16} className="text-teal-500" />
            Change Password
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" required>Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" required>New Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="pl-11 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" required>Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-teal-600 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" loading={submitting} className="w-full sm:w-auto">
                <Save size={18} />
                Change Password
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
