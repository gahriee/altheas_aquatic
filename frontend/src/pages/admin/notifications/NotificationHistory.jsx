import { useState, useEffect } from 'react';
import { Bell, Filter, Trash2, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { getHistory, markAsRead, markAllAsRead, deleteOldNotifications } from '../../../api/notifications';
import { formatDistanceToNow, format } from 'date-fns';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Tooltip from '../../../components/ui/Tooltip';

export default function NotificationHistory() {
  // Data State
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  // Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [page, typeFilter, readFilter]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getHistory(page, perPage, typeFilter, readFilter);
      setNotifications(data.notifications || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteOld = async () => {
    setIsDeleting(true);
    try {
      await deleteOldNotifications(30); // Delete older than 30 days
      setIsConfirmOpen(false);
      
      // Reset to page 1 and refresh
      if (page === 1) {
        fetchHistory();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to clear old notifications:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset page when changing filters
  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
  };

  const handleReadChange = (e) => {
    setReadFilter(e.target.value);
    setPage(1);
  };

  const getIconAndColors = (type) => {
    switch (type) {
      case 'order_paid':
        return { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: Bell };
      case 'order_failed':
        return { bg: 'bg-coral-100', text: 'text-coral-600', icon: AlertCircle };
      case 'low_stock':
        return { bg: 'bg-amber-100', text: 'text-amber-600', icon: Bell };
      case 'new_customer':
        return { bg: 'bg-teal-100', text: 'text-teal-600', icon: Bell };
      default:
        return { bg: 'bg-teal-100', text: 'text-teal-600', icon: Bell };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-sage-800 flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
              <Bell size={24} />
            </div>
            Notification History
            {totalCount > 0 && (
              <span className="text-sm px-2 py-0.5 bg-sage-200 text-sage-600 rounded-full font-bold">
                {totalCount} total
              </span>
            )}
          </h1>
          <p className="text-sm font-semibold text-sage-500 mt-1 uppercase tracking-widest">
            View and manage all past system alerts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.is_read)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-teal-600 bg-white border border-teal-100 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 uppercase tracking-wider"
          >
            <Check size={16} strokeWidth={3} />
            Mark All Read
          </button>
          
          <Tooltip text="Delete notifications older than 30 days">
            <button 
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-coral-600 bg-white border border-coral-100 hover:bg-coral-50 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 uppercase tracking-wider"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Cleanup
              <span className="hidden sm:inline-block ml-1 opacity-50 px-1.5 py-0.5 bg-coral-50 rounded-md text-[10px]">30d+</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-sage-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-3 text-sage-400 font-bold uppercase tracking-widest text-xs shrink-0">
          <Filter size={16} />
          Filters
        </div>
        
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <select 
            value={typeFilter}
            onChange={handleTypeChange}
            className="flex-1 sm:flex-none border border-sage-200 text-sage-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-2.5 outline-none transition-shadow"
          >
            <option value="">All Types</option>
            <option value="order_paid">Payment Received</option>
            <option value="order_failed">Payment Failed</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="new_customer">New Customers</option>
          </select>

          <select 
            value={readFilter}
            onChange={handleReadChange}
            className="flex-1 sm:flex-none border border-sage-200 text-sage-700 text-sm font-semibold rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-2.5 outline-none transition-shadow"
          >
            <option value="">All Statuses</option>
            <option value="0">Unread Only</option>
            <option value="1">Read Only</option>
          </select>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-[2rem] border border-sage-100 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-teal-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold text-sage-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mb-4 text-sage-300">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-sage-700">No notifications found</h3>
            <p className="text-sm font-semibold text-sage-500 mt-1 max-w-sm">
              Try adjusting your filters, or check back later when new events occur.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sage-50">
            {notifications.map((notif) => {
              const { bg, text, icon: Icon } = getIconAndColors(notif.type);
              const isUnread = notif.is_read === 0;

              return (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-4 p-6 transition-all border-l-4 group relative ${
                    isUnread 
                      ? 'bg-teal-50/30 border-teal-500 hover:bg-teal-50/50' 
                      : 'border-transparent hover:bg-sage-50/50'
                  }`}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${text}`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-base font-bold text-sage-800 flex items-center gap-2">
                          {notif.title}
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-coral-500 shrink-0"></span>
                          )}
                        </h4>
                        <p className="text-sm font-medium text-sage-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-sage-400">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                        <p className="text-[10px] font-semibold text-sage-300 uppercase tracking-widest mt-1">
                          {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>

                    {isUnread && (
                      <button 
                        onClick={() => handleMarkRead(notif.id)}
                        className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check size={14} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sage-100 shadow-sm">
          <p className="text-sm font-bold text-sage-500">
            Page <span className="text-sage-800">{page}</span> of <span className="text-sage-800">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-sage-500 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-sage-500 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-50 disabled:hover:bg-transparent rounded-xl transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Clear Old Notifications"
        message="Are you sure you want to permanently delete all notifications older than 30 days? This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Yes, clear old notifications'}
        cancelLabel="Cancel"
        onConfirm={handleDeleteOld}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
        disabled={isDeleting}
      />
    </div>
  );
}
