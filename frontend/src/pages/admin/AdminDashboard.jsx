import API_BASE_URL from '../../config';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Lock, 
  Unlock, 
  UserCheck, 
  Settings, 
  LogOut, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  Sliders,
  BarChart2,
  KeyRound,
  Trash2,
  Activity,
  Award,
  TrendingUp,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Edit,
  UserCog
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import AnalyticsCharts from '../../components/AnalyticsCharts';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [newBudgetValue, setNewBudgetValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appWindowOpen, setAppWindowOpen] = useState(() => {
    const cached = localStorage.getItem('app_window_open');
    return cached !== null ? cached === 'true' : true;
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // User Edit Modal States
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    national_id: '',
    role: 'APPLICANT'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) return window.location.href = '/';

        // Fetch Logged-in User
        const userRes = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        await Promise.all([
          fetchUsers(token),
          fetchBudget(token),
          fetchAuditLogs(token)
        ]);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchAuditLogs = async (token) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/applications/audit_logs/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  };

  const fetchUsers = async (token) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/auth/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBudget = async (token) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/v1/applications/budget/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBudgetData(data);
        setNewBudgetValue(data.total_budget);
        if (data.is_window_open !== undefined) {
          setAppWindowOpen(data.is_window_open);
          localStorage.setItem('app_window_open', data.is_window_open);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWindow = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_BASE_URL + '/api/v1/applications/toggle_window/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_window_open: !appWindowOpen })
      });
      if (res.ok) {
        const data = await res.json();
        setAppWindowOpen(data.is_window_open);
        localStorage.setItem('app_window_open', data.is_window_open);
        alert(`Application Window status updated to: ${data.is_window_open ? 'OPEN' : 'LOCKED'}`);
      } else {
        alert('Failed to update application window status');
      }
    } catch (err) {
      alert('Error updating application window status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${userId}/role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        alert('User role updated successfully!');
        fetchUsers(token);
      } else {
        alert('Failed to update user role');
      }
    } catch (err) {
      alert('Error updating user role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus, username) => {
    const actionName = currentStatus ? 'Lock/Suspend' : 'Unlock/Activate';
    if (!window.confirm(`Are you sure you want to ${actionName} access for user '${username}'?`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${userId}/role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchUsers(token);
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleResetPassword = async (userId, username) => {
    const newPwd = window.prompt(`Enter new password for user '${username}':`);
    if (!newPwd) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${userId}/role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPwd })
      });
      if (res.ok) {
        alert(`Password for user '${username}' reset successfully!`);
        fetchUsers(token);
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      alert('Error resetting password');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE user account '${username}'? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${userId}/role/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.status || 'User deleted successfully');
        fetchUsers(token);
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user account');
    }
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setEditFormData({
      username: u.username || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone_number: u.phone_number || '',
      national_id: u.national_id || '',
      role: u.role || 'APPLICANT'
    });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/users/${editingUser.id}/role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('User profile details updated successfully!');
        setEditingUser(null);
        fetchUsers(token);
      } else {
        alert('Failed to update user details');
      }
    } catch (err) {
      alert('Error saving user profile edits');
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
      if (res.ok) {
        alert("System budget ceiling updated successfully!");
        fetchBudget(token);
      } else {
        alert("Failed to update budget");
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

  const filteredUsers = usersList.filter(u => {
    // Role filter
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

    // Search term filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.national_id && u.national_id.toLowerCase().includes(term)) ||
      (u.phone_number && u.phone_number.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  // Calculate user summary stats
  const totalStudents = usersList.filter(u => u.role === 'APPLICANT').length;
  const totalStaff = usersList.filter(u => ['COMMITTEE', 'FINANCE', 'ADMINISTRATOR', 'SUPER_ADMINISTRATOR', 'ADMIN'].includes(u.role)).length;
  const budgetAllocated = budgetData ? budgetData.allocated_budget : 0;
  const budgetTotal = budgetData ? budgetData.total_budget : 20000000;
  const budgetRemaining = budgetData ? budgetData.remaining_budget : 20000000;
  const percentAllocated = budgetTotal > 0 ? Math.min(100, Math.round((budgetAllocated / budgetTotal) * 100)) : 0;

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Premium Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-[#0B1320] text-slate-300 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800/80 shadow-2xl`}>
        {/* Brand Header */}
        <div className="h-24 flex items-center px-6 border-b border-slate-800/80 bg-[#060A12] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3.5 z-10">
            <div className="relative">
              <img src="/logo.png" alt="NG-CDF Logo" className="w-11 h-11 object-contain bg-white rounded-full p-0.5 border-2 border-[#DAA520] shadow-lg" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#060A12] rounded-full"></span>
            </div>
            <div>
              <span className="text-white font-black text-xs tracking-wider block leading-tight">NG-CDF KIBWEZI WEST</span>
              <span className="text-slate-400 font-semibold text-[11px] block leading-tight">National Bursary System</span>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-full shadow-sm">
                <ShieldCheck size={10} /> Super Admin Portal
              </span>
            </div>
          </div>
          <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>
        
        {/* Navigation Options */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black text-[#DAA520] uppercase tracking-widest mb-3 px-3 flex items-center justify-between">
            <span>Executive Controls</span>
            <Sparkles size={12} className="text-[#DAA520]" />
          </div>
          
          <button 
            onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-[#C8102E] to-red-700 text-white shadow-lg shadow-red-900/30 border border-red-500/30' 
                : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className={activeTab === 'users' ? 'text-white' : 'text-slate-400'} />
              <span>User Management</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-800/80 rounded-full border border-slate-700 text-slate-300">
              {usersList.length}
            </span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('budget'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeTab === 'budget' 
                ? 'bg-gradient-to-r from-[#C8102E] to-red-700 text-white shadow-lg shadow-red-900/30 border border-red-500/30' 
                : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign size={18} className={activeTab === 'budget' ? 'text-white' : 'text-slate-400'} />
              <span>Budget Control</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              {percentAllocated}%
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeTab === 'analytics' 
                ? 'bg-gradient-to-r from-[#C8102E] to-red-700 text-white shadow-lg shadow-red-900/30 border border-red-500/30' 
                : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart2 size={18} className={activeTab === 'analytics' ? 'text-white' : 'text-slate-400'} />
              <span>Master Analytics</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
              Live
            </span>
          </button>

          <div className="text-[10px] font-black text-[#DAA520] uppercase tracking-widest pt-4 mb-3 px-3">
            System Governance
          </div>

          <button 
            onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeTab === 'audit' 
                ? 'bg-gradient-to-r from-[#C8102E] to-red-700 text-white shadow-lg shadow-red-900/30 border border-red-500/30' 
                : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className={activeTab === 'audit' ? 'text-white' : 'text-slate-400'} />
              <span>Audit Trail & Activity Logs</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              {auditLogs.length}
            </span>
          </button>

          <button 
            onClick={() => { setActiveTab('system'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeTab === 'system' 
                ? 'bg-gradient-to-r from-[#C8102E] to-red-700 text-white shadow-lg shadow-red-900/30 border border-red-500/30' 
                : 'hover:bg-slate-800/80 hover:text-white text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders size={18} className={activeTab === 'system' ? 'text-white' : 'text-slate-400'} />
              <span>Application Window</span>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${appWindowOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
          </button>
        </nav>
        
        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060A12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center font-black text-xs shadow-md border border-white/20">
              {user ? (user.username || 'SA')[0].toUpperCase() : 'SA'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user ? user.username : 'Super Admin'}</p>
              <p className="text-[10px] text-amber-400 font-semibold truncate">Master Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Command Center Layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Glassmorphic Top Header */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-10 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-slate-600 hover:text-[#0B1320]" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} />
             </button>
             <div>
               <h1 className="text-xl lg:text-2xl font-black text-[#0B1320] tracking-tight">Executive Command Center</h1>
               <p className="text-xs text-slate-500 font-medium hidden sm:block">NG-CDF Kibwezi West Constituency Bursary Management System</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 border border-slate-200">
              <Clock size={14} className="text-amber-600" />
              <span>FY 2026/2027</span>
            </div>

            <NotificationCenter />

            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-red-50 to-rose-100 text-[#C8102E] font-extrabold text-xs rounded-xl border border-red-200 shadow-sm">
              <ShieldCheck size={16} className="text-[#C8102E]" />
              <span className="hidden sm:inline">Super Administrator</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Executive Summary Metrics KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Total Users */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Registered Users</span>
                    <h3 className="text-2xl font-black text-[#0B1320]">{usersList.length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <Users size={20} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <span>Students: <strong className="text-slate-800">{totalStudents}</strong></span>
                  <span>Staff: <strong className="text-blue-700">{totalStaff}</strong></span>
                </div>
              </div>

              {/* Card 2: Financial Ceiling */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Bursary Fund Cap</span>
                    <h3 className="text-2xl font-black text-[#0B1320]">KSh {(budgetTotal / 1000000).toFixed(1)}M</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Allocated: KSh {(budgetAllocated / 1000).toLocaleString()}k</span>
                    <span className="text-emerald-600">{percentAllocated}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentAllocated}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Card 3: Audit Trail Events */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">System Audit Events</span>
                    <h3 className="text-2xl font-black text-[#0B1320]">{auditLogs.length}</h3>
                  </div>
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold pt-2 border-t border-slate-100">
                  <Activity size={14} />
                  <span>Immutable Log Active</span>
                </div>
              </div>

              {/* Card 4: Portal Status */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Portal Window</span>
                    <h3 className={`text-xl font-black ${appWindowOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                      {appWindowOpen ? 'OPEN' : 'LOCKED'}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl border ${appWindowOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {appWindowOpen ? <Unlock size={20} /> : <Lock size={20} />}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className={`w-2 h-2 rounded-full ${appWindowOpen ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></span>
                  <span>{appWindowOpen ? 'Accepting Applicant Submissions' : 'Submissions Blocked'}</span>
                </div>
              </div>

            </div>

            {/* TAB 1: User Management & Privileges */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Search and Filters Bar */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-[#0B1320] flex items-center gap-2">
                      <Users className="text-red-600" size={20} />
                      System User Accounts & Governance
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage user access, role privileges, passwords, and security locks.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Role Filter Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 w-full sm:w-auto">
                      <button 
                        onClick={() => setRoleFilter('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter === 'ALL' ? 'bg-white text-navy shadow-sm' : 'hover:text-navy'}`}
                      >
                        All ({usersList.length})
                      </button>
                      <button 
                        onClick={() => setRoleFilter('APPLICANT')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter === 'APPLICANT' ? 'bg-white text-navy shadow-sm' : 'hover:text-navy'}`}
                      >
                        Students
                      </button>
                      <button 
                        onClick={() => setRoleFilter('COMMITTEE')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter === 'COMMITTEE' ? 'bg-white text-purple-700 shadow-sm' : 'hover:text-purple-700'}`}
                      >
                        Committee
                      </button>
                      <button 
                        onClick={() => setRoleFilter('FINANCE')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter === 'FINANCE' ? 'bg-white text-amber-700 shadow-sm' : 'hover:text-amber-700'}`}
                      >
                        Finance
                      </button>
                      <button 
                        onClick={() => setRoleFilter('ADMINISTRATOR')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${roleFilter === 'ADMINISTRATOR' ? 'bg-white text-red-700 shadow-sm' : 'hover:text-red-700'}`}
                      >
                        Admins
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <input 
                        type="text" 
                        placeholder="Search name, ID, phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 bg-slate-50 focus:bg-white shadow-inner transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Users Master Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0B1320] text-slate-300 text-[11px] font-extrabold uppercase tracking-wider">
                          <th className="px-6 py-4">User Identity</th>
                          <th className="px-6 py-4">Contact Info</th>
                          <th className="px-6 py-4">Current Role</th>
                          <th className="px-6 py-4">Account Status</th>
                          <th className="px-6 py-4 text-right">Actions & Privileges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                            
                            {/* User Identity Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-sm border border-slate-700">
                                  {(u.username || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-[#0B1320] text-sm group-hover:text-red-600 transition-colors">{u.username}</div>
                                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                    <span>Nat ID / Phone:</span>
                                    <strong className="text-slate-600">{u.national_id || u.phone_number || 'N/A'}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Info Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs font-bold text-slate-700">{u.email || 'N/A'}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{u.phone_number || ''}</div>
                            </td>

                            {/* Role Badge Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-black tracking-wide shadow-sm ${
                                u.role === 'COMMITTEE' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                u.role === 'FINANCE' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                u.role === 'ADMINISTRATOR' || u.role === 'SUPER_ADMINISTRATOR' || u.role === 'ADMIN' ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-900/20' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {u.role}
                              </span>
                            </td>

                            {/* Account Status Badge Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {u.is_active !== false ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black bg-red-50 text-red-700 border border-red-200">
                                  <Lock size={12} /> Suspended
                                </span>
                              )}
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                
                                {/* Change Role Selector */}
                                <select 
                                  value={u.role} 
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="border border-slate-300 rounded-xl py-1.5 px-2.5 text-xs font-bold text-[#0B1320] bg-white focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm hover:border-slate-400 transition-colors"
                                  title="Assign System Role"
                                >
                                  <option value="APPLICANT">Student (Applicant)</option>
                                  <option value="COMMITTEE">Committee Member</option>
                                  <option value="FINANCE">Finance Officer</option>
                                  <option value="ADMINISTRATOR">Administrator</option>
                                </select>

                                {/* Edit User Profile Button */}
                                <button
                                  onClick={() => handleOpenEditModal(u)}
                                  className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                  title="Edit User Profile (Username, Name, Email, Phone, ID)"
                                >
                                  <Edit size={15} />
                                </button>

                                {/* Lock / Unlock Button */}
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.is_active !== false, u.username)}
                                  className={`p-2 rounded-xl border text-xs font-extrabold flex items-center gap-1 transition-all shadow-sm ${
                                    u.is_active !== false 
                                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-400' 
                                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'
                                  }`}
                                  title={u.is_active !== false ? "Suspend / Lock Account" : "Activate / Unlock Account"}
                                >
                                  {u.is_active !== false ? <Lock size={15} /> : <Unlock size={15} />}
                                </button>

                                {/* Reset Password Button */}
                                <button
                                  onClick={() => handleResetPassword(u.id, u.username)}
                                  className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-400 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                  title="Reset Password"
                                >
                                  <KeyRound size={15} />
                                </button>

                                {/* Delete User Button */}
                                {user && user.id !== u.id && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                                    title="Delete Account"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-400 text-xs font-semibold">
                              No matching user accounts found for "{searchTerm}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Budget Control */}
            {activeTab === 'budget' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                
                {/* Left Column: Form Configuration */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-black text-[#0B1320] flex items-center gap-2">
                        <DollarSign className="text-emerald-600" size={22} />
                        Master Financial Budget Ceiling Configuration
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Set maximum funds available for bursary disbursement for FY 2026/2027.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200">
                      Live Enforced
                    </span>
                  </div>

                  {budgetData && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Financial Cap</span>
                          <span className="text-xl font-black text-[#0B1320]">KSh {budgetData.total_budget.toLocaleString()}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Disbursed / Paid</span>
                          <span className="text-xl font-black text-emerald-600">KSh {budgetData.allocated_budget.toLocaleString()}</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
                          <span className="text-xl font-black text-purple-700">KSh {budgetData.remaining_budget.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Allocation Gauge</span>
                          <span>{percentAllocated}% Utilized</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500" style={{ width: `${percentAllocated}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ceiling Form */}
                  <form onSubmit={handleUpdateBudget} className="space-y-5">
                    <div>
                      <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-2">
                        Enter New Financial Ceiling (KSh)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-base">KSh</span>
                        <input 
                          type="number" 
                          value={newBudgetValue}
                          onChange={(e) => setNewBudgetValue(e.target.value)}
                          className="w-full pl-16 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-xl font-black text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Preset Buttons */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Presets:</span>
                      <div className="flex flex-wrap gap-2">
                        {[10000000, 15000000, 20000000, 25000000, 30000000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setNewBudgetValue(amt)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                          >
                            KSh {(amt / 1000000).toFixed(0)}M
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-gradient-to-r from-[#C8102E] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign size={18} /> Update Financial Budget Ceiling
                    </button>
                  </form>
                </div>

                {/* Right Column: Ward Budget Preview Breakdown */}
                <div className="space-y-4">
                  <div className="bg-[#0B1320] text-white p-6 rounded-2xl shadow-md border border-slate-800">
                    <h3 className="font-extrabold text-sm text-[#DAA520] uppercase tracking-wider mb-1">Ward Allocations Breakdown</h3>
                    <p className="text-xs text-slate-400 mb-4">Estimated bursary pool distribution across 6 Kibwezi West wards.</p>

                    <div className="space-y-3">
                      {['Kibwezi Town', 'Nguumo', 'Makindu', 'Kikumbulyu North', 'Kikumbulyu South', 'Nguu/Masumba'].map((ward, idx) => {
                        const wardCap = Math.round(budgetTotal / 6);
                        return (
                          <div key={ward} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{ward}</span>
                            <span className="font-mono text-amber-400 font-bold">KSh {(wardCap / 1000000).toFixed(2)}M</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Master Analytics */}
            {activeTab === 'analytics' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#0B1320] flex items-center gap-2">
                      <BarChart2 className="text-red-600" size={22} />
                      Constituency Bursary Analytics & Reports
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Real-time statistics on application scoring, ward breakdown, and disbursement speed.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-xs rounded-full border border-blue-200">
                    Live Telemetry
                  </span>
                </div>

                <AnalyticsCharts />
              </div>
            )}

            {/* TAB 4: Audit Trail & Activity Logs */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#0B1320] flex items-center gap-2">
                      <ShieldCheck className="text-purple-600" size={22} />
                      Super-Admin Immutable Audit Trail
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Cryptographically verifiable log of all system approvals, disbursements, and password resets.</p>
                  </div>
                  <button 
                    onClick={() => { const token = localStorage.getItem('access_token'); fetchAuditLogs(token); }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={14} /> Refresh Logs
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#0B1320] text-amber-400 uppercase text-[11px] font-extrabold tracking-wider">
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">User & Role</th>
                          <th className="px-6 py-4">Action Event</th>
                          <th className="px-6 py-4">Details & Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-extrabold text-[#0B1320] block">{log.user_name || 'System'}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase inline-block mt-0.5 border border-slate-200">
                                {log.role || 'USER'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                log.action.includes('APPROVE') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                log.action.includes('PAID') || log.action.includes('DISBURSED') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                log.action.includes('REJECT') || log.action.includes('DELETE') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-700 font-medium leading-relaxed">
                              {log.details}
                            </td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                              No system activity recorded yet. Audit trail entries will appear automatically when actions occur.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Application Window Control */}
            {activeTab === 'system' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl animate-in fade-in duration-300 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#0B1320] flex items-center gap-2">
                    <Sliders className="text-amber-600" size={22} />
                    Application Window Control
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Open or close the bursary portal for student submissions.</p>
                </div>

                <div className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${appWindowOpen ? 'bg-emerald-50/60 border-emerald-300' : 'bg-red-50/60 border-red-300'}`}>
                  <div className="flex items-center gap-4">
                    {appWindowOpen ? (
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold shadow-inner">
                        <Unlock size={28} />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center font-bold shadow-inner">
                        <Lock size={28} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B1320]">{appWindowOpen ? 'Bursary Submissions OPEN' : 'Bursary Submissions LOCKED'}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{appWindowOpen ? 'Students across all 6 constituency wards can currently submit new bursary requests.' : 'New student applications are temporarily blocked.'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleToggleWindow}
                    className={`px-5 py-3 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all ${appWindowOpen ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'}`}
                  >
                    {appWindowOpen ? 'Lock Portal Submissions' : 'Open Application Window'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Edit User Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#0B1320] text-white p-6 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-tr from-amber-500 to-red-600 rounded-xl text-white shadow-md">
                  <UserCog size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Edit User Profile Details</h3>
                  <p className="text-xs text-slate-400">Modifying profile for user: <strong className="text-amber-400">{editingUser.username}</strong></p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">Username</label>
                  <input 
                    type="text" 
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">National ID / Reg No</label>
                  <input 
                    type="text" 
                    value={editFormData.national_id}
                    onChange={(e) => setEditFormData({ ...editFormData, national_id: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={editFormData.phone_number}
                    onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0B1320] uppercase tracking-wider mb-1">System Role</label>
                <select 
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-[#0B1320] focus:ring-2 focus:ring-red-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="APPLICANT">Student (Applicant)</option>
                  <option value="COMMITTEE">Committee Member</option>
                  <option value="FINANCE">Finance Officer</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
