import API_BASE_URL from '../../config';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  HelpCircle, 
  Bell, 
  LogOut, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FolderOpen,
  Wallet,
  Menu,
  X,
  Award
} from 'lucide-react';
import AwardLetterModal from '../../components/AwardLetterModal';

import NotificationCenter from '../../components/NotificationCenter';

export default function ApplicantDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, awardedAmount: 0, pending: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [awardLetterApp, setAwardLetterApp] = useState(null);
  
  // Profile edit states
  const [editProfile, setEditProfile] = useState({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Read local stored user data for instant rendering on mobile/laptop browsers
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
        setEditProfile({
          first_name: parsedUser.first_name || '',
          last_name: parsedUser.last_name || '',
          email: parsedUser.email || '',
          phone_number: parsedUser.phone_number || ''
        });
      } catch (e) {}
    }

    // Check URL query parameters for direct form login token
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('access_token', urlToken);
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return window.location.href = '/';

        // Fetch User profile directly
        try {
          const userRes = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            setEditProfile({
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              email: userData.email || '',
              phone_number: userData.phone_number || ''
            });
          }
        } catch (e) {}

        // Fetch Applications directly
        try {
          const appRes = await fetch(API_BASE_URL + '/api/v1/applications/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (appRes && appRes.ok) {
            const appData = await appRes.json();
            setApplications(appData);
            
            let total = appData.length;
            let awardedAmount = 0;
            let pending = 0;

            appData.forEach(app => {
              if (app.status === 'PAID' || app.status === 'APPROVED') {
                awardedAmount += parseFloat(app.awarded_amount || 0);
              }
              if (app.status === 'SUBMITTED' || app.status === 'COMMITTEE_REVIEW' || app.status === 'VERIFIED') {
                pending += 1;
              }
            });

            setMetrics({ total, awardedAmount, pending });
          }
        } catch (e) {}
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async (e) => {
      e.preventDefault();
      setIsSaving(true);
      setSaveMessage('');
      try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(editProfile)
          });
          if (res.ok) {
              const updatedUser = await res.json();
              setUser(updatedUser);
              setSaveMessage('Profile updated successfully!');
              setTimeout(() => {
                  setSaveMessage('');
                  setActiveTab('dashboard');
              }, 1200);
          } else {
              setSaveMessage('Failed to update profile.');
          }
      } catch (error) {
          setSaveMessage('An error occurred while saving.');
      } finally {
          setIsSaving(false);
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
  };

  const fullName = user ? (user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username) : 'Applicant';
  const initials = fullName.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
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
              <span className="text-[#DAA520] font-bold text-[10px] uppercase block tracking-wider mt-0.5">Bursary Portal</span>
            </div>
          </div>
          <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#DAA520] uppercase tracking-wider mb-4 px-2">Applicant Menu</div>
          
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'applications' ? 'bg-[#0F6B38] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FolderOpen size={20} />
            <span>My Applications</span>
          </button>
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8 px-2">Account</div>
          <button onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            <HelpCircle size={20} />
            <span className="font-medium">Support</span>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-slate-500 hover:text-navy" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} />
             </button>
             <h1 className="text-2xl font-bold text-navy hidden sm:block">Applicant Overview</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-navy">{fullName}</p>
                <p className="text-xs text-slate-500">{user ? user.role : 'Loading...'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                {initials}
              </div>
            </div>
            
            {/* Mobile / Top-Nav Logout */}
            <button onClick={handleLogout} className="md:hidden text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
              <LogOut size={24} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-300">
                    <h2 className="text-2xl font-bold text-navy mb-6">Profile Settings</h2>
                    
                    {saveMessage && (
                        <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${saveMessage.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {saveMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                <input 
                                    type="text" 
                                    value={editProfile.first_name}
                                    onChange={(e) => setEditProfile({...editProfile, first_name: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                <input 
                                    type="text" 
                                    value={editProfile.last_name}
                                    onChange={(e) => setEditProfile({...editProfile, last_name: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    value={editProfile.email}
                                    onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={editProfile.phone_number}
                                    onChange={(e) => setEditProfile({...editProfile, phone_number: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">National ID (Read Only)</label>
                                <input 
                                    type="text" 
                                    value={user?.username || ''}
                                    disabled
                                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-200 flex justify-end">
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-[#0B6B3A] text-white rounded-lg font-medium hover:bg-[#15803D] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {(activeTab === 'dashboard' || activeTab === 'applications') && (
            <>
              {activeTab === 'dashboard' && (
                <>
                {/* Hero CTA Banner */}
                <div className="bg-gradient-to-r from-[#0F6B38] to-[#094724] text-white rounded-3xl p-8 shadow-xl border-2 border-[#DAA520] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#DAA520]/15 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 space-y-2">
                    <span className="px-3 py-1 bg-[#DAA520]/20 text-[#DAA520] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#DAA520]/40">
                      FY 2026/2027 Active Window
                    </span>
                    <h2 className="text-2xl font-black text-white">Bursary Application Portal</h2>
                    <p className="text-slate-100 text-xs sm:text-sm max-w-xl font-medium">
                    {metrics.total > 0 
                      ? "You have already submitted your bursary application for FY 2026/2027. Each student is allowed exactly 1 application per financial year." 
                      : "Ensure your National ID / Student ID, Admission Letter, and official Fee Structure are ready before starting your submission."}
                    </p>
                </div>
                <div className="relative z-10 flex-shrink-0">
                    {metrics.total > 0 ? (
                      <div className="bg-emerald-900/80 border-2 border-emerald-400 text-emerald-200 px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span>Application Active (1 / 1 Quota Used)</span>
                      </div>
                    ) : (
                      <Link to="/applicant/apply" className="inline-flex items-center gap-2.5 bg-[#DAA520] text-[#121820] px-6 py-3.5 rounded-2xl font-black text-xs hover:bg-[#b88a18] shadow-xl transition-all duration-200 hover:scale-105 active:scale-95">
                        <PlusCircle size={18} />
                        <span>Start Application Wizard</span>
                      </Link>
                    )}
                </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-[#0F6B38] rounded-xl border border-emerald-100">
                        <FolderOpen size={24} />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#0F6B38]">
                        Lifetime
                    </span>
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Applications</h3>
                    <p className="text-3xl font-black text-[#121820] mt-1">{metrics.total}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-50 text-[#DAA520] rounded-xl border border-amber-100">
                        <Wallet size={24} />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Approved
                    </span>
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Awarded</h3>
                    <p className="text-3xl font-black text-[#0F6B38] mt-1">KSh {metrics.awardedAmount.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                        <Clock size={24} />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                        Under Review
                    </span>
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Verification</h3>
                    <p className="text-3xl font-black text-[#121820] mt-1">{metrics.pending}</p>
                </div>
                </div>
                </>
              )}

              {/* Recent Activity Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-navy">Application History</h3>
                  {activeTab !== 'applications' && (
                    <button onClick={() => setActiveTab('applications')} className="text-sm font-medium text-primary hover:text-[#15803D]">View All</button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference ID</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Awarded</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.map((app, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-navy">{app.reference_number || 'DRAFT'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {app.status === 'APPROVED' || app.status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 size={14} /> {app.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <AlertCircle size={14} /> {app.status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gold">
                            {app.awarded_amount ? `KSh ${parseFloat(app.awarded_amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                            <button onClick={() => setSelectedApp(app)} className="text-primary hover:text-navy transition-colors">View Details</button>
                            {(app.status === 'APPROVED' || app.status === 'PAID') && (
                              <button 
                                onClick={() => setAwardLetterApp(app)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 transition-colors shadow-sm"
                              >
                                <Award size={14} /> Award Letter
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                            No past applications found.
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

        {/* View Details Modal Overlay */}
        {selectedApp && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                    
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-lg font-bold text-navy">Application Details</h3>
                            <p className="text-sm text-slate-500">{selectedApp.reference_number || 'DRAFT'}</p>
                        </div>
                        <button onClick={() => setSelectedApp(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        
                        <div className="grid grid-cols-2 gap-6">
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
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Admission No</span>
                                        <span className="text-sm font-medium text-navy">{selectedApp.admission_number}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Financial Details</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-sm text-slate-500">Fee Balance</span>
                                        <span className="text-sm font-bold text-red-600">KSh {parseFloat(selectedApp.fee_balance || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pb-2 bg-slate-50 p-2 rounded-lg">
                                        <span className="text-sm font-medium text-slate-800">Amount Requested</span>
                                        <span className="text-sm font-bold text-slate-800">KSh {parseFloat(selectedApp.amount_applied || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedApp.status === 'APPROVED' || selectedApp.status === 'PAID' ? (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                <label className="block text-sm font-semibold text-green-900 mb-1">Award Status</label>
                                <p className="text-2xl font-bold text-green-700">KSh {parseFloat(selectedApp.awarded_amount || 0).toLocaleString()} Awarded</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {selectedApp.status === 'PAID' ? 'This amount has been disbursed to your institution.' : 'This amount has been approved and is awaiting final disbursement.'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <label className="block text-sm font-semibold text-amber-900 mb-1">Current Status: {selectedApp.status}</label>
                                <p className="text-xs text-amber-700">
                                    Your application is currently being processed. You will be notified once a decision has been made.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Award Letter Modal */}
        {awardLetterApp && (
          <AwardLetterModal 
            application={awardLetterApp} 
            user={user} 
            onClose={() => setAwardLetterApp(null)} 
          />
        )}

      </div>
    </div>
  );
}
