import { useState, useEffect, useMemo } from 'react';
import { fetchAuditLogs } from '../../../api/auditLogs';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight as NavChevronRight,
  X,
  Loader2,
  PackageSearch
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Tooltip from '../../../components/ui/Tooltip';
import { useDebounce } from '../../../hooks/useDebounce';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 25;

  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [expandedRows, setExpandedRows] = useState(new Set());

  const debouncedSearch = useDebounce(searchFilter, 500);

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, resourceFilter, debouncedSearch, fromDate, toDate]);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({
        page,
        per_page: perPage,
        action: actionFilter,
        resource_type: resourceFilter,
        search: debouncedSearch,
        from: fromDate,
        to: toDate
      });
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const clearFilters = () => {
    setActionFilter('');
    setResourceFilter('');
    setSearchFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'create': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'update': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'delete': return 'bg-coral-50 text-coral-500 border-coral-100';
      default: return 'bg-sage-50 text-sage-500 border-sage-100';
    }
  };

  const hasActiveFilters = actionFilter || resourceFilter || searchFilter || fromDate || toDate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-display text-teal-500 tracking-tight flex items-center gap-2">
            <ClipboardList size={28} />
            Audit Logs
          </h1>
          <p className="text-sage-500 text-lg mt-1">Track all system changes and admin actions</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-2xl border border-sage-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <Select 
            className="w-full sm:w-40"
            options={[
              { label: 'All Actions', value: '' },
              { label: 'Create', value: 'create' },
              { label: 'Update', value: 'update' },
              { label: 'Delete', value: 'delete' }
            ]}
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          />

          <Select 
            className="w-full sm:w-48"
            options={[
              { label: 'All Resources', value: '' },
              { label: 'Product', value: 'product' },
              { label: 'Supplier', value: 'supplier' },
              { label: 'Order', value: 'order' },
              { label: 'User', value: 'user' },
              { label: 'Category', value: 'category' },
              { label: 'Delivery', value: 'delivery' },
              { label: 'Notification', value: 'notification' }
            ]}
            value={resourceFilter}
            onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              type="date"
              className="w-full sm:w-auto"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            />
            <span className="text-sage-400 font-medium">to</span>
            <Input 
              type="date"
              className="w-full sm:w-auto"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            />
          </div>

          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-300" size={18} />
            <Input 
              placeholder="Search descriptions and user emails..." 
              className="pl-12 w-full"
              value={searchFilter}
              onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
            />
          </div>

          {hasActiveFilters && (
            <Tooltip text="Clear Filters">
              <button 
                onClick={clearFilters}
                className="p-3 text-sage-400 hover:text-coral-500 rounded-xl hover:bg-coral-50 transition-all border border-transparent hover:border-coral-100"
              >
                <X size={20} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-sage-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-teal-500">
              <tr>
                <th className="w-12 px-6 py-4"></th>
                <th className="px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50">User</th>
                <th className="px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50">Resource</th>
                <th className="px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-28">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-teal-600" size={36} />
                      <p className="text-sage-400 font-semibold text-[10px] uppercase tracking-widest">Loading Logs...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-28 text-center">
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-20 h-20 rounded-full bg-sage-50 flex items-center justify-center text-sage-300 border border-sage-100 shadow-inner">
                        <PackageSearch size={40} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sage-800 font-bold font-display text-xl tracking-tight">No logs found</p>
                        <p className="text-sage-400 font-medium text-sm">Try adjusting your filters.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRows.has(log.id);
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-sage-50/50 transition cursor-pointer group ${isExpanded ? 'bg-sage-50/30' : ''}`}
                        onClick={() => toggleRow(log.id)}
                      >
                        <td className="px-6 py-4">
                          <button className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-teal-100 text-teal-600' : 'text-sage-300 group-hover:text-teal-600'}`}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-sage-500 font-medium border-b border-sage-100/50">
                          {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-sage-700 border-b border-sage-100/50">
                          {log.user_email || <span className="text-sage-400 italic">System</span>}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-sage-100/50">
                          <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-sage-600 border-b border-sage-100/50">
                          {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                        </td>
                        <td className="px-6 py-4 text-sm text-sage-800 border-b border-sage-100/50">
                          {log.description}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-sage-50/20">
                          <td colSpan="6" className="px-14 py-6 border-b border-sage-100/50">
                            <AuditLogDetail id={log.id} logData={log} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-sage-50/50 border-t border-sage-100">
          <div className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest">
            Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} records
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center px-4 bg-white border border-sage-100 rounded-xl h-10 font-bold text-teal-600 text-[11px] shadow-sm">
              {page} <span className="mx-2 text-sage-100 font-medium">/</span> {totalPages}
            </div>

            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
            >
              <NavChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditLogDetail({ id }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../../api/auditLogs').then(({ fetchAuditLogDetail }) => {
      fetchAuditLogDetail(id).then(res => {
        setDetail(res.log);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, [id]);

  if (loading) {
    return <div className="text-sage-400 flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading details...</div>;
  }

  if (!detail) {
    return <div className="text-coral-500">Failed to load details.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-8 text-xs font-mono text-sage-500 bg-white p-3 rounded-lg border border-sage-100 inline-block">
        <span>IP: {detail.ip_address || 'N/A'}</span>
        <span>User Agent: {detail.user_agent || 'N/A'}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {detail.old_data && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-coral-500">Old Data</h4>
            <pre className="bg-sage-900 text-sage-100 p-4 rounded-xl text-xs overflow-x-auto shadow-inner">
              {JSON.stringify(detail.old_data, null, 2)}
            </pre>
          </div>
        )}
        
        {detail.new_data && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">New Data</h4>
            <pre className="bg-sage-900 text-sage-100 p-4 rounded-xl text-xs overflow-x-auto shadow-inner">
              {JSON.stringify(detail.new_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
