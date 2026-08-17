import API_BASE_URL from '../config';
import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await fetch(API_BASE_URL + '/api/v1/applications/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const appList = await res.json();
          // Transform database applications into live system alerts
          const generatedList = appList.slice(0, 5).map((app, index) => {
            let title = `Application Update (${app.reference_number || 'DRAFT'})`;
            let message = `Current Status: ${app.status}. Institution: ${app.institution_name || 'N/A'}`;
            let type = 'info';

            if (app.status === 'APPROVED') {
              title = `Bursary Approved: ${app.reference_number}`;
              message = `Your application for ${app.institution_name} has been approved for KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()}.`;
              type = 'success';
            } else if (app.status === 'PAID') {
              title = `Disbursement Complete: ${app.reference_number}`;
              message = `Finance has disbursed KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()} to ${app.institution_name}.`;
              type = 'success';
            } else if (app.status === 'REJECTED') {
              title = `Application Decision: ${app.reference_number}`;
              message = `Your application was reviewed by the committee and not approved at this time.`;
              type = 'warning';
            }

            return {
              id: app.id || index,
              title,
              message,
              time: app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent',
              type,
              read: index > 1
            };
          });

          setNotifications(generatedList);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <span className="font-bold text-sm">System Notifications</span>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead} 
                  className="text-[11px] font-semibold text-amber-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!item.read ? 'bg-amber-50/30' : ''}`}
                >
                  <div className="mt-0.5">
                    {item.type === 'success' ? (
                      <CheckCircle2 className="text-emerald-600" size={18} />
                    ) : item.type === 'info' ? (
                      <Info className="text-blue-600" size={18} />
                    ) : (
                      <AlertCircle className="text-amber-600" size={18} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-navy">{item.title}</p>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No system notifications found in database.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-400">NG-CDF Real-time Alert System</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
