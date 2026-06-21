import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Truck, Mail, Phone, MapPin, User, Info, X, History as HistoryIcon } from 'lucide-react';
import { getSuppliers } from '../../../api/suppliers';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import DataTable from '../../../components/admin/DataTable';
import Tooltip from '../../../components/ui/Tooltip';
import { useDebounce } from '../../../hooks/useDebounce';

import SupplierDeliveryTable from './SupplierDeliveryTable';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [suppliers, debouncedSearch]);

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm relative group-hover:scale-105 transition-transform">
            <Truck size={20} />
            {s.delivery_count > 0 && (
              <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
                {s.delivery_count}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold font-display text-sage-800 tracking-tight">{s.name}</p>
              {s.delivery_count > 0 && (
                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-600 text-[8px] font-bold uppercase tracking-tighter rounded-md border border-teal-100">
                  {s.delivery_count} Deliveries
                </span>
              )}
            </div>
            <p className="text-[10px] text-sage-400 font-semibold uppercase tracking-wider">ID: #{s.supplier_id}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact_person',
      label: 'Contact',
      sortable: true,
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-sage-700 font-bold text-sm">{s.contact_person || 'N/A'}</span>
          <span className="text-sage-400 text-xs font-medium">{s.email || ''}</span>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (s) => <span className="text-sage-500 font-semibold">{s.phone || 'N/A'}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <Tooltip text="Record Delivery">
            <Link 
              to={`/admin/suppliers/delivery?supplier_id=${s.supplier_id}`}
              className="p-2 text-sage-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus size={18} />
            </Link>
          </Tooltip>
          <Tooltip text="Edit Supplier">
            <Link 
              to={`/admin/suppliers/edit/${s.supplier_id}`}
              className="p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit3 size={18} />
            </Link>
          </Tooltip>
        </div>
      )
    }
  ];

  const isSearching = searchTerm !== debouncedSearch;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl xl:text-4xl font-bold font-display text-teal-600 tracking-tight">Suppliers</h1>
          <p className="text-sage-500 text-sm xl:text-lg mt-1">Manage your aquatic livestock providers and deliveries.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300 group-focus-within:text-teal-500 transition-colors" size={18} />
          <Input 
            placeholder="Search suppliers by name or email..." 
            className="pl-12 bg-white" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sage-300 hover:text-coral-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <Link to="/admin/suppliers/delivery" className="flex-1 sm:flex-none">
            <Button variant="secondary">
              <Plus size={20} />
              Record Delivery
            </Button>
          </Link>
          <Link to="/admin/suppliers/add" className="flex-1 sm:flex-none">
            <Button variant="primary">
              <Plus size={20} />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={filteredSuppliers}
        loading={loading || isSearching}
        renderExpanded={(s) => (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-600">
                  <Info size={18} />
                  <h4 className="font-semibold uppercase text-[10px] tracking-widest">Supplier Details</h4>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-sage-300 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sage-600 font-medium leading-relaxed">{s.address || 'No address provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User size={18} className="text-sage-300 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest mb-1">Contact Person</p>
                        <p className="text-sage-600 font-medium">{s.contact_person || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-sage-300 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-sage-600 font-medium break-all">{s.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-600">
                  <Mail size={18} />
                  <h4 className="font-semibold uppercase text-[10px] tracking-widest">Communication</h4>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-sage-300 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest mb-1">Phone Number</p>
                      <p className="text-sage-600 font-medium">{s.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <a 
                      href={`mailto:${s.email}`} 
                      className={`flex-1 flex items-center justify-center gap-2 py-3 bg-teal-50 text-teal-600 rounded-xl font-semibold text-xs hover:bg-teal-100 transition-colors ${!s.email && 'pointer-events-none opacity-50'}`}
                    >
                      <Mail size={14} /> Send Email
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-teal-600">
                <HistoryIcon size={18} />
                <h4 className="font-semibold uppercase text-[10px] tracking-widest">Recent Deliveries</h4>
              </div>
              <SupplierDeliveryTable supplierId={s.supplier_id} />
            </div>
          </div>
        )}
      />
    </div>
  );
}
