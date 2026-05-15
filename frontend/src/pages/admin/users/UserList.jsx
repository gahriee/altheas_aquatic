import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, UserX, UserCheck, ShieldAlert, ShieldCheck, Mail, Calendar, Clock, AlertCircle } from 'lucide-react';
import { fetchUsers, deactivateUser, reactivateUser } from '../../../api/users';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/admin/DataTable';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Tooltip from '../../../components/ui/Tooltip';

export default function UserList() {
  const [data, setData] = useState({ users: [], counts: { all: 0, admin_staff: 0, customer: 0 } });
  const [loading, setLoading] = useState(true);
  const [deactivateId, setDeactivateId] = useState(null);
  const [reactivateId, setReactivateId] = useState(null);
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

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await deactivateUser(deactivateId);
      loadUsers();
    } catch (err) {
      // apiFetch handles the error toast
    } finally {
      setDeactivateId(null);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await reactivateUser(id);
      loadUsers();
    } catch (err) {
      // apiFetch handles the error toast
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (u) => {
        const isDeactivated = u.status == 2;
        if (isDeactivated) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border bg-coral-50 text-coral-500 border-coral-200">
              Deactivated
            </span>
          );
        }
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
            u.verified == 1 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            {u.verified == 1 ? 'Verified' : 'Unverified'}
          </span>
        );
      }
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
      render: (u) => {
        const isDeactivated = u.status == 2;
        return (
          <div className="flex justify-end gap-1">
            {isDeactivated ? (
              currentUser?.id !== u.id && (
                <Tooltip text="Reactivate User">
                  <button 
                    onClick={() => setReactivateId(u.id)}
                    className="p-2 text-sage-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <UserCheck size={18} />
                  </button>
                </Tooltip>
              )
            ) : (
              <>
                <Tooltip text="Edit User">
                  <Link 
                    to={`/admin/users/edit/${u.id}`}
                    className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </Link>
                </Tooltip>
                
                {currentUser?.id !== u.id && (
                  <Tooltip text="Deactivate User">
                    <button 
                      onClick={() => setDeactivateId(u.id)}
                      className="p-2 text-sage-400 hover:text-coral-500 hover:bg-coral-50 rounded-xl transition-all"
                    >
                      <UserX size={18} />
                    </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        );
      }
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
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will no longer be able to log in, but their account data will be preserved."
        confirmText="Deactivate"
        isDestructive={true}
      />

      <ConfirmDialog
        isOpen={!!reactivateId}
        onClose={() => setReactivateId(null)}
        onConfirm={async () => { await handleReactivate(reactivateId); setReactivateId(null); }}
        title="Reactivate User"
        message="Are you sure you want to reactivate this user? They will be able to log in again."
        confirmText="Reactivate"
        isDestructive={false}
      />
    </div>
  );
}
