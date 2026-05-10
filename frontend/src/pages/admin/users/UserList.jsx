import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, ShieldAlert, ShieldCheck, Mail, Calendar, Clock, AlertCircle } from 'lucide-react';
import { fetchUsers, deleteUser } from '../../../api/users';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/admin/DataTable';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Tooltip from '../../../components/ui/Tooltip';

export default function UserList() {
  const [data, setData] = useState({ users: [], counts: { all: 0, admin_staff: 0, customer: 0 } });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState('admin_staff');
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetchUsers(activeTab);
      setData(res);
    } catch (err) {
      // apiFetch handles the error toast
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      // apiFetch handles the success toast
      loadUsers();
    } catch (err) {
      // apiFetch handles the error toast
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'admin_staff', label: 'Admin & Staff' },
    { id: 'customer', label: 'Customers' }
  ];

  const columns = [
    {
      key: 'email',
      label: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center text-sage-500 border border-sage-100 shadow-sm relative">
            <Mail size={18} />
          </div>
          <div>
            <p className="font-bold text-sage-800 tracking-tight">{u.email}</p>
            {u.username && <p className="text-xs text-sage-400 font-medium">@{u.username}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'role_label',
      label: 'Role',
      sortable: true,
      render: (u) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
          u.role_label === 'admin' 
            ? 'bg-teal-50 text-teal-600 border-teal-200' 
            : u.role_label === 'staff'
            ? 'bg-mint-50 text-mint-700 border-mint-200'
            : 'bg-sage-50 text-sage-500 border-sage-200'
        }`}>
          {u.role_label === 'admin' ? <ShieldAlert size={12} /> : u.role_label === 'staff' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
          {u.role_label}
        </span>
      )
    },
    {
      key: 'verified',
      label: 'Status',
      sortable: true,
      render: (u) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
          u.verified == 1 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
            : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}>
          {u.verified == 1 ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      key: 'registered',
      label: 'Registered',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2 text-sage-600 text-sm">
          <Calendar size={14} className="text-sage-400" />
          {formatDate(u.registered)}
        </div>
      )
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2 text-sage-600 text-sm">
          <Clock size={14} className="text-sage-400" />
          {formatDate(u.last_login)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Tooltip text="Edit User">
            <Link 
              to={`/admin/users/edit/${u.id}`}
              className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
            >
              <Edit3 size={18} />
            </Link>
          </Tooltip>
          
          {currentUser?.id !== u.id && (
            <Tooltip text="Delete User">
              <button 
                onClick={() => setDeleteId(u.id)}
                className="p-2 text-sage-400 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-display text-teal-600 tracking-tight">Users</h1>
          <p className="text-sage-500 text-lg mt-1">Manage all system accounts and customer profiles</p>
        </div>
      </div>

      {/* Role Tabs and Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-end border-b border-sage-100 gap-4">
        <div className="flex overflow-x-auto pb-1 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 translate-y-[-2px]' 
                  : 'text-sage-400 hover:text-teal-500 hover:bg-teal-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-sage-100 text-sage-500'
              }`}>
                {data.counts?.[tab.id] || 0}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mb-2">
          <Link to="/admin/users/add">
            <Button variant="primary" className="shadow-lg shadow-teal-500/20">
              <Plus size={20} className="mr-1" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={data.users}
        loading={loading}
        emptyMessage={activeTab === 'customer' ? 'No Customers' : 'No Admin Users'}
        emptySubMessage={activeTab === 'customer' 
          ? 'You don\'t have any registered customers yet.' 
          : 'No administrator or staff accounts were found.'}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        isDestructive={true}
      />
    </div>
  );
}
