import API_BASE_URL from '../config';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCircle2, AlertCircle, Info, ShieldAlert, FileText, DollarSign, X } from 'lucide-react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState('APPLICANT');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // 1. Get current logged in user role
        let currentRole = 'APPLICANT';
        try {
          const meRes = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (meRes.ok) {
            const userData = await meRes.json();
            currentRole = userData.role || 'APPLICANT';
            setUserRole(currentRole);
          }
        } catch (e) {
          console.warn("Could not fetch user profile for notifications", e);
        }

        // 2. Fetch applications list
        const res = await fetch(API_BASE_URL + '/api/v1/applications/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const appList = await res.json();
          let generatedList = [];

          const isAdmin = ['ADMINISTRATOR', 'SUPER_ADMINISTRATOR', 'ADMIN'].includes(currentRole);
          const isCommittee = currentRole === 'COMMITTEE';
          const isFinance = currentRole === 'FINANCE';

          if (isAdmin) {
            // Super Admin / Administrator Notifications: System Governance & Audit Alerts
            generatedList = appList.slice(0, 5).map((app, index) => {
              let title = `System Activity: ${app.reference_number || 'CDF/BURS/2026'}`;
              let message = `Application for ${app.institution_name || 'Applicant'} status is ${app.status}.`;
              let type = 'info';

              if (app.status === 'APPROVED') {
                title = `Application Approved: ${app.reference_number}`;
                message = `Committee approved KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()} for ${app.institution_name || 'applicant'}.`;
                type = 'success';
              } else if (app.status === 'PAID') {
                title = `Disbursement Complete: ${app.reference_number}`;
                message = `Finance disbursed KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()} to ${app.institution_name || 'bank'}.`;
                type = 'success';
              } else if (app.fraud_score === 'HIGH_RISK') {
                title = `Fraud Risk Warning: ${app.reference_number}`;
                message = `High Risk flagged for duplicate admission or fee balance anomaly.`;
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

            // Add system-wide budget governance alert for Super Admin
            generatedList.unshift({
              id: 'admin-system-budget',
              title: 'FY 2026/2027 Budget Initialized',
              message: 'Bursary Fund Allocation set to KSh 20,000,000.00 across all 6 constituency wards.',
              time: 'System',
              type: 'info',
              read: false
            });

          } else if (isCommittee) {
            // Committee Notifications: Verification & Review Alerts
            generatedList = appList.slice(0, 5).map((app, index) => {
              let title = `Application Logged: ${app.reference_number || 'CDF/BURS/2026'}`;
              let message = `Application for ${app.institution_name || 'Student'} status: ${app.status}.`;
              let type = 'info';

              if (app.status === 'APPROVED') {
                title = `Review Completed: ${app.reference_number}`;
                message = `Scored ${app.eligibility_score || 0} pts and awarded KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()}.`;
                type = 'success';
              } else if (app.status === 'PAID') {
                title = `Disbursement Complete: ${app.reference_number}`;
                message = `KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()} disbursed to ${app.institution_name}.`;
                type = 'success';
              } else if (app.status === 'REJECTED') {
                title = `Application Declined: ${app.reference_number}`;
                message = `Application for ${app.institution_name} was declined by committee.`;
                type = 'warning';
              } else if (app.status === 'SUBMITTED' || app.status === 'VERIFICATION') {
                title = `Awaiting Review: ${app.reference_number}`;
                message = `Application for ${app.institution_name || 'Student'} requires score evaluation.`;
                type = 'info';
              }

              if (app.fraud_score === 'HIGH_RISK') {
                title = `Verification Risk: ${app.reference_number}`;
                message = `Flagged for duplicate admission or anomaly verification.`;
                type = 'warning';
              }

              return {
                id: app.id || index,
                title,
                message,
                time: app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent',
                type,
                read: index > 0
              };
            });

          } else if (isFinance) {
            // Finance Notifications: Approved Allocation & Payment Alerts
            const approvedApps = appList.filter(a => a.status === 'APPROVED' || a.status === 'PAID');
            generatedList = approvedApps.slice(0, 5).map((app, index) => {
              let title = `Disbursement Ready: ${app.reference_number}`;
              let message = `Awarded KSh ${parseFloat(app.awarded_amount || 0).toLocaleString()} for ${app.institution_name || 'Institution'}.`;
              let type = 'info';

              if (app.status === 'PAID') {
                title = `Paid Out: ${app.reference_number}`;
                message = `Cheque / EFT processed successfully.`;
                type = 'success';
              }

              return {
                id: app.id || index,
                title,
                message,
                time: app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recent',
                type,
                read: app.status === 'PAID'
              };
            });

          } else {
            // Student / Applicant Notifications: Specific Personal Status Updates
            if (appList.length === 0) {
              generatedList = [{
                id: 'welcome',
                title: 'Welcome to NG-CDF Bursary Portal',
                message: 'Complete your online bursary application for FY 2026/2027.',
                time: 'Just now',
                type: 'info',
                read: false
              }];
            } else {
              const myApp = appList[0];
              let title = `Application Status: ${myApp.status}`;
              let message = `Your bursary application (${myApp.reference_number}) is currently undergoing committee verification.`;
              let type = 'info';

              if (myApp.status === 'APPROVED') {
                title = `🎉 Bursary Awarded!`;
                message = `Congratulations! You have been awarded KSh ${parseFloat(myApp.awarded_amount || 0).toLocaleString()}. Download your official award letter.`;
                type = 'success';
              } else if (myApp.status === 'PAID') {
                title = `💰 Funds Disbursed to School`;
                message = `Disbursement of KSh ${parseFloat(myApp.awarded_amount || 0).toLocaleString()} to ${myApp.institution_name} complete.`;
                type = 'success';
              } else if (myApp.status === 'REJECTED') {
                title = `Application Status Update`;
                message = `Your application was reviewed by the constituency committee.`;
                type = 'warning';
              }

              generatedList = [{
                id: myApp.id || 1,
                title,
                message,
                time: myApp.created_at ? new Date(myApp.created_at).toLocaleDateString() : 'Recent',
                type,
                read: false
              }];
            }
          }

          setNotifications(generatedList);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-full transition-colors focus:outline-none active:scale-95"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown (React Portal on document.body to eliminate GPU Stacking Bleeding) */}
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[99998]" onClick={() => setIsOpen(false)}></div>
          
          <div className="fixed top-16 right-3 sm:right-6 sm:top-20 w-[92vw] sm:w-[420px] bg-white opacity-100 rounded-2xl shadow-2xl border border-slate-200 z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col isolate">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-[11px] font-semibold text-amber-400 hover:underline mr-1"
                  >
                    Mark read
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-80 custom-scrollbar flex-1 bg-white">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!item.read ? 'bg-amber-50/50' : 'bg-white'}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {item.type === 'success' ? (
                      <CheckCircle2 className="text-emerald-600" size={18} />
                    ) : item.type === 'info' ? (
                      <Info className="text-blue-600" size={18} />
                    ) : (
                      <AlertCircle className="text-amber-600" size={18} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs font-bold text-navy truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-white">
                  No system notifications found.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center flex-shrink-0">
              <span className="text-[11px] font-semibold text-slate-500">NG-CDF Real-time Alert System</span>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
