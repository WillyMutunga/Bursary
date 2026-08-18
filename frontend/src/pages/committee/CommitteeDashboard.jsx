import API_BASE_URL from '../../config';
import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  FolderOpen,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Award,
  Menu,
  BarChart2
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import AnalyticsCharts from '../../components/AnalyticsCharts';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';

const getDocUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const docPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${docPath}`;
};

export default function CommitteeDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { title: '', url: '' }
  const [awardAmount, setAwardAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newBudgetValue, setNewBudgetValue] = useState('');
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [selectedWard, setSelectedWard] = useState('');

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
        fetchBudget(token);
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
        setAllApplications(appData);
        // Filter for active review queue (COMMITTEE_REVIEW, VERIFICATION, SUBMITTED) sorted by score descending
        const reviewApps = appData.filter(app => ['COMMITTEE_REVIEW', 'VERIFICATION', 'SUBMITTED'].includes(app.status));
        reviewApps.sort((a, b) => (b.eligibility_score || 0) - (a.eligibility_score || 0));
        setApplications(reviewApps);
      }
  };

  const fetchBudget = async (token) => {
      const bRes = await fetch(API_BASE_URL + '/api/v1/applications/budget/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBudgetData(bData);
        setNewBudgetValue(bData.total_budget);
      }
  };

  const handleUpdateBudget = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(API_BASE_URL + '/api/v1/applications/update_budget/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ total_budget: newBudgetValue })
          });
          const data = await res.json();
          if (res.ok) {
              alert("Budget updated successfully!");
              fetchBudget(token);
          } else {
              alert(data.error || "Failed to update budget");
          }
      } catch (err) {
          alert("Error updating budget");
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
  };

  const handleReview = async (decision) => {
      if (!selectedApp) return;
      setIsSubmitting(true);
      try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/api/v1/applications/${selectedApp.id}/review/`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                  decision: decision,
                  amount_awarded: decision === 'APPROVE' ? parseFloat(awardAmount || 0) : 0
              })
          });

          const data = await res.json();
          if (res.ok) {
              setSelectedApp(null);
              setAwardAmount('');
              const token = localStorage.getItem('access_token');
              fetchApplications(token);
              fetchBudget(token);
          } else {
              alert(data.error || "Failed to submit review");
          }
      } catch (error) {
          console.error(error);
          alert("Error submitting review");
      } finally {
          setIsSubmitting(false);
      }
  };

  const fullName = user ? (user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username) : 'Committee Member';
  const initials = fullName.substring(0, 2).toUpperCase();

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
              <span className="text-[#DAA520] font-bold text-[10px] uppercase block tracking-wider mt-0.5">Committee Portal</span>
            </div>
          </div>
          <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#DAA520] uppercase tracking-wider mb-4 px-2">Committee Menu</div>
          
          <button onClick={() => { setActiveTab('review'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'review' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} />
            <span>Review Queue</span>
          </button>
          <button onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'applications' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FolderOpen size={20} />
            <span>All Applications</span>
          </button>
          <button onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <BarChart2 size={20} />
            <span>Analytics & Charts</span>
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
             <h1 className="text-2xl font-bold text-navy hidden sm:block">Committee Review Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy">{fullName}</p>
                <p className="text-xs text-purple-600 font-medium">Bursary Committee</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-300 max-w-2xl">
                    <h2 className="text-2xl font-bold text-navy mb-2">Constituency Budget Settings</h2>
                    <p className="text-sm text-slate-500 mb-6">Manage the total allocation cap for the financial year (2026/2027).</p>

                    <form onSubmit={handleUpdateBudget} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Total Financial Year Budget (KSh)</label>
                            <input 
                                type="number" 
                                value={newBudgetValue}
                                onChange={(e) => setNewBudgetValue(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-3 text-lg font-bold text-navy focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="e.g. 20000000"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-colors">
                            Save & Update Budget Cap
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-in fade-in duration-300">
                <AnalyticsCharts />
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-[#121820]">All Constituency Applications</h2>
                    <p className="text-xs text-slate-500 font-medium">Complete record of all submitted bursary applications for FY 2026/2027.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                    >
                      <option value="">All Wards (6)</option>
                      <option value="Emali/Mulala">Emali/Mulala</option>
                      <option value="Nguumo">Nguumo</option>
                      <option value="Makindu">Makindu</option>
                      <option value="Nguu/Masumba">Nguu/Masumba</option>
                      <option value="Kalamba/Nzaui">Kalamba/Nzaui</option>
                      <option value="Kikovoo/Mavindini">Kikovoo/Mavindini</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="SUBMITTED">Submitted / Verification</option>
                      <option value="COMMITTEE_REVIEW">Awaiting Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Disbursed (Paid)</option>
                      <option value="REJECTED">Declined</option>
                    </select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Search reference, student..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 w-56 shadow-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider">Tracking Ref</th>
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider">Applicant & Ward</th>
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider">Institution</th>
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 font-extrabold text-gold uppercase tracking-wider bg-amber-50">Awarded</th>
                          <th className="px-6 py-4 font-extrabold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {allApplications
                          .filter(app => {
                            if (selectedWard && app.ward !== selectedWard) return false;
                            if (statusFilter && app.status !== statusFilter) return false;
                            if (searchTerm) {
                              const term = searchTerm.toLowerCase();
                              return (
                                (app.reference_number && app.reference_number.toLowerCase().includes(term)) ||
                                (app.institution_name && app.institution_name.toLowerCase().includes(term)) ||
                                (app.admission_number && app.admission_number.toLowerCase().includes(term))
                              );
                            }
                            return true;
                          })
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono font-bold text-navy">{app.reference_number}</span>
                                <div className="text-[10px] text-slate-400 mt-0.5">{new Date(app.created_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-bold text-slate-900">{app.applicant_name || 'Student Beneficiary'}</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">{app.ward || 'Ward N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-slate-800">{app.institution_name}</span>
                                <div className="text-[10px] text-slate-500 mt-0.5">Adm: {app.admission_number}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-black text-slate-800">
                                {app.eligibility_score || 0} pts
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  app.status === 'APPROVED' || app.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : app.status === 'REJECTED'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-black text-sm text-navy bg-amber-50/30">
                                KSh {parseFloat(app.awarded_amount || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => { setSelectedApp(app); setAwardAmount(app.awarded_amount || ''); setActiveTab('review'); }}
                                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        {allApplications.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                              No applications recorded in the system yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <>
            {/* Budget Enforcement Progress Bar Card */}
            {budgetData && (
                <div className="bg-gradient-to-r from-[#094724] via-[#0F6B38] to-[#041A0E] rounded-3xl p-6 text-white shadow-xl border-2 border-[#DAA520] mb-6 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 relative z-10">
                        <div>
                            <span className="text-xs uppercase font-extrabold tracking-wider text-[#DAA520] bg-[#DAA520]/20 px-3 py-1 rounded-full border border-[#DAA520]/30">Constituency Financial Ledger ({budgetData.financial_year})</span>
                            <h3 className="text-2xl font-black mt-2">Bursary Fund Allocation Cap</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-200 block font-semibold">Remaining Available Budget</span>
                            <span className="text-2xl sm:text-3xl font-black text-emerald-400">KSh {budgetData.remaining_budget.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900/60 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-700/80 mb-2 relative z-10">
                        <div 
                            className="bg-gradient-to-r from-[#DAA520] to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-md"
                            style={{ width: `${Math.min(100, (budgetData.allocated_amount / budgetData.total_budget) * 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-purple-300 mt-2 font-medium">
                        <span>Allocated: KSh {budgetData.allocated_budget.toLocaleString()} ({budgetData.percentage_used}%)</span>
                        <span>Total Cap: KSh {budgetData.total_budget.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Header / Metrics & Ward Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-extrabold text-[#121820]">Committee Review Queue</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Filter applications by Polling Station or Ward for targeted allocation.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedWard || ''}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-[#121820] bg-slate-50 focus:ring-2 focus:ring-[#0F6B38] focus:outline-none"
                    >
                      <option value="">All 6 Kibwezi West Wards</option>
                      <option value="Emali/Mulala">Emali/Mulala Ward</option>
                      <option value="Makindu">Makindu Ward</option>
                      <option value="Nguu/Masumba">Nguu/Masumba Ward</option>
                      <option value="Nguumo">Nguumo Ward</option>
                      <option value="Kikumbulyu North">Kikumbulyu North Ward</option>
                      <option value="Kikumbulyu South">Kikumbulyu South Ward</option>
                    </select>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input 
                          type="text" 
                          placeholder="Search Tracking No, Polling Station, School..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0F6B38] w-64 shadow-sm" 
                        />
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Tracking Number</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Applicant & Polling Station</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Institution & Course</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Requested Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#0F6B38] uppercase tracking-wider bg-emerald-50/60">Vulnerability Score</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications
                        .filter(app => {
                            if (selectedWard && app.ward && app.ward !== selectedWard) return false;
                            if (!searchTerm) return true;
                            const term = searchTerm.toLowerCase();
                            return (
                                (app.reference_number && app.reference_number.toLowerCase().includes(term)) ||
                                (app.institution_name && app.institution_name.toLowerCase().includes(term)) ||
                                (app.ward && app.ward.toLowerCase().includes(term)) ||
                                (app.polling_station && app.polling_station.toLowerCase().includes(term)) ||
                                (app.course && app.course.toLowerCase().includes(term))
                            );
                        })
                        .map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono font-black text-[#121820] text-xs">{app.reference_number || 'CDF/BURS/2026/001'}</span>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(app.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-xs text-[#121820]">{app.applicant_full_name || app.applicant_username || 'Student'}</div>
                                <div className="inline-block px-2 py-0.5 bg-emerald-50 text-[#0F6B38] text-[10px] font-extrabold rounded-md mt-0.5 border border-emerald-200">
                                  {app.ward || 'Emali/Mulala'} • {app.polling_station || 'Main Primary'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-700 font-medium">{app.institution_name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-slate-600">{app.course}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gold">
                                KSh {parseFloat(app.amount_applied || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap bg-purple-50/50">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-bold border
                                        ${app.eligibility_score >= 80 ? 'bg-green-100 text-green-700 border-green-200' : 
                                          app.eligibility_score >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                          'bg-red-100 text-red-700 border-red-200'}`}>
                                        {app.eligibility_score}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button 
                                    onClick={() => setSelectedApp(app)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-colors shadow-sm"
                                >
                                    <Eye size={14} /> Review
                                </button>
                            </td>
                        </tr>
                        ))}
                        {applications.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-navy">All caught up!</h3>
                                <p className="text-slate-500 text-sm mt-1">There are no applications pending committee review.</p>
                            </td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal Overlay */}
            {selectedApp && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-navy">Review Application</h3>
                                <p className="text-sm text-slate-500">{selectedApp.reference_number}</p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1">
                            
                            <div className="bg-purple-50 border border-purple-100 rounded-xl mb-6 overflow-hidden">
                                <div 
                                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-100/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl border-4 border-white shadow-md">
                                            {selectedApp.eligibility_score || 90}
                                        </div>
                                        <div>
                                            <h4 className="text-purple-900 font-bold">Eligibility Score ({selectedApp.eligibility_score || 90}/100)</h4>
                                            <p className="text-xs text-purple-700 font-medium">Click to view criteria math breakdown</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-sm">
                                      {showScoreBreakdown ? 'Hide Breakdown' : 'View Criteria'}
                                    </span>
                                </div>

                                {showScoreBreakdown && (
                                  <div className="border-t border-purple-200/60 p-4 bg-white/80 space-y-2 text-xs text-slate-700 animate-in fade-in duration-200">
                                      <div className="flex justify-between border-b border-purple-100 pb-1.5">
                                          <span>Base Academic & Residency Verification</span>
                                          <span className="font-bold text-emerald-600">+20 pts</span>
                                      </div>
                                      <div className="flex justify-between border-b border-purple-100 pb-1.5">
                                          <span>Vulnerability Assessment ({selectedApp.vulnerability_status || 'Orphan/Disability'})</span>
                                          <span className="font-bold text-emerald-600">+30 pts</span>
                                      </div>
                                      <div className="flex justify-between border-b border-purple-100 pb-1.5">
                                          <span>Low Household Income Category ({selectedApp.income_category || '< KSh 10,000'})</span>
                                          <span className="font-bold text-emerald-600">+30 pts</span>
                                      </div>
                                      <div className="flex justify-between border-b border-purple-100 pb-1.5">
                                          <span>Fee Balance Financial Need (KSh {parseFloat(selectedApp.fee_balance || 0).toLocaleString()})</span>
                                          <span className="font-bold text-emerald-600">+10 pts</span>
                                      </div>
                                      <div className="flex justify-between pt-1 font-bold text-purple-900 text-sm">
                                          <span>Total Computed Verification Score</span>
                                          <span>{selectedApp.eligibility_score || 90} / 100</span>
                                      </div>
                                  </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Academic Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Institution</span>
                                            <span className="text-sm font-medium text-navy">{selectedApp.institution_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Course</span>
                                            <span className="text-sm font-medium text-navy">{selectedApp.course}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Financial Details</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Income Category</span>
                                            <span className="text-sm font-medium text-navy">{selectedApp.income_category}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Vulnerability</span>
                                            <span className="text-sm font-medium text-navy">{selectedApp.vulnerability_status}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Fee Balance</span>
                                            <span className="text-sm font-bold text-red-600">KSh {parseFloat(selectedApp.fee_balance || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pb-2 bg-amber-50 p-2 rounded-lg">
                                            <span className="text-sm font-medium text-amber-800">Amount Requested</span>
                                            <span className="text-sm font-bold text-amber-800">KSh {parseFloat(selectedApp.amount_applied || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Uploaded Documents */}
                                <div className="mb-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                    <h4 className="text-xs font-semibold text-purple-900 uppercase mb-3">Uploaded Verification Documents</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedApp.id_document ? (
                                            <button 
                                                type="button"
                                                onClick={() => setPreviewDoc({ title: `National ID / Birth Certificate - ${selectedApp.reference_number}`, url: getDocUrl(selectedApp.id_document) })}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-white text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <FileText size={14} /> National ID Card
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">No ID Attached</span>
                                        )}
                                        {selectedApp.admission_letter ? (
                                            <button 
                                                type="button"
                                                onClick={() => setPreviewDoc({ title: `Admission Letter - ${selectedApp.reference_number}`, url: getDocUrl(selectedApp.admission_letter) })}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-white text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <FileText size={14} /> Admission Letter
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">No Admission Letter</span>
                                        )}
                                        {selectedApp.fee_structure ? (
                                            <button 
                                                type="button"
                                                onClick={() => setPreviewDoc({ title: `Fee Structure - ${selectedApp.reference_number}`, url: getDocUrl(selectedApp.fee_structure) })}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-white text-purple-700 text-xs font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm cursor-pointer"
                                            >
                                                <FileText size={14} /> Fee Structure
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">No Fee Structure</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Award Input */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-semibold text-navy mb-2">Decision: Award Amount (KSh)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">KSh</span>
                                    <input 
                                        type="number" 
                                        placeholder="Enter approved amount"
                                        value={awardAmount}
                                        onChange={(e) => setAwardAmount(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-bold text-navy"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Entering an amount and clicking Approve will move this to the Finance queue.</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                disabled={isSubmitting}
                                onClick={() => handleReview('REJECT')}
                                className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
                            >
                                Reject Application
                            </button>
                            <button 
                                disabled={isSubmitting || !awardAmount}
                                onClick={() => handleReview('APPROVE')}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check size={16} /> {isSubmitting ? 'Processing...' : 'Approve & Award'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* Interactive Document Viewer Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        docUrl={previewDoc?.url}
        docTitle={previewDoc?.title}
      />

    </div>
  );
}
