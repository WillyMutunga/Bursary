import React, { useState } from 'react';
import {
  Shield, User, Users, DollarSign, School, BarChart3,
  Sliders, History, FileText, CheckSquare, Bell, Search,
  LogOut, ExternalLink, Menu, X, ChevronRight, Sparkles, UserCheck, QrCode, MapPin, CheckCircle2, Calendar
} from 'lucide-react';

export default function DashboardLayout({
  activeRole,
  currentUser,
  onLogout,
  onOpenAwardModal,
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const safeUser = currentUser || {
    name: 'John Kamau',
    role: activeRole,
    designation: 'Beneficiary (3rd Year UoN)',
  };

  const userInitials = (safeUser.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('');

  // Role-specific navigation items
  const rbacNavItems = {
    applicant: [
      { id: 'applicant_dashboard', label: 'My Dashboard', icon: UserCheck, active: true },
      { id: 'applicant_wizard', label: 'Online Application Wizard', icon: FileText },
      { id: 'applicant_docs', label: 'Uploaded Documents', icon: CheckSquare },
      { id: 'applicant_award', label: 'QR Award Certificate', icon: QrCode },
    ],
    verification: [
      { id: 'verification_queue', label: 'Verification Queue', icon: Shield, active: true },
      { id: 'verification_ocr', label: 'OCR Document Comparator', icon: FileText },
      { id: 'verification_duplicate', label: 'Duplicate Detection Radar', icon: CheckCircle2 },
      { id: 'verification_field', label: 'Field Verification Log', icon: MapPin },
    ],
    committee: [
      { id: 'committee_queue', label: 'Review & Scoring Queue', icon: Users, active: true },
      { id: 'committee_matrix', label: '100-Point Scoring Engine', icon: Sparkles },
      { id: 'committee_rationale', label: 'Decision Audit Log', icon: CheckSquare },
    ],
    finance: [
      { id: 'finance_budget', label: 'Budget Utilization (30M)', icon: DollarSign, active: true },
      { id: 'finance_batches', label: 'Batch EFT Disbursements', icon: FileText },
      { id: 'finance_reconcile', label: 'Bank Payment Records', icon: CheckCircle2 },
    ],
    school: [
      { id: 'school_students', label: 'Enrolled Candidates', icon: School, active: true },
      { id: 'school_confirm', label: 'Admission Verification', icon: CheckCircle2 },
      { id: 'school_ledger', label: 'Fee Balance Ledger', icon: DollarSign },
    ],
    analytics: [
      { id: 'analytics_kpis', label: 'Executive Analytics', icon: BarChart3, active: true },
      { id: 'analytics_wards', label: 'Ward Equity Allocations', icon: MapPin },
      { id: 'analytics_audit', label: 'Compliance Audit Logs', icon: History },
      { id: 'analytics_settings', label: 'Scoring Weights Config', icon: Sliders },
    ],
    audit: [
      { id: 'audit_logs', label: 'Immutable Audit Trail', icon: History, active: true },
      { id: 'audit_security', label: 'Security & Access Logs', icon: Shield },
    ],
    settings: [
      { id: 'settings_config', label: 'Scoring Engine Weights', icon: Sliders, active: true },
      { id: 'settings_cycles', label: 'Bursary Cycle Settings', icon: Calendar },
    ],
  };

  const navList = rbacNavItems[activeRole] || rbacNavItems.applicant;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row antialiased font-sans text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0F172A] text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B6B3A] text-white flex items-center justify-center border border-[#D4A72C]">
            <Shield className="w-5 h-5 text-[#D4A72C]" />
          </div>
          <span className="font-black text-sm uppercase tracking-tight">
            SMART <span className="text-[#0B6B3A]">NG-CDF</span>
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 1. Professional Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 border-r border-slate-800 shadow-xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B6B3A] to-[#084e2a] flex items-center justify-center text-white border border-[#D4A72C] shadow-md">
              <Shield className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight uppercase">
                SMART <span className="text-emerald-400">NG-CDF</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Bursary Management</p>
            </div>
          </div>

          {/* User Profile Snippet in Sidebar */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0B6B3A] text-white font-black text-xs flex items-center justify-center border border-[#D4A72C]">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{safeUser.name}</p>
              <p className="text-[10px] font-semibold text-[#D4A72C] truncate capitalize">
                {safeUser.designation || safeUser.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 block mb-2">
              AUTHORIZED WORKSPACE
            </span>
            <nav className="space-y-1 text-xs font-semibold">
              {navList.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === 0;
                return (
                  <div
                    key={item.id}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#0B6B3A] text-white font-bold shadow-md shadow-emerald-950/40 border border-[#D4A72C]/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4A72C]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#D4A72C]" />}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Action: Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold transition-all border border-rose-800/40"
          >
            <LogOut className="w-4 h-4" />
            Sign Out to Website
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">WORKSPACE:</span>
            <span className="bg-[#0B6B3A]/10 text-[#0B6B3A] font-black text-xs px-3 py-1 rounded-full uppercase border border-[#0B6B3A]/20">
              {activeRole.replace('_', ' ')} PORTAL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              2026/2027 Academic Cycle Active
            </div>

            <button
              onClick={onLogout}
              className="text-xs font-bold text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
