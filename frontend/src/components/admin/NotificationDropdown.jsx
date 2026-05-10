import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pusher from 'pusher-js';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
        const data = await getUnreadCount();
        setUnreadCount(data.count);
    } catch (error) {
        console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
        const data = await getNotifications();
        setNotifications(data);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    
    // Pusher Setup
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER
    });

    const channel = pusher.subscribe('admin-notifications');
    channel.bind('notification-received', (data) => {
        // Add ID if missing (for unique keys in local state)
        const incomingNotif = {
            ...data,
            id: data.id || Date.now(),
            is_read: 0,
            created_at: new Date().toISOString()
        };
        
        setUnreadCount(prev => prev + 1);
        setNotifications(prev => [incomingNotif, ...prev].slice(0, 50));
    });

    return () => {
        pusher.unsubscribe('admin-notifications');
        pusher.disconnect();
    };
   
  }, []);

  useEffect(() => {
    if (isOpen) {
        fetchNotifications();
    }
   
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error('Failed to mark read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
    } catch (error) {
        console.error('Failed to mark all read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-sage-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all group ${isOpen ? 'bg-teal-50 text-teal-600' : ''}`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex min-w-[18px] h-[18px] px-1 bg-coral-500 rounded-full border-2 border-white text-[10px] font-bold text-white items-center justify-center animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-sage-100 rounded-[2rem] shadow-2xl shadow-teal-900/10 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-1 duration-200 origin-top-right z-50">
          <div className="flex items-center justify-between px-6 py-4 border-b border-sage-50">
            <div>
              <p className="text-xs font-bold text-sage-200 uppercase tracking-[0.2em]">Notifications</p>
              <p className="text-[10px] text-sage-400 font-semibold mt-0.5">{unreadCount} unread alerts</p>
            </div>
            {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
                >
                  Mark all read
                </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sage-300">
                        <Bell size={24} />
                    </div>
                    <p className="text-sm font-bold text-sage-500">All caught up!</p>
                    <p className="text-xs text-sage-300 mt-1">No new notifications at the moment.</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`group px-6 py-4 border-b border-sage-50 last:border-0 hover:bg-sage-50/50 transition-colors relative ${!notif.is_read ? 'bg-teal-50/10' : ''}`}
                    >
                        <div className="flex gap-4">
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                notif.type === 'order_paid' ? 'bg-emerald-100 text-emerald-600' : 
                                notif.type === 'order_failed' ? 'bg-coral-100 text-coral-600' :
                                notif.type === 'low_stock' ? 'bg-amber-100 text-amber-600' :
                                'bg-teal-100 text-teal-600'
                            }`}>
                                <Bell size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-sage-700 truncate">{notif.title}</p>
                                    <p className="text-[10px] font-bold text-sage-300 shrink-0">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-xs text-sage-500 mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                        
                        {!notif.is_read && (
                            <button 
                                onClick={(e) => handleMarkRead(e, notif.id)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-teal-600 bg-white border border-teal-100 rounded-lg shadow-sm hover:bg-teal-50 transition-all"
                                title="Mark as read"
                            >
                                <Check size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                ))
            )}
          </div>

          <div className="p-3 bg-sage-50/50 border-t border-sage-50 text-center">
            <Link 
              to="/admin/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-bold text-sage-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest"
            >
                View notification history
                <ExternalLink size={10} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
