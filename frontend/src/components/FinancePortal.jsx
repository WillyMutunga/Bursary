import React, { useState, useEffect } from 'react';
import {
  DollarSign, Download, CheckCircle, Clock, AlertCircle,
  FileText, Building2, Send, CheckSquare, Search, Filter, Sparkles, CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export default function FinancePortal({
  applications: parentApplications = [],
  onCreatePaymentBatch,
  onOpenInstitutionalLetterModal,
}) {
  const [financeData, setFinanceData] = useState(null);
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('EFT');
  const [bankReference, setBankReference] = useState('CBK-EFT-2026-AUG-094');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const loadFinance = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFinanceDashboard();
      if (res && res.success) {
        setFinanceData(res);
      }
    } catch (e) {
      console.warn('Finance sync error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const readyApps = financeData?.ready_for_payment || [];
  const batches = financeData?.batches || [];
  const budget = financeData?.budget || {
    total_budget: 30000000,
    approved: 0,
    paid: 0,
    pending: 0,
    balance: 30000000,
    utilization_rate_pct: 0,
  };

  const handleToggleSelect = (id) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAppIds.length === readyApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(readyApps.map((a) => a.id));
    }
  };

  const handleExecuteBatch = async (e) => {
    e.preventDefault();
    if (selectedAppIds.length === 0) return;

    const selectedList = readyApps.filter(a => selectedAppIds.includes(a.id));
    const totalAmount = selectedList.reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0);

    const batchData = {
      application_ids: selectedAppIds,
      payment_method: paymentMethod,
      bank_reference: bankReference,
      total_amount: totalAmount,
    };

    try {
      const res = await api.createPaymentBatch(batchData);
      if (res && res.success) {
        setFeedback({
          type: 'success',
          text: `Payment batch ${res.batch?.batch_no || 'BATCH'} generated and disbursed (KSh ${totalAmount.toLocaleString()})!`,
        });
        if (onCreatePaymentBatch) onCreatePaymentBatch(batchData);
        setSelectedAppIds([]);
        await loadFinance();
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'Failed to process payment batch.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              FINANCE & DISBURSEMENTS
            </span>
            <span className="text-xs text-slate-500 font-medium">Live System Sync</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Financial Management & Bank Disbursements</h2>
          <p className="text-xs text-slate-500">
            Track constituency budget utilization, generate automated bank EFT disbursement files, and reconcile school accounts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenInstitutionalLetterModal && onOpenInstitutionalLetterModal()}
            className="px-4 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Institutional Transmittal Schedule
          </button>
          <button
            onClick={loadFinance}
            disabled={isLoading}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Finance Data
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#0B6B3A]" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* 1. Live Budget Metrics from PostgreSQL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</span>
          <p className="text-2xl font-black text-[#0F172A]">KSh {((Number(budget.total_budget || 30000000)) / 1000000).toFixed(1)}M</p>
          <span className="text-[10px] text-slate-500">FY 2026/2027 Allocation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</span>
          <p className="text-2xl font-black text-purple-700">KSh {Number(budget.approved || 0).toLocaleString()}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Committee Approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid / Disbursed</span>
          <p className="text-2xl font-black text-[#0B6B3A]">KSh {Number(budget.paid || 0).toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Disbursed to Schools</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Batch</span>
          <p className="text-2xl font-black text-amber-600">KSh {Number(budget.pending || 0).toLocaleString()}</p>
          <span className="text-[10px] text-amber-600">In Payment Queue</span>
        </div>

        <div className="bg-[#0F172A] text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider">Balance Remaining</span>
          <p className="text-2xl font-black text-[#D4A72C]">
            KSh {((Number(budget.balance || 30000000)) / 1000000).toFixed(1)}M
          </p>
          <span className="text-[10px] text-slate-400">Available Cap</span>
        </div>
      </div>

      {/* 2. Ready For Disbursement Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" /> Applications Approved & Ready for Payment
            </h3>
            <p className="text-xs text-slate-500">
              Select approved student bursary allocations to generate bank EFT manifests and direct school payments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              {readyApps.length} Ready for Payment
            </span>
          </div>
        </div>

        {readyApps.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <CheckCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Approved Applications Awaiting Payment</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When the Committee approves applications, they will immediately appear here for batch EFT payment processing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedAppIds.length === readyApps.length && readyApps.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </th>
                    <th className="p-3">Application No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Institution</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Approved Award</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readyApps.map((app) => {
                    const isChecked = selectedAppIds.includes(app.id);
                    return (
                      <tr key={app.id} className={`hover:bg-slate-50 ${isChecked ? 'bg-teal-50/50' : ''}`}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(app.id)}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">{app.application_no}</td>
                        <td className="p-3 font-bold text-slate-900">{app.full_name}</td>
                        <td className="p-3 text-slate-600">{app.institution?.name || 'Institution'}</td>
                        <td className="p-3 font-mono text-slate-700">{app.admission_no}</td>
                        <td className="p-3 font-mono font-black text-[#0B6B3A]">
                          KSh {Number(app.approved_amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Execute Batch Action Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-slate-700">
                Selected: <strong>{selectedAppIds.length}</strong> Students • Total: <strong className="text-[#0B6B3A]">
                  KSh {readyApps.filter(a => selectedAppIds.includes(a.id)).reduce((sum, a) => sum + (Number(a.approved_amount) || 0), 0).toLocaleString()}
                </strong>
              </span>

              <button
                onClick={handleExecuteBatch}
                disabled={selectedAppIds.length === 0}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Disburse Batch EFT Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
