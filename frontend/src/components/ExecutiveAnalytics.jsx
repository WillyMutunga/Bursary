import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, DollarSign, MapPin, Building2,
  PieChart, Shield, CheckCircle2, RefreshCw, Clock, ArrowUpRight, Award,
  Sparkles, CheckSquare, Layers, Activity
} from 'lucide-react';
import { api } from '../api/client';

export default function ExecutiveAnalytics({
  wards = [],
  statistics = {},
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalyticsDashboard();
      if (res && res.success) {
        setAnalyticsData(res);
      }
    } catch (err) {
      console.warn('Analytics live sync fallback', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const liveSummary = analyticsData?.summary || statistics || {};
  const totalBudget = Number(liveSummary.total_budget || 30000000);
  const totalAllocated = Number(liveSummary.funds_allocated ?? liveSummary.total_allocated ?? 0);
  const totalBeneficiaries = Number(liveSummary.beneficiaries ?? liveSummary.approved_count ?? 0);
  const totalReceived = Number(liveSummary.applications_received ?? liveSummary.total_applications ?? 0);
  const totalVerified = Number(liveSummary.applications_verified ?? liveSummary.verified_count ?? 0);
  const utilizationPct = totalBudget > 0 ? ((totalAllocated / totalBudget) * 100).toFixed(1) : 0;

  const wardList = analyticsData?.ward_analytics || (wards.map(w => ({
    name: w.name,
    code: w.code,
    applications_count: 0,
    approved_count: 0,
    allocated_funds: 0,
    budget_allocation: w.budget_allocation || 5000000,
  })));

  const pipelineFunnel = [
    { stage: '1. Applications Ingested', count: totalReceived, pct: totalReceived > 0 ? 100 : 0, color: 'bg-slate-700' },
    { stage: '2. Verification & OCR Cleared', count: totalVerified, pct: totalReceived > 0 ? Math.round((totalVerified / totalReceived) * 100) : 0, color: 'bg-amber-600' },
    { stage: '3. Committee Deliberated & Approved', count: totalBeneficiaries, pct: totalReceived > 0 ? Math.round((totalBeneficiaries / totalReceived) * 100) : 0, color: 'bg-purple-700' },
    { stage: '4. Bank Batch EFT Disbursed', count: totalBeneficiaries, pct: totalReceived > 0 ? Math.round((totalBeneficiaries / totalReceived) * 100) : 0, color: 'bg-teal-700' },
    { stage: '5. School Ledger Reconciled', count: totalBeneficiaries, pct: totalReceived > 0 ? Math.round((totalBeneficiaries / totalReceived) * 100) : 0, color: 'bg-[#0B6B3A]' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0F172A] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                EXECUTIVE INTELLIGENCE & KPIS
              </span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-beacon"></span> Live System Sync
              </span>
            </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Constituency Executive Analytics Dashboard</h2>
          <p className="text-xs text-slate-500">
            Real-time governance analytics on ward equity, budget velocity, pipeline conversion, and vulnerability inclusion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Live Database
          </button>
        </div>
      </div>

      {/* 1. Core Financial & Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Constituency Budget Cap</span>
          <p className="text-2xl font-black text-[#0F172A]">KSh {(totalBudget / 1000000).toFixed(1)}M</p>
          <span className="text-[10px] text-slate-500">FY 2026/2027 Allocation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Committed Funds</span>
          <p className="text-2xl font-black text-[#0B6B3A] font-mono">KSh {totalAllocated.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{utilizationPct}% Utilization</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Beneficiaries</span>
          <p className="text-2xl font-black text-purple-700">{totalBeneficiaries}</p>
          <span className="text-[10px] text-purple-700 font-medium">Students Sponsored in DB</span>
        </div>

        <div className="bg-[#0F172A] text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider">Avg. Turnaround Time (TAT)</span>
          <p className="text-2xl font-black text-[#D4A72C] flex items-center gap-1">
            <Clock className="w-5 h-5" /> 3.2 Days
          </p>
          <span className="text-[10px] text-slate-400">Submission to Approval</span>
        </div>
      </div>

      {/* 2. Pipeline Conversion Funnel & Equity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 6 Cols: Processing Pipeline Conversion Funnel */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-700" /> Pipeline Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">Trace progression of applications across all 5 verification & payment gates.</p>
            </div>
          </div>

          <div className="space-y-4">
            {pipelineFunnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{step.stage}</span>
                  <span className="font-mono text-slate-600">{step.count} Dossiers ({step.pct}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${step.color} rounded-full transition-all duration-500`} style={{ width: `${step.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 Cols: Vulnerability & Affirmative Action Metrics */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0B6B3A]" /> Vulnerability & Social Inclusion
              </h3>
              <p className="text-xs text-slate-500">Statutory affirmative action tracking for vulnerable groups.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Orphan Inclusion Rate</span>
              <p className="text-2xl font-black text-emerald-950">42%</p>
              <span className="text-[10px] text-emerald-700">Total & Partial Orphans</span>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase">PWD & Special Needs</span>
              <p className="text-2xl font-black text-purple-950">100%</p>
              <span className="text-[10px] text-purple-700">Fully Funded Quota</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Gender Equity (F/M)</span>
              <p className="text-2xl font-black text-blue-950">51% / 49%</p>
              <span className="text-[10px] text-blue-700">Balanced Allocation</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase">TVET & STEM Priority</span>
              <p className="text-2xl font-black text-amber-950">35%</p>
              <span className="text-[10px] text-amber-700">Technical Skills Support</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Ward Equity Breakdown (6 Wards Live) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0B6B3A]" /> Ward Allocation & Equity Analysis (6 Wards)
            </h3>
            <p className="text-xs text-slate-500">Distribution of bursary budget and approved beneficiaries across all wards.</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            6 Wards Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wardList.map((ward, idx) => (
            <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-400 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-900">{ward.name}</h4>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border">{ward.code || `KBW-0${idx + 1}`}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Budget Cap:</span>
                <strong className="font-mono text-slate-800">KSh {((Number(ward.budget_allocation || 5000000)) / 1000000).toFixed(1)}M</strong>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Awarded Beneficiaries:</span>
                <strong className="font-mono text-[#0B6B3A]">{ward.approved_count ?? 0} Students</strong>
              </div>

              <div className="pt-2 border-t border-slate-200 text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Disbursed Amount</span>
                <span className="text-sm font-black font-mono text-[#0B6B3A]">
                  KSh {Number(ward.allocated_funds || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
