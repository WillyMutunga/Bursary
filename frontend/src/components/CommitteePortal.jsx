import React, { useState, useEffect } from 'react';
import {
  Users, Award, CheckCircle, XCircle, Clock, RotateCcw,
  Sparkles, Shield, AlertCircle, FileText, ChevronRight,
  TrendingUp, CheckSquare, Search, Filter, HelpCircle, CheckCircle2, DollarSign,
  Send, RefreshCw, MapPin, Building2, UserCheck, Eye, Download
} from 'lucide-react';
import { api } from '../api/client';
import DocumentViewerModal from './DocumentViewerModal';

export default function CommitteePortal({
  applications: parentApplications = [],
  onRecordDecision: parentOnRecordDecision,
  wards = [],
  onOpenDossierModal,
  onOpenInstitutionalLetterModal,
}) {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total_applications: 0,
    pending_review: 0,
    verified_applications: 0,
    recommended_applications: 0,
    approved_applications: 0,
    allocated_funds_kes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Decision state for custom amount entry
  const [decisionAmount, setDecisionAmount] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [previewDoc, setPreviewDoc] = useState({ isOpen: false, doc: null, studentName: '' });

  const [filterStage, setFilterStage] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterVulnerability, setFilterVulnerability] = useState('all');

  // Fetch real data from PostgreSQL on mount
  const loadCommitteeData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCommitteeApplications();
      if (res && res.success) {
        setApplications(res.data || []);
        if (res.statistics) {
          setStats(res.statistics);
        }
        if (res.data?.length > 0) {
          // Keep current selected app or select first
          setSelectedApp((prev) => {
            if (!prev) return res.data[0];
            return res.data.find((a) => a.id === prev.id) || res.data[0];
          });
        } else {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.warn('Live committee fetch error', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommitteeData();
  }, []);

  // Update decision amount when selected app changes
  useEffect(() => {
    if (selectedApp) {
      if (selectedApp.approved_amount && Number(selectedApp.approved_amount) > 0) {
        setDecisionAmount(selectedApp.approved_amount);
      } else if (selectedApp.fee_balance) {
        setDecisionAmount(Math.min(25000, selectedApp.fee_balance));
      } else {
        setDecisionAmount(15000);
      }
      setDecisionNotes(selectedApp.decision_reason || '');
    }
  }, [selectedApp]);

  const handleCommitDecision = async (decisionType) => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const amountNum = Number(decisionAmount) || 0;
    if (decisionType === 'APPROVE' && amountNum <= 0) {
      alert('Please enter a valid award amount greater than 0.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      decision: decisionType,
      approved_amount: amountNum,
      recommended_amount: amountNum,
      notes: decisionNotes || (decisionType === 'APPROVE' ? `Awarded KSh ${amountNum.toLocaleString()} by Bursary Committee.` : `Status updated to ${decisionType}`),
      modification_reason: decisionNotes,
    };

    try {
      const res = await api.recordCommitteeDecision(selectedApp.id, payload);
      if (res && res.success) {
        setFeedbackMessage({
          type: 'success',
          text: `✓ Decision committed: Application ${selectedApp.application_no} updated to ${decisionType} (KSh ${amountNum.toLocaleString()}).`,
        });
        if (res.application) {
          setSelectedApp(res.application);
          setApplications((prev) => prev.map((a) => (a.id === selectedApp.id ? res.application : a)));
        }
        if (parentOnRecordDecision) {
          parentOnRecordDecision(selectedApp.id, payload);
        }
        await loadCommitteeData();
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res?.message || 'Failed to save decision to database.',
        });
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Error saving committee decision to database.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportNationalBoardSchedule = () => {
    const headers = 'Application No,Applicant Name,National ID,Phone,Ward,Institution,Institution Level,Admission No,Course / Grade,Fee Balance (KES),Requested (KES),Vulnerability,Approved Amount (KES),Stage,Date\n';
    const rows = filteredApps
      .map((a) => {
        const appNo = `"${a.application_no || 'N/A'}"`;
        const name = `"${String(a.full_name || '').replace(/"/g, '""')}"`;
        const idNo = `"${a.national_id || 'N/A'}"`;
        const phone = `"${a.phone || a.user?.phone || 'N/A'}"`;
        const ward = `"${a.ward?.name || a.ward_name || 'N/A'}"`;
        const inst = `"${String(a.institution?.name || a.institution_name || 'N/A').replace(/"/g, '""')}"`;
        const level = `"${a.institution?.type || a.institution_type || 'N/A'}"`;
        const adm = `"${a.admission_no || 'N/A'}"`;
        const course = `"${String(a.course_name || a.grade_level || 'N/A').replace(/"/g, '""')}"`;
        const balance = Number(a.fee_balance || 0);
        const requested = Number(a.requested_amount || 0);
        const vuln = `"${a.vulnerability_category || 'General'}"`;
        const approved = Number(a.approved_amount || a.recommended_amount || 0);
        const stage = `"${a.stage || 'N/A'}"`;
        const date = `"${a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}"`;
        return `${appNo},${name},${idNo},${phone},${ward},${inst},${level},${adm},${course},${balance},${requested},${vuln},${approved},${stage},${date}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NGCDF-National-Board-Beneficiary-Schedule-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filteredApps = applications.filter((a) => {
    if (!a) return false;
    const query = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !query ||
      (a.full_name || '').toLowerCase().includes(query) ||
      (a.application_no || '').toLowerCase().includes(query) ||
      String(a.national_id || '').includes(query) ||
      (a.admission_no || '').toLowerCase().includes(query) ||
      String(a.institution?.name || '').toLowerCase().includes(query);

    const matchesStage = filterStage === 'all' || a.stage === filterStage;
    const appWardId = String(a.ward_id || a.ward?.id || '');
    const appWardName = String(a.ward?.name || a.ward_name || '').toLowerCase();
    const cleanAppWard = appWardName.replace(/\s+/g, '').replace(/ward/gi, '');
    const cleanFilterWard = String(filterWard).toLowerCase().replace(/\s+/g, '').replace(/ward/gi, '');

    const matchesWard = filterWard === 'all' ||
      appWardId === String(filterWard) ||
      cleanAppWard === cleanFilterWard ||
      cleanAppWard.includes(cleanFilterWard) ||
      cleanFilterWard.includes(cleanAppWard);

    const instType = String(a.institution_type || a.institution?.type || '').toLowerCase();
    const matchesLevel = filterLevel === 'all' ||
      instType === filterLevel.toLowerCase() ||
      (filterLevel === 'secondary' && (instType.includes('second') || instType.includes('high'))) ||
      (filterLevel === 'tvet' && (instType.includes('tvet') || instType.includes('poly') || instType.includes('college'))) ||
      (filterLevel === 'university' && (instType.includes('univ') || instType.includes('tertiary'))) ||
      (filterLevel === 'special_needs' && (instType.includes('special') || String(a.vulnerability_category).toLowerCase().includes('pwd')));

    const vuln = String(a.vulnerability_category || '').toLowerCase();
    const matchesVuln = filterVulnerability === 'all' ||
      (filterVulnerability === 'total_orphan' && vuln.includes('total')) ||
      (filterVulnerability === 'partial_orphan' && vuln.includes('partial')) ||
      (filterVulnerability === 'pwd' && (vuln.includes('pwd') || vuln.includes('disab') || a.is_pwd)) ||
      (filterVulnerability === 'extreme_need' && (vuln.includes('extreme') || vuln.includes('needy') || vuln.includes('poor'))) ||
      (filterVulnerability === 'general' && (vuln.includes('general') || !vuln));

    return matchesSearch && matchesStage && matchesWard && matchesLevel && matchesVuln;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              COMMITTEE REVIEW SUITE
            </span>
            <span className="text-xs text-slate-500 font-medium">Live System Sync</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Constituency Bursary Committee</h2>
          <p className="text-xs text-slate-500">
            Review applicant scores, examine verified documents, and enter custom accountable award amounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportNationalBoardSchedule}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export National Board Schedule (CSV)
          </button>
          <button
            type="button"
            onClick={loadCommitteeData}
            disabled={isLoading}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Live Data
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#0B6B3A]" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* 1. Live Committee Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Received</span>
          <p className="text-2xl font-black text-slate-900">{stats.total_applications}</p>
          <span className="text-[10px] text-slate-500">In Active Intake</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
          <p className="text-2xl font-black text-amber-600">{stats.pending_review}</p>
          <span className="text-[10px] text-slate-500">Awaiting Committee</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended</span>
          <p className="text-2xl font-black text-purple-700">{stats.recommended_applications}</p>
          <span className="text-[10px] text-slate-500">Score &ge; 60/100</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Awards</span>
          <p className="text-2xl font-black text-[#0B6B3A]">{stats.approved_applications}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Award Letters Generated</span>
        </div>

        <div className="bg-[#0F172A] text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider">Total Allocated</span>
          <p className="text-2xl font-black text-[#D4A72C]">
            KSh {Number(stats.allocated_funds_kes || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Committed Funds</span>
        </div>
      </div>

      {/* 2. Main Work Area: Queue + Detailed Review & Custom Award Entry */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border-2 border-purple-200">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#0F172A]">No Applications in Database Queue</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All dummy test records have been purged. As applicants register and submit their bursary forms, they will appear here live for committee deliberation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Applications List (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name, ID, application no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="under_verification">Under Verification</option>
                  <option value="committee_review">Committee Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="deferred">Deferred</option>
                </select>

                <select
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="all">All Wards</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="secondary">Secondary</option>
                  <option value="tvet">TVET / Poly</option>
                  <option value="university">University</option>
                  <option value="special_needs">Special Needs</option>
                </select>

                <select
                  value={filterVulnerability}
                  onChange={(e) => setFilterVulnerability(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value="all">All Quotas</option>
                  <option value="total_orphan">Total Orphan</option>
                  <option value="partial_orphan">Partial Orphan</option>
                  <option value="pwd">PWD / Special</option>
                  <option value="extreme_need">Extreme Need</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* List of Applications */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const isAppApproved = app.stage === 'approved' || app.stage === 'awarded' || app.stage === 'paid';
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-600 shadow-md ring-2 ring-purple-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{app.full_name}</h4>
                        <p className="text-[11px] font-mono text-slate-500">{app.application_no}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                        isAppApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : app.stage === 'committee_review'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {app.stage ? app.stage.replace('_', ' ') : 'SUBMITTED'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 truncate max-w-[200px]">
                        {app.institution?.name || 'Institution'}
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        {isAppApproved ? (
                          <span className="text-[#0B6B3A]">Awarded: KSh {Number(app.approved_amount || 0).toLocaleString()}</span>
                        ) : (
                          <span>Bal: KSh {Number(app.fee_balance || 0).toLocaleString()}</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Review & Flexible Award Entry (7 Cols) */}
          {selectedApp ? (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              {/* Applicant Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                      DELIBERATION PANEL
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">{selectedApp.application_no}</span>
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A] mt-1">{selectedApp.full_name}</h3>
                  <p className="text-xs text-slate-500">National ID: <strong>{selectedApp.national_id}</strong> • Ward: <strong>{selectedApp.ward?.name || 'Kibwezi West'}</strong></p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Assessment Score</span>
                    <span className="text-xl font-black text-purple-800">{selectedApp.total_score || 75} / 100</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDossierModal && onOpenDossierModal(selectedApp)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-slate-300 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0B6B3A]" /> Print HELB Dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetInstName = selectedApp.institution?.name || selectedApp.institution_name;
                        const targetInstId = selectedApp.institution_id || selectedApp.institution?.id;
                        const instBeneficiaries = (applications || []).filter((a) => {
                          if (targetInstId && (a.institution_id === targetInstId || a.institution?.id === targetInstId)) return true;
                          if (targetInstName && (a.institution?.name === targetInstName || a.institution_name === targetInstName)) return true;
                          return false;
                        });
                        if (onOpenInstitutionalLetterModal) {
                          onOpenInstitutionalLetterModal(
                            selectedApp.institution || { name: targetInstName },
                            instBeneficiaries.length > 0 ? instBeneficiaries : [selectedApp]
                          );
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-purple-200 transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-purple-700" /> Institutional Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Applicant Academic & Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Institution:</span>
                  <strong className="text-slate-800">{selectedApp.institution?.name || 'University / College'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Admission No:</span>
                  <strong className="font-mono text-slate-800">{selectedApp.admission_no}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Course:</span>
                  <strong className="text-slate-800">{selectedApp.course_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Fees Payable:</span>
                  <strong className="text-slate-800">KSh {Number(selectedApp.fees_payable || 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Fees Paid:</span>
                  <strong className="text-emerald-700">KSh {Number(selectedApp.fees_paid || 0).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Fee Balance:</span>
                  <strong className="text-rose-600 font-black">KSh {Number(selectedApp.fee_balance || 0).toLocaleString()}</strong>
                </div>
              </div>

              {/* Uploaded Verification Document Attachments */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  VERIFIED ATTACHMENTS (CLICK TO PREVIEW)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({
                      isOpen: true,
                      studentName: selectedApp.full_name,
                      doc: { title: 'Official Fee Structure / Statement (2026/2027)', type: 'FEE_STRUCTURE', uploadDate: '22/08/2026' }
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl border border-emerald-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#0B6B3A]" /> Preview Fee Statement
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc({
                      isOpen: true,
                      studentName: selectedApp.full_name,
                      doc: { title: 'National Identity Card (IPRS Verified)', type: 'NATIONAL_ID', uploadDate: '22/08/2026' }
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 font-bold rounded-xl border border-blue-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-700" /> Preview National ID
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc({
                      isOpen: true,
                      studentName: selectedApp.full_name,
                      doc: { title: "Location Chief's Recommendation Letter", type: 'CHIEFS_LETTER', uploadDate: '22/08/2026' }
                    })}
                    className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" /> Preview Chief's Letter
                  </button>
                </div>
              </div>

              {/* CUSTOM AWARD ENTRY SECTION */}
              <div className="bg-purple-50/70 p-6 rounded-3xl border-2 border-purple-200 space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                    SET COMMITTEE AWARD AMOUNT
                  </span>
                  <h4 className="text-base font-black text-[#0F172A] mt-2">
                    Enter Amount to Award (KSh)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Type the exact custom amount approved by the committee. It will immediately reflect in the database and the applicant's award letter.
                  </p>
                </div>

                {/* Editable Amount Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-base font-black text-slate-500">KSh</span>
                    <input
                      type="number"
                      placeholder="e.g. 18500"
                      value={decisionAmount}
                      onChange={(e) => setDecisionAmount(e.target.value)}
                      className="w-full pl-14 pr-4 py-3 bg-white border-2 border-purple-300 rounded-2xl text-xl font-black text-purple-950 font-mono outline-none focus:border-purple-700 focus:ring-4 focus:ring-purple-700/10 transition-all"
                    />
                  </div>

                  {/* Preset Helper Pills */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="text-slate-500 py-1">Quick Select:</span>
                    <button
                      type="button"
                      onClick={() => setDecisionAmount(10000)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-900 transition-colors"
                    >
                      KSh 10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionAmount(15000)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-900 transition-colors"
                    >
                      KSh 15,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionAmount(20000)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-900 transition-colors"
                    >
                      KSh 20,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionAmount(25000)}
                      className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-900 transition-colors"
                    >
                      KSh 25,000
                    </button>
                    {selectedApp.fee_balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setDecisionAmount(selectedApp.fee_balance)}
                        className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 rounded-lg border border-rose-300 text-rose-900 transition-colors"
                      >
                        Full Balance (KSh {Number(selectedApp.fee_balance).toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>

                {/* Deliberation Notes / Minutes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deliberation Minutes / Official Reason
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Enter deliberation notes or approval remarks..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-700"
                  ></textarea>
                </div>

                {/* Inline Decision Feedback Banner */}
                {feedbackMessage && (
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-sm animate-fade-in ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0B6B3A] shrink-0" />
                      <span>{feedbackMessage.text}</span>
                    </div>
                    <button type="button" onClick={() => setFeedbackMessage(null)} className="underline ml-2 text-[11px] cursor-pointer">
                      Dismiss ✕
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCommitDecision('APPROVE')}
                    className="py-3 px-3 bg-[#0B6B3A] hover:bg-[#084e2a] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{isSubmitting ? 'Saving...' : 'Approve Award'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCommitDecision('DEFER')}
                    className="py-3 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Defer</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCommitDecision('REJECT')}
                    className="py-3 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCommitDecision('RETURN_FOR_VERIFICATION')}
                    className="py-3 px-3 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Return to Officer</span>
                  </button>
                </div>
              </div>

            </div>
          ) : null}

        </div>
      )}

      {/* Document Previewer Modal */}
      <DocumentViewerModal
        isOpen={previewDoc.isOpen}
        onClose={() => setPreviewDoc({ ...previewDoc, isOpen: false })}
        document={previewDoc.doc}
        studentName={previewDoc.studentName}
      />
    </div>
  );
}
