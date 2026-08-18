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
  Trash2
} from 'lucide-react';
import NotificationCenter from '../../components/NotificationCenter';
import AnalyticsCharts from '../../components/AnalyticsCharts';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [newBudgetValue, setNewBudgetValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appWindowOpen, setAppWindowOpen] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        fetchUsers(token);
        fetchBudget(token);
        fetchAuditLogs(token);
      } catch (err) {
        console.error("Failed to load admin data", err);
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
      }
    } catch (err) {
      console.error(err);
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
        alert("System budget updated successfully!");
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
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-[#121820] text-slate-300 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-slate-800`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-[#0A0E14]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NG-CDF Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5 border border-[#DAA520]" />
            <div>
              <span className="text-white font-extrabold text-xs tracking-wide block leading-tight">NG-CDF Kibwezi West</span>
              <span className="text-slate-300 font-semibold text-[11px] block leading-tight">Constituency</span>
              <span className="text-[#C8102E] font-extrabold text-[10px] uppercase block tracking-wider mt-0.5">Super Admin Portal</span>
            </div>
          </div>
          <button className="md:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#DAA520] uppercase tracking-wider mb-4 px-2">Master Controls</div>
          
          <button 
            onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-[#C8102E] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span>User Management</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('budget'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'budget' ? 'bg-[#C8102E] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <DollarSign size={20} />
            <span>Budget Control</span>
          </button>

          <button 
            onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-[#C8102E] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart2 size={20} />
            <span>Master Analytics</span>
          </button>

          <button 
            onClick={() => { setActiveTab('audit'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'audit' ? 'bg-[#C8102E] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <ShieldCheck size={20} />
            <span>Audit Trail & Activity Logs</span>
          </button>

          <button 
            onClick={() => { setActiveTab('system'); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'system' ? 'bg-[#C8102E] text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Sliders size={20} />
            <span>Application Window</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 shadow-sm">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-slate-500 hover:text-navy" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={24} />
             </button>
             <h1 className="text-2xl font-bold text-navy hidden sm:block">System Administration Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-100 text-[#C8102E] font-extrabold text-xs rounded-full border border-red-200 shadow-sm">
              <ShieldCheck size={16} /> Super Administrator
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* User Role Management Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy">System Users & Privileges</h2>
                    <p className="text-sm text-slate-500">Assign or revoke system roles across all registered accounts.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64 shadow-sm"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Email / Phone</th>
                          <th className="px-6 py-4">System Role</th>
                          <th className="px-6 py-4">Account Status</th>
                          <th className="px-6 py-4 text-right">Actions & Privileges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-navy text-sm">{u.username}</div>
                              <div className="text-[11px] text-slate-400 font-medium">ID: {u.national_id || u.phone_number || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                              <div>{u.email || 'N/A'}</div>
                              <div className="text-[11px] text-slate-400">{u.phone_number || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                u.role === 'COMMITTEE' ? 'bg-purple-100 text-purple-800' :
                                u.role === 'FINANCE' ? 'bg-amber-100 text-amber-800' :
                                u.role === 'ADMINISTRATOR' || u.role === 'SUPER_ADMINISTRATOR' || u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {u.is_active !== false ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 size={12} /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                  <Lock size={12} /> Locked / Suspended
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <select 
                                  value={u.role} 
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                  className="border border-slate-300 rounded-lg py-1.5 px-2 text-xs font-semibold text-navy bg-white focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
                                  title="Assign System Role"
                                >
                                  <option value="APPLICANT">APPLICANT (Student)</option>
                                  <option value="COMMITTEE">COMMITTEE Member</option>
                                  <option value="FINANCE">FINANCE Officer</option>
                                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                                </select>

                                <button
                                  onClick={() => handleToggleStatus(u.id, u.is_active !== false, u.username)}
                                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors shadow-sm ${
                                    u.is_active !== false 
                                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                  title={u.is_active !== false ? "Suspend / Lock Account" : "Activate / Unlock Account"}
                                >
                                  {u.is_active !== false ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>

                                <button
                                  onClick={() => handleResetPassword(u.id, u.username)}
                                  className="p-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                                  title="Reset User Password"
                                >
                                  <KeyRound size={14} />
                                </button>

                                {user && user.id !== u.id && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                                    title="Delete User Account"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Control Tab */}
            {activeTab === 'budget' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-navy mb-2">Master Financial Budget Configuration</h2>
                <p className="text-sm text-slate-500 mb-6">Enforce the maximum monetary limit available for disbursement in the current financial year.</p>

                {budgetData && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Current Cap:</span>
                      <span className="font-bold text-navy">KSh {budgetData.total_budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Allocated / Paid Out:</span>
                      <span className="font-bold text-emerald-600">KSh {budgetData.allocated_budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                      <span className="text-slate-700 font-semibold">Remaining Funds:</span>
                      <span className="font-bold text-purple-700">KSh {budgetData.remaining_budget.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleUpdateBudget} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Budget Ceiling (KSh)</label>
                    <input 
                      type="number" 
                      value={newBudgetValue}
                      onChange={(e) => setNewBudgetValue(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-lg font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors">
                    Update Budget Ceiling
                  </button>
                </form>
              </div>
            )}

            {/* Master Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="animate-in fade-in duration-300">
                <AnalyticsCharts />
              </div>
            )}

            {/* Audit Trail & Activity Logs Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-2xl font-black text-[#121820]">Super-Admin Audit Trail</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Real-time immutable activity log of all committee approvals, finance payouts, and budget updates.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">User & Role</th>
                          <th className="px-6 py-4">Action Performed</th>
                          <th className="px-6 py-4">Event Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-bold text-[#121820] block">{log.user_name || 'System'}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase inline-block mt-0.5 border border-slate-200">
                                {log.role || 'USER'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                log.action.includes('APPROVE') ? 'bg-emerald-100 text-[#0F6B38]' :
                                log.action.includes('PAID') || log.action.includes('DISBURSED') ? 'bg-amber-100 text-[#DAA520]' :
                                log.action.includes('REJECT') ? 'bg-red-100 text-[#C8102E]' : 'bg-blue-100 text-blue-800'
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
                              No system activity recorded yet. Audit trail entries will appear when actions occur.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'system' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl animate-in fade-in duration-300 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-navy">Application Window Toggle</h2>
                  <p className="text-sm text-slate-500 mt-1">Open or close the bursary portal for student submissions.</p>
                </div>

                <div className={`p-6 rounded-2xl border flex items-center justify-between ${appWindowOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-4">
                    {appWindowOpen ? (
                      <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                        <Unlock size={24} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                        <Lock size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-navy">{appWindowOpen ? 'Bursary Submissions OPEN' : 'Bursary Submissions LOCKED'}</h3>
                      <p className="text-xs text-slate-600">{appWindowOpen ? 'Students can currently submit new bursary requests.' : 'New applications are blocked.'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setAppWindowOpen(!appWindowOpen)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all ${appWindowOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {appWindowOpen ? 'Lock Submissions' : 'Open Portal'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
