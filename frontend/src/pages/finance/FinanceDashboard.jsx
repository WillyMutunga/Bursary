import API_BASE_URL from '../../config';
import { useState, useEffect } from 'react';
import { 
  Wallet,
  Settings, 
  LogOut, 
  CheckCircle2, 
  FolderOpen,
  Search,
  Check,
  CreditCard,
  Banknote,
  Clock,
  Menu,
  X,
  Download,
  FileText
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import PaymentVoucherModal from '../../components/PaymentVoucherModal';

export default function FinanceDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(null); // stores ID of submitting app
  const [activeTab, setActiveTab] = useState('disbursements');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return window.location.href = '/';

        // Fetch User
        const userRes = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return window.location.href = '/';
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        fetchApplications(token);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const fetchApplications = async (token) => {
      const appRes = await fetch(API_BASE_URL + '/api/v1/applications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        // Filter for APPROVED (ready for disbursement)
        const approvedApps = appData.filter(app => app.status === 'APPROVED');
        setApplications(approvedApps);
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('access_token');
    window.open(`${API_BASE_URL}/api/v1/applications/export_bank_manifest/`, '_blank');
  };

  const handleDisburse = async (id) => {
      setIsSubmitting(id);
      try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/api/v1/applications/${id}/disburse/`, {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${token}` 
              }
          });

          if (res.ok) {
              fetchApplications(token);
          } else {
              alert("Failed to process disbursement");
          }
      } catch (error) {
          console.error(error);
          alert("Error processing disbursement");
      } finally {
          setIsSubmitting(null);
      }
  };

  const fullName = user ? (user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username) : 'Finance Officer';
  const initials = fullName.substring(0, 2).toUpperCase();

  const totalPendingAmount = applications.reduce((sum, app) => sum + parseFloat(app.awarded_amount || 0), 0);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* Sidebar - Desktop & Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-[#121820] text-slate-300 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-[#0A0E14]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NG-CDF Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5 border border-[#DAA520]" />
            <div>
              <span className="text-white font-extrabold text-xs tracking-wide block leading-tight">NG-CDF Kibwezi West</span>
              <span className="text-slate-300 font-semibold text-[11px] block leading-tight">Constituency</span>
              <span className="text-[#DAA520] font-bold text-[10px] uppercase block tracking-wider mt-0.5">Finance Portal</span>
            </div>
          </div>
          <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#DAA520] uppercase tracking-wider mb-4 px-2">Finance Menu</div>
          
          <button onClick={() => { setActiveTab('disbursements'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'disbursements' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <CreditCard size={20} />
            <span>Disbursements</span>
          </button>
          <button onClick={() => { setActiveTab('transactions'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'transactions' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FolderOpen size={20} />
            <span>All Transactions</span>
          </button>
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-2">Account</div>
          <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 shadow-sm">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-slate-500 hover:text-navy" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} />
             </button>
             <h1 className="text-2xl font-bold text-navy hidden sm:block">Finance & Disbursement Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy">{fullName}</p>
                <p className="text-xs text-gold font-medium">Bursary Finance</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-gold font-bold">
                {initials}
              </div>
            </div>
            
            <button onClick={handleLogout} className="md:hidden text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
              <LogOut size={24} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 relative">
          
          <div className="max-w-7xl mx-auto space-y-6">
            
            {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-2xl font-bold text-navy mb-6">Finance Settings</h2>
                    <p className="text-slate-500">Settings configuration for the finance module will be available here.</p>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-2xl font-bold text-navy mb-6">Transaction History</h2>
                    <p className="text-slate-500">A detailed log of all historical disbursements will be available here.</p>
                </div>
            )}

            {activeTab === 'disbursements' && (
              <>
            {/* Header / Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center gap-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shadow-inner">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Pending Disbursement Approvals</p>
                        <p className="text-3xl font-black text-[#121820] mt-0.5">{applications.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center gap-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#DAA520] flex items-center justify-center border border-amber-100 shadow-inner">
                        <Banknote size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Total Pending Disbursement Funds</p>
                        <p className="text-3xl font-black text-[#0F6B38] mt-0.5">KSh {totalPendingAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div>
                    <h2 className="text-xl font-black text-[#121820]">Ready for Disbursement</h2>
                    <p className="text-xs text-slate-500 font-medium">Applications approved by the committee, pending direct bank payout.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="flex items-center gap-2.5 px-5 py-3 bg-[#121820] hover:bg-black text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <FileText size={18} className="text-[#DAA520]" /> <span>Generate Payment Vouchers (PDF)</span>
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2.5 px-5 py-3 bg-[#0F6B38] hover:bg-[#094724] text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Download size={18} /> <span>Export Bank Manifest (CSV)</span>
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input 
                            type="text" 
                            placeholder="Search accounts or reference..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-64 shadow-sm" 
                        />
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking Number</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Institution</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gold uppercase tracking-wider bg-amber-50">Awarded Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications
                        .filter(app => {
                            if (!searchTerm) return true;
                            const term = searchTerm.toLowerCase();
                            return (
                                (app.reference_number && app.reference_number.toLowerCase().includes(term)) ||
                                (app.institution_name && app.institution_name.toLowerCase().includes(term)) ||
                                (app.admission_number && app.admission_number.toLowerCase().includes(term))
                            );
                        })
                        .map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-bold text-navy">{app.reference_number}</span>
                                <div className="text-xs text-slate-500 mt-1">{new Date(app.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700 font-medium">{app.institution_name}</span>
                                <div className="text-xs text-slate-500 mt-1">{app.course}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-600">{app.eligibility_score}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-navy bg-amber-50/30">
                                KSh {parseFloat(app.awarded_amount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button 
                                    disabled={isSubmitting === app.id}
                                    onClick={() => handleDisburse(app.id)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B6B3A] text-white rounded-lg text-sm font-bold hover:bg-[#15803D] transition-colors shadow-md shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting === app.id ? 'Processing...' : <><Check size={16} /> Mark as Paid</>}
                                </button>
                            </td>
                        </tr>
                        ))}
                        {applications.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-navy">Queue is empty</h3>
                                <p className="text-slate-500 text-sm mt-1">There are no approved applications pending disbursement.</p>
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
              </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* Official Payment Voucher & Cheque Register PDF Modal */}
      <PaymentVoucherModal 
        isOpen={isVoucherModalOpen} 
        onClose={() => setIsVoucherModalOpen(false)} 
        applications={applications} 
        user={user} 
      />

    </div>
  );
}
