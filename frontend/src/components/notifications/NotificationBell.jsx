import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await notificationService.getNotifications();
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000); // poll every 60s
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-6 w-6 transition-colors hover:text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 shadow-[0_0_8px_var(--color-brand-glow)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-2xl glass-panel focus:outline-none z-50 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pf-600 via-pf-400 to-transparent opacity-80"></div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md relative z-10">
            <h3 className="text-[13px] font-extrabold text-white tracking-widest uppercase drop-shadow-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] font-bold tracking-widest uppercase text-pf-400 hover:text-white disabled:opacity-50 transition-colors drop-shadow-sm"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar relative z-10 bg-black/20">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pf-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">You have no notifications.</span>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`px-4 py-4 hover:bg-white/5 transition-all duration-300 relative group ${!notification.is_read ? 'bg-pf-900/10' : ''}`}
                  >
                    {!notification.is_read && (
                      <div className="absolute left-0 top-0 w-[3px] h-full bg-pf-500 shadow-[0_0_8px_rgba(151,125,255,0.8)]"></div>
                    )}
                    <Link
                      to={notification.project_id ? `/projects/${notification.project_id}` : '#'}
                      onClick={() => setIsOpen(false)}
                      className="block pl-2"
                    >
                      <div className="flex justify-between items-start">
                        <p className={`text-[13px] ${!notification.is_read ? 'font-bold text-white drop-shadow-sm' : 'font-medium text-pf-200/70'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="text-[10px] text-pf-400 hover:text-white ml-2 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <span className="sr-only">Mark as read</span>
                            <div className="h-2 w-2 rounded-full bg-pf-400 shadow-[0_0_5px_rgba(151,125,255,0.8)]"></div>
                          </button>
                        )}
                      </div>
                      <p className={`text-[12px] mt-1.5 line-clamp-2 leading-relaxed ${!notification.is_read ? 'text-pf-200' : 'text-pf-400/70'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
