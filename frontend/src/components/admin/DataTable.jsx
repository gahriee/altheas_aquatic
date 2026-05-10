import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight as NavChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  PackageSearch
} from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';

/**
 * ----------------------------------------
 * DataTable
 * ----------------------------------------
 * A high-fidelity, shared table component for the admin panel.
 * Handles client-side sorting, pagination, and optional collapsible rows.
 */
export default function DataTable({ 
  columns = [], 
  data = [], 
  pageSize = 10,
  renderExpanded,
  loading = false,
  emptyMessage = 'No records found',
  className = ''
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const sorted = [...data].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle nulls
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      // Numeric sort if applicable
      if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB)) && isFinite(valA) && isFinite(valB)) {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      // String sort
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortKey, sortOrder]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  // Reset to first page when data length changes (e.g. filtering)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handlers
  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const toggleRow = (id) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };



  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="bg-white rounded-3xl shadow-sm border border-sage-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-teal-500">
              <tr>
                {renderExpanded && <th className="w-12 px-6 py-4" />}
                {columns.map((col) => (
                    <th 
                      key={col.key}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-6 py-4 text-[10px] font-bold font-display text-white uppercase tracking-widest border-b border-teal-600/50 ${
                      col.sortable ? 'cursor-pointer hover:bg-teal-600/50 transition' : ''
                    } ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                  >
                    <div className={`flex items-center gap-2 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''
                    }`}>
                      {col.label}
                      {col.sortable && (
                        <div className="text-teal-100/50">
                          {sortKey === col.key ? (
                            sortOrder === 'asc' ? <ArrowUp size={12} className="text-mint-300" /> : <ArrowDown size={12} className="text-mint-300" />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (renderExpanded ? 1 : 0)} className="py-28">
                    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                      <div className="relative">
                        <Loader2 className="animate-spin text-teal-600" size={36} strokeWidth={2.5} />
                        <div className="absolute inset-0 bg-teal-600/10 blur-xl rounded-full animate-pulse" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sage-800 font-bold text-xs uppercase tracking-widest">Hydrating Catalog</p>
                        <p className="text-sage-400 font-semibold text-[10px] uppercase tracking-[0.2em]">Syncing aquatic records...</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentData.map((row, idx) => {
                const rowId = row.product_id || row.order_id || row.id || idx;
                const isExpanded = expandedRows.has(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <tr 
                      className={`hover:bg-sage-50/50 transition group ${isExpanded ? 'bg-sage-50/30' : ''}`}
                      onClick={() => renderExpanded && toggleRow(rowId)}
                    >
                      {renderExpanded && (
                        <td className="px-6 py-4">
                          <Tooltip text={isExpanded ? "Collapse Row" : "Expand Row"}>
                            <button className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-teal-100 text-teal-600' : 'text-sage-300 group-hover:text-teal-600'}`}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </Tooltip>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td 
                          key={col.key} 
                          className={`px-6 py-4 text-sm border-b border-sage-100/50 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                        >
                          {col.render ? col.render(row) : (
                            <span className="text-sage-600 font-medium">{row[col.key]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    {renderExpanded && (
                      <tr className={`transition-all duration-300 ${isExpanded ? 'bg-sage-50/20' : 'bg-transparent invisible'}`}>
                        <td colSpan={columns.length + (renderExpanded ? 1 : 0)} className="px-14 p-0 overflow-hidden">
                          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden min-h-0">
                              <div className="py-6">
                                {renderExpanded(row)}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {!loading && currentData.length === 0 && (
            <div className="px-6 py-28 text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-sage-50 flex items-center justify-center text-sage-300 border border-sage-100 shadow-inner">
                <PackageSearch size={40} />
              </div>
              <div className="space-y-1">
                <p className="text-sage-800 font-bold font-display text-xl tracking-tight">Vast & Empty</p>
                <p className="text-sage-400 font-medium text-sm max-w-[280px] mx-auto">None of our aquatic species matches your current filter criteria.</p>
              </div>
            </div>
          )}
        </div>

        {/* Integrated Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-sage-50/50 border-t border-sage-100">
          <div className="text-[10px] font-semibold text-sage-400 uppercase tracking-widest">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center px-4 bg-white border border-sage-100 rounded-xl h-10 font-bold text-teal-600 text-[11px] shadow-sm">
              {currentPage} <span className="mx-2 text-sage-100 font-medium">/</span> {totalPages}
            </div>

            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <NavChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              className="p-2 min-w-0 rounded-xl hover:bg-white"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
