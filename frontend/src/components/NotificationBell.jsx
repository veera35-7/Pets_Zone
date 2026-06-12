import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, XCircle, MessageSquare, Trash2, MailOpen, ShieldAlert } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';
import useAuthStore from '../store/authStore';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isAuthenticated]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (n) => {
    setIsOpen(false);
    if (!n.isRead) {
      await markAsRead(n._id);
    }
    
    // Redirect based on type
    if (n.type.startsWith('pet_')) {
      navigate('/dashboard/my-listings');
    } else if (n.type === 'new_enquiry') {
      navigate('/dashboard/enquiries');
    } else if (n.type.startsWith('seller_')) {
      navigate('/dashboard/profile');
    } else {
      navigate('/dashboard');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'pet_approved':
      case 'seller_approved':
        return <CheckCircle size={15} className="text-emerald-400" />;
      case 'pet_rejected':
      case 'seller_rejected':
        return <XCircle size={15} className="text-red-400" />;
      case 'new_enquiry':
        return <MessageSquare size={15} className="text-accent-gold" />;
      default:
        return <ShieldAlert size={15} className="text-primary-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-primary-900 border border-primary-800 flex items-center justify-center hover:border-primary-400 transition-colors relative group"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-primary-300 group-hover:text-white transition-colors" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-accent-gold text-primary-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary-950 animate-pulse-slow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-primary-900 border border-primary-800 rounded-2xl shadow-luxury z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-primary-900/60 border-b border-primary-800 flex items-center justify-between">
              <span className="text-sm font-bold text-primary-100">Notifications</span>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-accent-gold hover:text-accent-gold-light font-semibold flex items-center gap-1 transition-colors"
                  >
                    <MailOpen size={11} /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors ml-2"
                  >
                    <Trash2 size={11} /> Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-primary-800/60">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-primary-500 text-sm">
                  <div className="text-3xl mb-2">🔔</div>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-4 hover:bg-primary-800/40 transition-colors cursor-pointer relative ${
                      !n.isRead ? 'bg-accent-gold/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Unread indicator */}
                    {!n.isRead && (
                      <span className="absolute top-4 left-2.5 w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    )}

                    {/* Icon */}
                    <div className="p-2 rounded-lg bg-primary-950 border border-primary-800 shrink-0 mt-0.5 ml-1">
                      {getIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-primary-100 truncate mb-0.5">
                        {n.title}
                      </div>
                      <p className="text-xs text-primary-400 leading-relaxed mb-2 break-words">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-primary-500 font-medium block">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Delete single button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n._id);
                      }}
                      className="text-primary-500 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-primary-800 bg-primary-900/30 text-center">
              <span className="text-[10px] text-primary-500">
                You have {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
