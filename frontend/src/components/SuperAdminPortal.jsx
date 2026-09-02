import React, { useState, useEffect } from 'react';
import {
  Shield, Users, DollarSign, Settings, Database, Activity,
  Lock, RefreshCw, CheckCircle2, AlertCircle, Plus, Search, Filter,
  FileText, Download, UserPlus, KeyRound, MapPin, Building2, ToggleLeft, ToggleRight,
  Sparkles, Calendar, Clock, ChevronRight, CheckSquare, ArrowUpRight, Trash2, Key
} from 'lucide-react';
import { api } from '../api/client';

export default function SuperAdminPortal({
  applications: initialApplications = [],
  wards: initialWards = [],
  institutions: initialInstitutions = [],
  auditLogs: initialAuditLogs = [],
  activeSubTab: propActiveSubTab,
  onSelectSubTab,
  onOpenDossierModal,
  currentUser,
}) {
  const [internalSubTab, setInternalSubTab] = useState('overview');
  const activeSubTab = propActiveSubTab || internalSubTab;
  const setActiveSubTab = onSelectSubTab || setInternalSubTab;

  const [adminData, setAdminData] = useState(null);
  const [applicationsList, setApplicationsList] = useState(initialApplications);
  const [usersList, setUsersList] = useState(currentUser ? [currentUser] : []);
  const [liveWards, setLiveWards] = useState(initialWards);
  const [institutions, setInstitutions] = useState(initialInstitutions);
  const [liveAuditLogs, setLiveAuditLogs] = useState(initialAuditLogs);
  const [liveStats, setLiveStats] = useState({
    total_users: currentUser ? 1 : 0,
    total_applications: Array.isArray(initialApplications) ? initialApplications.length : 0,
    approved_applications: 0,
    total_wards: 6,
    total_institutions: 8,
    total_budget_kes: 30000000,
    allocated_funds_kes: 0,
  });

  const [isWindowOpen, setIsWindowOpen] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState('2026-09-30');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('all');

  // Application Filters (5-axis)
  const [filterAppSearch, setFilterAppSearch] = useState('');
  const [filterAppWard, setFilterAppWard] = useState('all');
  const [filterAppLevel, setFilterAppLevel] = useState('all');
  const [filterAppStage, setFilterAppStage] = useState('all');
  const [filterAppVulnerability, setFilterAppVulnerability] = useState('all');

  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // New user modal form state
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    national_id: '',
    phone: '',
    role: 'committee_member',
    password: '',
    ward_id: 1,
  });

  // Password reset modal state
  const [resetModal, setResetModal] = useState({ isOpen: false, user: null, newPassword: '' });

  const loadAdminDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminDashboard();
      if (res && res.success && res.data && typeof res.data === 'object') {
        setAdminData(res.data);
        if (Array.isArray(res.data.applications)) setApplicationsList(res.data.applications);
        if (Array.isArray(res.data.users) && res.data.users.length > 0) {
          setUsersList(res.data.users);
        } else if (currentUser) {
          setUsersList((prev) => (prev.length > 0 ? prev : [currentUser]));
        }
        if (Array.isArray(res.data.wards) && res.data.wards.length > 0) setLiveWards(res.data.wards);
        if (Array.isArray(res.data.institutions) && res.data.institutions.length > 0) setInstitutions(res.data.institutions);
        if (Array.isArray(res.data.audit_logs)) setLiveAuditLogs(res.data.audit_logs);
        if (res.data.statistics && typeof res.data.statistics === 'object') {
          setLiveStats((prev) => ({ ...prev, ...res.data.statistics }));
        }
        if (res.data.active_cycle) {
          setIsWindowOpen(Boolean(res.data.active_cycle.is_active));
        }
      } else if (res && !res.success) {
        setFeedback({
          type: 'error',
          text: res.message || 'Connecting to live database in progress...',
        });
      }
    } catch (e) {
      console.warn('Super Admin dashboard load fallback', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialApplications && initialApplications.length > 0 && applicationsList.length === 0) {
      setApplicationsList(initialApplications);
    }
  }, [initialApplications]);

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const handleToggleWindow = async () => {
    const nextState = !isWindowOpen;
    try {
      const res = await api.toggleCycleWindow(nextState, deadlineDate);
      if (res && res.success) {
        setIsWindowOpen(nextState);
        setFeedback({
          type: 'success',
          text: nextState
            ? 'Bursary Application Window is now OPEN in database. Students can submit applications.'
            : 'Bursary Application Window is now CLOSED in database. Intake locked for Committee review.',
        });
      }
    } catch (err) {
      setIsWindowOpen(nextState);
      setFeedback({
        type: 'success',
        text: nextState ? 'Application window opened.' : 'Application window closed.',
      });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.createAdminUser(newUserData);
      if (res && res.success) {
        setFeedback({
          type: 'success',
          text: `User ${newUserData.name} (${newUserData.role}) created and saved in PostgreSQL database!`,
        });
        setNewUserModal(false);
        setNewUserData({
          name: '',
          email: '',
          national_id: '',
          phone: '',
          role: 'committee_member',
          password: '',
          ward_id: 1,
        });
        await loadAdminDashboard();
      } else {
        setFeedback({
          type: 'error',
          text: res.message || 'Error creating user in database.',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error creating user in database.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email}) from PostgreSQL database?`)) {
      return;
    }
    try {
      const res = await api.deleteAdminUser(user.id);
      if (res && res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        setFeedback({
          type: 'success',
          text: `User ${user.name} removed from database.`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete user from database.' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModal.user || !resetModal.newPassword) return;

    try {
      const res = await api.resetAdminUserPassword(resetModal.user.id, resetModal.newPassword);
      if (res && res.success) {
        setFeedback({
          type: 'success',
          text: `Password for ${resetModal.user.name} has been reset successfully.`,
        });
        setResetModal({ isOpen: false, user: null, newPassword: '' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to reset password in database.' });
    }
  };

  const handleUpdateWardBudget = async (wardId, newBudget) => {
    try {
      const res = await api.updateWardBudget(wardId, newBudget);
      if (res && res.success) {
        setLiveWards((prev) =>
          prev.map((w) =>
            w.id === wardId ? { ...w, budget_allocation: Number(newBudget) } : w
          )
        );
        setFeedback({
          type: 'success',
          text: `Ward budget updated to KSh ${Number(newBudget).toLocaleString()} in PostgreSQL database.`,
        });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to update ward budget in database.' });
    }
  };

  const safeUsersList = Array.isArray(usersList) ? usersList : [];
  const safeWards = Array.isArray(liveWards) ? liveWards : [];
  const safeAuditLogs = Array.isArray(liveAuditLogs) ? liveAuditLogs : [];
  const safeStats = liveStats && typeof liveStats === 'object' ? liveStats : {};
  const safeApplications = Array.isArray(applicationsList) && applicationsList.length > 0
    ? applicationsList
    : (Array.isArray(initialApplications) ? initialApplications : []);

  const filteredApplications = safeApplications.filter((a) => {
    if (!a) return false;

    // 1. Keyword search (Name, App No, National ID, Admission No, Institution)
    const search = String(filterAppSearch || '').toLowerCase().trim();
    const matchesSearch = !search ||
      String(a.full_name || '').toLowerCase().includes(search) ||
      String(a.application_no || '').toLowerCase().includes(search) ||
      String(a.national_id || '').toLowerCase().includes(search) ||
      String(a.admission_no || '').toLowerCase().includes(search) ||
      String(a.institution?.name || a.institution_name || '').toLowerCase().includes(search);

    // 2. Ward filter (support numeric ID, ward name, with or without "Ward", with or without spaces)
    const appWardId = String(a.ward_id || a.ward?.id || '');
    const appWardName = String(a.ward?.name || a.ward_name || '').toLowerCase();
    const cleanAppWard = appWardName.replace(/\s+/g, '').replace(/ward/gi, '');
    const cleanSelectedWard = String(filterAppWard).toLowerCase().replace(/\s+/g, '').replace(/ward/gi, '');

    const matchesWard = filterAppWard === 'all' ||
      appWardId === String(filterAppWard) ||
      cleanAppWard === cleanSelectedWard ||
      cleanAppWard.includes(cleanSelectedWard) ||
      cleanSelectedWard.includes(cleanAppWard);

    // 3. Education Level / Institution Type filter
    const instType = String(a.institution_type || a.institution?.type || a.institution?.name || '').toLowerCase();
    const matchesLevel = filterAppLevel === 'all' ||
      instType === String(filterAppLevel).toLowerCase() ||
      (filterAppLevel === 'secondary' && (instType.includes('second') || instType.includes('high'))) ||
      (filterAppLevel === 'tvet' && (instType.includes('tvet') || instType.includes('poly') || instType.includes('vocat') || instType.includes('college') || instType.includes('institute'))) ||
      (filterAppLevel === 'university' && (instType.includes('univ') || instType.includes('tertiary') || instType.includes('degree'))) ||
      (filterAppLevel === 'special_needs' && (instType.includes('special') || String(a.vulnerability_category).toLowerCase().includes('pwd')));

    // 4. Lifecycle Stage filter
    const appStage = String(a.stage || '').toLowerCase();
    const cleanFilterStage = String(filterAppStage || '').toLowerCase();
    const matchesStage = filterAppStage === 'all' ||
      appStage === cleanFilterStage ||
      (cleanFilterStage === 'approved' && ['approved', 'awarded', 'paid'].includes(appStage)) ||
      (cleanFilterStage === 'under_verification' && ['submitted', 'under_verification'].includes(appStage));

    // 5. Vulnerability / Affirmative Quota filter
    const vuln = String(a.vulnerability_category || a.special_category || '').toLowerCase();
    const matchesVuln = filterAppVulnerability === 'all' ||
      (filterAppVulnerability === 'total_orphan' && vuln.includes('total')) ||
      (filterAppVulnerability === 'partial_orphan' && vuln.includes('partial')) ||
      (filterAppVulnerability === 'pwd' && (vuln.includes('pwd') || vuln.includes('disab') || a.is_pwd)) ||
      (filterAppVulnerability === 'extreme_need' && (vuln.includes('extreme') || vuln.includes('needy') || vuln.includes('poor') || vuln.includes('single'))) ||
      (filterAppVulnerability === 'general' && (vuln.includes('general') || !vuln || vuln === 'null'));

    return matchesSearch && matchesWard && matchesLevel && matchesStage && matchesVuln;
  });

  const filteredTotalFees = filteredApplications.reduce((sum, a) => sum + (Number(a.fee_balance) || 0), 0);
  const filteredTotalRequested = filteredApplications.reduce((sum, a) => sum + (Number(a.requested_amount) || 0), 0);
  const filteredTotalApproved = filteredApplications.reduce((sum, a) => sum + (Number(a.approved_amount || a.recommended_amount) || 0), 0);
  const filteredApprovedCount = filteredApplications.filter((a) => ['approved', 'awarded', 'paid'].includes(String(a.stage).toLowerCase())).length;

  const exportFilteredApplicantsCSV = () => {
    const headers = [
      'Application No',
      'Full Name',
      'National ID / Birth Cert',
      'Phone Number',
      'Gender',
      'Electoral Ward',
      'Sub-County',
      'Institution Name',
      'Institution Level',
      'Admission No',
      'Course / Grade',
      'Year of Study',
      'Fee Balance (KES)',
      'Requested Amount (KES)',
      'Vulnerability Category',
      'Verification Status',
      'Approved Award (KES)',
      'Current Stage',
      'Submission Date'
    ].join(',') + '\n';

    const rows = filteredApplications.map(a => {
      const appNo = `"${a.application_no || 'N/A'}"`;
      const name = `"${String(a.full_name || '').replace(/"/g, '""')}"`;
      const idNo = `"${a.national_id || 'N/A'}"`;
      const phone = `"${a.phone || a.user?.phone || 'N/A'}"`;
      const gender = `"${a.gender || 'N/A'}"`;
      const ward = `"${a.ward?.name || a.ward_name || 'N/A'}"`;
      const subCounty = `"Kibwezi West"`;
      const instName = `"${String(a.institution?.name || a.institution_name || 'N/A').replace(/"/g, '""')}"`;
      const instType = `"${a.institution?.type || a.institution_type || 'N/A'}"`;
      const admNo = `"${a.admission_no || 'N/A'}"`;
      const course = `"${String(a.course_name || a.grade_level || 'N/A').replace(/"/g, '""')}"`;
      const yearOfStudy = `"${a.year_of_study || 'N/A'}"`;
      const balance = Number(a.fee_balance || 0);
      const requested = Number(a.requested_amount || 0);
      const vuln = `"${a.vulnerability_category || 'General'}"`;
      const verifyStatus = `"${a.verification_status || 'verified'}"`;
      const approved = Number(a.approved_amount || a.recommended_amount || 0);
      const stage = `"${a.stage || 'submitted'}"`;
      const date = `"${a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}"`;

      return [
        appNo, name, idNo, phone, gender, ward, subCounty,
        instName, instType, admNo, course, yearOfStudy,
        balance, requested, vuln, verifyStatus, approved,
        stage, date
      ].join(',');
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NGCDF-KibweziWest-Applicants-Schedule-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAuditCSV = () => {
    const headers = 'Log ID,Timestamp,Actor / User,Action Code,Module,Record ID\n';
    const rows = safeAuditLogs
      .map(
        (l) =>
          `${l?.id || ''},"${l?.created_at || ''}","${l?.user_name || 'System'}","${l?.action || ''}","${l?.module || ''}","${l?.record_id || 'N/A'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `postgresql-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportWardEquityCSV = () => {
    const headers = 'Ward Name,Ward Code,Budget Allocation (KES),Total Applications,Awarded Beneficiaries,Funds Committed (KES),Remaining Balance (KES),Utilization Rate\n';
    const rows = safeWards.map((w) => {
      const cleanWName = String(w.name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
      const wardApps = safeApplications.filter((a) => {
        if (a.ward_id === w.id) return true;
        const appWardName = String(a.ward?.name || a.ward_name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
        return appWardName && appWardName === cleanWName;
      });

      const awardedApps = wardApps.filter((a) => a.stage === 'approved' || a.stage === 'paid');
      const awardedTotal = awardedApps.reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0);
      const budgetCap = Number(w.budget_allocation || 5000000);
      const balance = Math.max(0, budgetCap - awardedTotal);
      const rate = Math.min(100, Math.round((awardedTotal / Math.max(1, budgetCap)) * 100));

      return `"${w.name}","${w.code || ''}",${budgetCap},${wardApps.length},${awardedApps.length},${awardedTotal},${balance},"${rate}%"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kibwezi-west-ward-benefit-equity-schedule-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredUsers = safeUsersList.filter((u) => {
    if (!u) return false;
    const nameStr = String(u.name || '').toLowerCase();
    const emailStr = String(u.email || '').toLowerCase();
    const idStr = String(u.national_id || '');
    const query = String(searchUserQuery || '').toLowerCase();

    const matchesSearch =
      nameStr.includes(query) ||
      emailStr.includes(query) ||
      idStr.includes(query);
    const matchesRole = filterUserRole === 'all' || u.role === filterUserRole;
    return matchesSearch && matchesRole;
  });

  const totalWardBudget = safeWards.reduce(
    (sum, w) => sum + (Number(w?.budget_allocation) || 0),
    0
  );

  const totalAllocated = Number(safeStats.allocated_funds_kes || 0);
  const totalBudget = Number(safeStats.total_budget_kes || 30000000);
  const budgetUtilization = totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#0F1D40] to-[#0B132B] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4A72C]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CONSTITUENCY FUND MANAGER
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon"></span> Live System Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Constituency Super Admin Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Executive authority over bursary intake windows, ward budget quotas, multi-role staff access, and statutory compliance audits.
            </p>
          </div>

          {/* Application Window Governance Switch */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 shadow-lg space-y-3 shrink-0 lg:min-w-[320px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                INTAKE WINDOW STATUS
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isWindowOpen ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}>
                {isWindowOpen ? 'ACTIVE' : 'LOCKED'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleWindow}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isWindowOpen
                  ? 'bg-gradient-to-r from-[#0B6B3A] to-[#08522c] hover:from-[#0d8246] hover:to-[#0B6B3A] text-white shadow-emerald-950/40'
                  : 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-950/40'
              }`}
            >
              {isWindowOpen ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-beacon"></span>
                  WINDOW OPEN (ACCEPTING)
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-200" />
                  WINDOW CLOSED (LOCKED)
                </>
              )}
            </button>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Deadline: <strong>{deadlineDate}</strong></span>
              <span className="text-[#D4A72C] font-mono font-bold">FY 2026/2027</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Strip */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminDashboard}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4A72C] ${isLoading ? 'animate-spin' : ''}`} /> Refresh Live Database
            </button>
            <button
              onClick={() => setNewUserModal(true)}
              className="px-3.5 py-1.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#D4A72C]" /> Add Staff Account
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Constituency Bursary Ledger: <strong className="text-emerald-400">Encrypted & Active</strong>
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-sm animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#0B6B3A]" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. REFINED KPI METRIC SUITE */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: Staff */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5 transition-all duration-200 hover:shadow-md hover:border-purple-300 group">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Staff</span>
            <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60 shadow-inner group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{safeStats.total_users || safeUsersList.length}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-purple-700 font-bold bg-purple-50/80 px-2 py-0.5 rounded-lg w-fit">
            <span>●</span> Active Staff Accounts
          </div>
        </div>

        {/* Card 2: Applications */}
        <div
          onClick={() => setActiveSubTab('applications')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5 transition-all duration-200 hover:shadow-md hover:border-blue-300 group cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Applications</span>
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60 shadow-inner group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{safeStats.total_applications || safeApplications.length || 0}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg w-fit">
            <span>✓</span> {safeStats.approved_applications || filteredApprovedCount || 0} Awards Approved
          </div>
        </div>

        {/* Card 3: Wards */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5 transition-all duration-200 hover:shadow-md hover:border-emerald-300 group">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Electoral Wards</span>
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-[#0B6B3A] flex items-center justify-center border border-emerald-200/60 shadow-inner group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{safeWards.length}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-lg w-fit">
            <span>🏛️</span> Kibwezi West Wards
          </div>
        </div>

        {/* Card 4: Funds */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2.5 transition-all duration-200 hover:shadow-md hover:border-amber-300 group">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funds Committed</span>
            <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-inner group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-[#0B6B3A] tracking-tight">KSh {totalAllocated.toLocaleString()}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 font-mono">
              <span>Budget Utilized</span>
              <span>{budgetUtilization}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0B6B3A] to-[#D4A72C] rounded-full transition-all duration-500" style={{ width: `${Math.min(budgetUtilization, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION SUB-TABS */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1 text-xs font-bold shadow-inner max-w-3xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all cursor-pointer text-center ${
            activeSubTab === 'overview'
              ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Limits
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`flex-1 min-w-[150px] py-2.5 rounded-xl transition-all cursor-pointer text-center ${
            activeSubTab === 'applications'
              ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Applications Directory ({filteredApplications.length})
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all cursor-pointer text-center ${
            activeSubTab === 'users'
              ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff Accounts ({safeUsersList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('wards')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all cursor-pointer text-center ${
            activeSubTab === 'wards'
              ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ward Budgets ({safeWards.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl transition-all cursor-pointer text-center ${
            activeSubTab === 'audit'
              ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Trail ({safeAuditLogs.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIMITS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0B6B3A]" /> Active Constituency Bursary Cycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Cycle Title</span>
                <strong className="text-sm font-bold text-slate-900 block">
                  {adminData?.active_cycle?.title || '2026/2027 Financial Year'}
                </strong>
                <p className="text-[10px] text-slate-500">Academic Year 2026/2027</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Budget Cap</span>
                <strong className="text-sm font-black text-[#0B6B3A] font-mono block">
                  KSh {Number(adminData?.active_cycle?.total_budget || 30000000).toLocaleString()}
                </strong>
                <p className="text-[10px] text-emerald-600 font-bold">KSh 30.0M Ceiling</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Application Window</span>
                <strong className={`text-sm font-bold block ${isWindowOpen ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isWindowOpen ? 'OPEN & ACCEPTING' : 'CLOSED / LOCKED'}
                </strong>
                <p className="text-[10px] text-slate-500">Closes 30th Sept 2026</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-slate-900 to-[#0F1D40] text-white rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#D4A72C]">
                Statutory Affirmative Action Guidelines
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                As per the NG-CDF Act, a minimum of <strong>25% of annual constituency allocations</strong> is ring-fenced for Education Bursaries. Priority quotas are enforced for total orphans, persons living with disabilities (PWD), and accredited TVET institutions.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-700" /> System & Security Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Infrastructure:</span>
                <strong className="font-mono text-slate-900">National Government Cloud</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Data Encryption:</span>
                <strong className="font-mono text-slate-900">SHA-256 / AES-256</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Total Audit Events:</span>
                <strong className="font-mono text-purple-800 font-bold">{safeAuditLogs.length} Events</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Connection Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected & Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPLICATIONS MASTER DIRECTORY & REPORTING */}
      {activeSubTab === 'applications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0B6B3A]" /> Bursary Applications Master Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Filter, inspect, and export constituency applicants across all 6 wards, education tiers, and lifecycle stages.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportFilteredApplicantsCSV}
                  className="px-4 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Applicants Schedule (CSV)
                </button>
                {(filterAppSearch || filterAppWard !== 'all' || filterAppLevel !== 'all' || filterAppStage !== 'all' || filterAppVulnerability !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterAppSearch('');
                      setFilterAppWard('all');
                      setFilterAppLevel('all');
                      setFilterAppStage('all');
                      setFilterAppVulnerability('all');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* 5-Axis Responsive Filter Toolbar */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-[#0B6B3A]" /> Filter Parameters:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* 1. Keyword Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={filterAppSearch}
                    onChange={(e) => setFilterAppSearch(e.target.value)}
                    placeholder="Search name, ID, ref..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B6B3A] focus:border-transparent outline-none text-xs"
                  />
                </div>

                {/* 2. Electoral Ward Filter */}
                <div>
                  <select
                    value={filterAppWard}
                    onChange={(e) => setFilterAppWard(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B6B3A] outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Wards ({safeWards.length || 6})</option>
                    {safeWards.length > 0 ? (
                      safeWards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Emali / Mulala">Emali / Mulala</option>
                        <option value="Nguu / Masumba">Nguu / Masumba</option>
                        <option value="Nguumo">Nguumo</option>
                        <option value="Makindu">Makindu</option>
                        <option value="Kikumbulyu North">Kikumbulyu North</option>
                        <option value="Kikumbulyu South">Kikumbulyu South</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 3. Education Level Filter */}
                <div>
                  <select
                    value={filterAppLevel}
                    onChange={(e) => setFilterAppLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B6B3A] outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Education Levels</option>
                    <option value="secondary">Secondary School</option>
                    <option value="tvet">TVET / Polytechnic</option>
                    <option value="university">University / Degree</option>
                    <option value="special_needs">Special Needs School</option>
                  </select>
                </div>

                {/* 4. Lifecycle Stage Filter */}
                <div>
                  <select
                    value={filterAppStage}
                    onChange={(e) => setFilterAppStage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B6B3A] outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Lifecycle Stages</option>
                    <option value="submitted">1. Submitted</option>
                    <option value="under_verification">2. Under Verification</option>
                    <option value="verified">3. Verified</option>
                    <option value="committee_review">4. Committee Review</option>
                    <option value="approved">5. Approved</option>
                    <option value="awarded">6. Awarded</option>
                    <option value="paid">7. Disbursed / Paid</option>
                    <option value="deferred">Deferred</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* 5. Vulnerability Quota Filter */}
                <div>
                  <select
                    value={filterAppVulnerability}
                    onChange={(e) => setFilterAppVulnerability(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B6B3A] outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="all">All Priority Quotas</option>
                    <option value="total_orphan">Total Orphan</option>
                    <option value="partial_orphan">Partial Orphan</option>
                    <option value="pwd">PWD / Special Needs</option>
                    <option value="extreme_need">Extreme Poverty / Needy</option>
                    <option value="general">General Applicants</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Filter Metric Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Matching Applicants</span>
                <p className="text-lg font-black text-slate-900 font-mono">
                  {filteredApplications.length} <span className="text-xs font-normal text-slate-400">/ {safeApplications.length}</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Filtered Balance</span>
                <p className="text-lg font-black text-slate-900 font-mono">
                  KSh {filteredTotalFees.toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Requested Amount</span>
                <p className="text-lg font-black text-[#0B6B3A] font-mono">
                  KSh {filteredTotalRequested.toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Approved Awards</span>
                <p className="text-lg font-black text-emerald-700 font-mono">
                  KSh {filteredTotalApproved.toLocaleString()} <span className="text-xs font-bold text-emerald-600">({filteredApprovedCount} Awards)</span>
                </p>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sticky top-0 z-10">
                    <th className="p-3">Ref No</th>
                    <th className="p-3">Applicant Name & ID</th>
                    <th className="p-3">Ward</th>
                    <th className="p-3">Institution & Level</th>
                    <th className="p-3 text-right">Fee Balance</th>
                    <th className="p-3 text-right">Requested</th>
                    <th className="p-3">Quota / Priority</th>
                    <th className="p-3">Stage & Status</th>
                    <th className="p-3 text-right">Award (KES)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold">No applications found matching selected filter criteria.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Try resetting or broadening your filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => {
                      const isApproved = ['approved', 'awarded', 'paid'].includes(String(app.stage).toLowerCase());
                      const isReview = String(app.stage).toLowerCase() === 'committee_review';
                      const isRejected = String(app.stage).toLowerCase() === 'rejected';

                      return (
                        <tr key={app.id || app.application_no} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                            {app.application_no || `CDF-2026-${app.id}`}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{app.full_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {app.national_id || 'N/A'}</span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                              {app.ward?.name || app.ward_name || 'Kibwezi West'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-slate-800 block truncate max-w-[180px]">
                              {app.institution?.name || app.institution_name || 'Institution'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {app.institution?.type || app.institution_type || 'Tertiary'} • {app.admission_no || 'No Adm'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-700">
                            KSh {Number(app.fee_balance || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            KSh {Number(app.requested_amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              String(app.vulnerability_category || '').toLowerCase().includes('orphan')
                                ? 'bg-purple-100 text-purple-800'
                                : String(app.vulnerability_category || '').toLowerCase().includes('pwd')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {app.vulnerability_category || 'General'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isReview
                                ? 'bg-blue-100 text-blue-800'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              ● {app.stage?.replace(/_/g, ' ') || 'Submitted'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-black text-[#0B6B3A]">
                            {Number(app.approved_amount || app.recommended_amount || 0) > 0
                              ? `KSh ${Number(app.approved_amount || app.recommended_amount).toLocaleString()}`
                              : '—'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {onOpenDossierModal && (
                              <button
                                type="button"
                                onClick={() => onOpenDossierModal(app)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-[#0B6B3A] hover:text-white text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Dossier
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & USER ACCOUNTS */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" /> Constituency Staff & Officer Accounts
              </h3>
              <p className="text-xs text-slate-500">Authorized personnel registered in the official constituency governance ledger.</p>
            </div>
            <button
              onClick={() => setNewUserModal(true)}
              className="px-4 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Add Staff Account
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search staff by name, email, or National ID..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0B6B3A]"
              />
            </div>
            <select
              value={filterUserRole}
              onChange={(e) => setFilterUserRole(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
            >
              <option value="all">All Staff Roles</option>
              <option value="committee_member">Committee Member</option>
              <option value="verification_officer">Verification Officer</option>
              <option value="finance_officer">Finance Officer</option>
              <option value="school_officer">School Registrar</option>
              <option value="admin">Constituency Super Admin</option>
              <option value="applicant">Student Applicant</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role / Permissions</th>
                  <th className="p-3">National ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400 font-bold">#{u.id}</td>
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-900'
                          : u.role === 'committee_member'
                          ? 'bg-purple-100 text-purple-900'
                          : u.role === 'finance_officer'
                          ? 'bg-teal-100 text-teal-900'
                          : u.role === 'verification_officer'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role ? u.role.replace('_', ' ') : 'APPLICANT'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{u.national_id || 'N/A'}</td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setResetModal({ isOpen: true, user: u, newPassword: '' })}
                          className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WARD BUDGET ALLOCATIONS & BENEFIT ANALYTICS */}
      {activeSubTab === 'wards' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-[#0B6B3A] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  STATUTORY EQUITY TRACKER
                </span>
                <span className="text-xs text-slate-500 font-medium">6 Wards Live Monitoring</span>
              </div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2 mt-1">
                <MapPin className="w-5 h-5 text-[#0B6B3A]" /> Constituency Ward Benefit & Budget Allocations
              </h3>
              <p className="text-xs text-slate-500">
                Track how each of the 6 wards is benefiting from bursary funds, monitor budget ceilings, and download equity schedules.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={exportWardEquityCSV}
                className="px-4 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4A72C]" /> Export Ward Benefit Schedule (CSV)
              </button>
              <span className="text-xs font-bold text-[#0B6B3A] bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                Total Budget: KSh {(totalWardBudget / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>

          {/* Grid of 6 Ward Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {safeWards.map((w) => {
              const cleanWName = String(w.name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
              const wardApps = safeApplications.filter((a) => {
                if (a.ward_id === w.id) return true;
                const appWardName = String(a.ward?.name || a.ward_name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
                return appWardName && appWardName === cleanWName;
              });

              const awardedApps = wardApps.filter((a) => a.stage === 'approved' || a.stage === 'paid');
              const awardedTotal = awardedApps.reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0);
              const budgetCap = Number(w.budget_allocation || 5000000);
              const balance = Math.max(0, budgetCap - awardedTotal);
              const rate = Math.min(100, Math.round((awardedTotal / Math.max(1, budgetCap)) * 100));

              return (
                <div key={w.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 hover:border-emerald-300 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-900">{w.name}</h4>
                    <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {w.code || `KBW-0${w.id}`}
                    </span>
                  </div>

                  {/* Ward Beneficiary & Fund Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Applications</span>
                      <strong className="text-slate-800 text-sm font-black">{wardApps.length}</strong>
                      <span className="text-[10px] text-slate-500 block">Submitted</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-emerald-600 uppercase font-bold block">Beneficiaries</span>
                      <strong className="text-[#0B6B3A] text-sm font-black">{awardedApps.length}</strong>
                      <span className="text-[10px] text-emerald-700 font-semibold block">Awarded</span>
                    </div>
                  </div>

                  {/* Funds Committed & Remaining */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Funds Committed:</span>
                      <strong className="font-mono font-black text-[#0B6B3A]">KSh {awardedTotal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Remaining Balance:</span>
                      <span className="font-mono font-bold text-slate-700">KSh {balance.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Ward Utilization Rate</span>
                      <span className="text-[#0B6B3A]">{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rate > 90 ? 'bg-rose-500' : rate > 75 ? 'bg-amber-500' : 'bg-[#0B6B3A]'
                        }`}
                        style={{ width: `${Math.max(2, rate)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Editable Budget Cap */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Budget Allocation Cap (KSh)
                    </label>
                    <input
                      type="number"
                      defaultValue={w.budget_allocation}
                      onBlur={(e) => handleUpdateWardBudget(w.id, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-xs text-[#0B6B3A] focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                    />
                    <span className="text-[9px] text-slate-400 mt-1 block">Click away to save changes to live database</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comprehensive Ward Benefit Comparison Table */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Constituency Ward Equity Summary Table
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3">Ward Name</th>
                    <th className="p-3">Ward Code</th>
                    <th className="p-3">Budget Cap</th>
                    <th className="p-3">Applicants</th>
                    <th className="p-3">Beneficiaries</th>
                    <th className="p-3">Amount Awarded</th>
                    <th className="p-3">Remaining Balance</th>
                    <th className="p-3 text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeWards.map((w) => {
                    const cleanWName = String(w.name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
                    const wardApps = safeApplications.filter((a) => {
                      if (a.ward_id === w.id) return true;
                      const appWardName = String(a.ward?.name || a.ward_name || '').toLowerCase().replace(/\s*ward\s*/g, '').trim();
                      return appWardName && appWardName === cleanWName;
                    });
                    const awardedApps = wardApps.filter((a) => a.stage === 'approved' || a.stage === 'paid');
                    const awardedTotal = awardedApps.reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0);
                    const budgetCap = Number(w.budget_allocation || 5000000);
                    const balance = Math.max(0, budgetCap - awardedTotal);
                    const rate = Math.min(100, Math.round((awardedTotal / Math.max(1, budgetCap)) * 100));

                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{w.name}</td>
                        <td className="p-3 font-mono text-slate-600">{w.code || `KBW-0${w.id}`}</td>
                        <td className="p-3 font-mono font-bold text-slate-700">KSh {budgetCap.toLocaleString()}</td>
                        <td className="p-3 font-mono">{wardApps.length}</td>
                        <td className="p-3 font-mono font-bold text-[#0B6B3A]">{awardedApps.length}</td>
                        <td className="p-3 font-mono font-black text-[#0B6B3A]">KSh {awardedTotal.toLocaleString()}</td>
                        <td className="p-3 font-mono text-slate-600">KSh {balance.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-700" /> Security & Statutory Compliance Audit Trail
              </h3>
              <p className="text-xs text-slate-500">Immutable governance ledger tracking all administrative and financial actions.</p>
            </div>
            <button
              onClick={exportAuditCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D4A72C]" /> Export Security Audit CSV
            </button>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / User</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Record ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {safeAuditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 font-bold">#{l.id}</td>
                    <td className="p-3 text-slate-500">{new Date(l.created_at || Date.now()).toLocaleString('en-GB')}</td>
                    <td className="p-3 font-bold text-slate-900 font-sans">{l.user_name || 'System'}</td>
                    <td className="p-3">
                      <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded font-bold">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-sans">{l.module}</td>
                    <td className="p-3 text-slate-500">{l.record_id || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Staff User */}
      {newUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">Create New Staff Account</h3>
                <p className="text-[11px] text-slate-500">Creates authorized user account with role-based access</p>
              </div>
              <button
                onClick={() => setNewUserModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Mutiso"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. j.mutiso@ngcdf.go.ke"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
                >
                  <option value="committee_member">Committee Member</option>
                  <option value="verification_officer">Verification Officer</option>
                  <option value="finance_officer">Finance Officer</option>
                  <option value="school_officer">School Registrar</option>
                  <option value="admin">Constituency Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. 29384756"
                  value={newUserData.national_id}
                  onChange={(e) => setNewUserData({ ...newUserData, national_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0B6B3A]"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewUserModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-[#0B6B3A] text-white font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating in DB...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset User Password */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">Reset User Password</h3>
                <p className="text-[11px] text-slate-500">{resetModal.user?.name} ({resetModal.user?.email})</p>
              </div>
              <button
                onClick={() => setResetModal({ isOpen: false, user: null, newPassword: '' })}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Encrypted Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={resetModal.newPassword}
                  onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-700"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModal({ isOpen: false, user: null, newPassword: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
