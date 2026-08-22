import React, { useState } from 'react';
import {
  Shield, Users, DollarSign, BarChart3, School, UserCheck,
  FileText, Database, Activity, MapPin, Award, Layers, Clock, Globe, LogOut, ChevronRight, X, Lock, Sparkles
} from 'lucide-react';

export default function Sidebar({
  authSession,
  activeRole,
  activeTab,
  onSelectTab,
  onLogout,
  onOpenPublic,
  isMobileOpen = false,
  onCloseMobile,
  isWindowOpen = true,
  onToggleWindow,
}) {
  const role = authSession?.role || activeRole || 'applicant';
  const user = authSession?.user || {
    name: 'Willy Mutunga',
    role: 'applicant',
    designation: 'Applicant / Student',
  };

  const isAdminOrAnalytics = role === 'admin' || role === 'super_admin' || role === 'analytics';

  // Only necessary, 100% working features per role
  const roleFeatures = {
    admin: [
      { id: 'overview', label: 'Overview & Live KPIs', icon: Activity, badge: 'OVERVIEW' },
      { id: 'users', label: 'Staff & User Accounts', icon: Users, badge: 'USERS' },
      { id: 'wards', label: 'Ward Budget Allocations', icon: MapPin, badge: 'WARDS' },
      { id: 'audit', label: 'Security Audit Trail', icon: Database, badge: 'LOGS' },
    ],
    analytics: [
      { id: 'overview', label: 'Overview & Live KPIs', icon: Activity, badge: 'OVERVIEW' },
      { id: 'users', label: 'Staff & User Accounts', icon: Users, badge: 'USERS' },
      { id: 'wards', label: 'Ward Budget Allocations', icon: MapPin, badge: 'WARDS' },
      { id: 'audit', label: 'Security Audit Trail', icon: Database, badge: 'LOGS' },
    ],
    committee: [
      { id: 'queue', label: 'Deliberation Queue', icon: Users, badge: 'QUEUE' },
      { id: 'schedule', label: 'Institutional Schedule', icon: School, badge: 'TRANSMITTAL' },
      { id: 'dossier', label: 'Print HELB Dossier', icon: FileText, badge: 'PRINT' },
    ],
    verification: [
      { id: 'queue', label: 'Verification Queue', icon: UserCheck, badge: 'QUEUE' },
      { id: 'dossier', label: 'Print HELB Dossier', icon: FileText, badge: 'PRINT' },
    ],
    finance: [
      { id: 'ready', label: 'Approved for Payment', icon: DollarSign, badge: 'QUEUE' },
      { id: 'institutions', label: 'School Cheque Schedule', icon: School, badge: 'TRANSMITTAL' },
    ],
    school: [
      { id: 'enrolled', label: 'Enrolled Student List', icon: School, badge: 'STUDENTS' },
    ],
    applicant: [
      { id: 'status', label: 'My Bursary Status', icon: Activity, badge: 'DASHBOARD' },
      { id: 'dossier', label: 'Print Application Form', icon: FileText, badge: 'HELB-STYLE' },
      { id: 'award', label: 'Digital Award Letter', icon: Award, badge: 'CERTIFICATE' },
    ],
    audit: [
      { id: 'logs', label: 'Security Audit Trail', icon: Database, badge: 'LOGS' },
    ],
  };

  const currentFeatures = roleFeatures[role] || roleFeatures.applicant;

  const roleTitles = {
    admin: { title: 'Super Admin Suite', badge: 'Admin Governance' },
    analytics: { title: 'Executive Analytics', badge: 'Analytics Desk' },
    committee: { title: 'Committee Suite', badge: 'Deliberation Desk' },
    verification: { title: 'Verification Desk', badge: 'Verification Desk' },
    finance: { title: 'Finance & EFT Desk', badge: 'Finance Desk' },
    school: { title: 'School Registrar', badge: 'Academic Desk' },
    applicant: { title: 'Student Portal', badge: 'Applicant Desk' },
    audit: { title: 'Audit Trail Desk', badge: 'Security Desk' },
  };

  const userInitials = (user.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentMeta = roleTitles[role] || { title: 'Bursary Workspace', badge: 'Portal' };

  const sidebarContent = (
    <div className="w-72 bg-[#0B132B] text-slate-200 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-full shadow-2xl font-sans">
      
      {/* 1. Header & Unified Brand / Profile Card */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        
        {/* Brand & Official Seal with Mobile Close */}
        <div className="flex items-center justify-between">
          <div
            onClick={onOpenPublic}
            className="flex items-center gap-3 cursor-pointer group p-1 rounded-2xl hover:bg-slate-900/60 transition-all flex-1"
          >
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="NG-CDF Logo"
                className="w-10 h-10 object-contain bg-white rounded-xl p-1 shadow border border-slate-700 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-wider text-[#D4A72C] leading-none">
                REPUBLIC OF KENYA
              </p>
              <h2 className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-emerald-300 transition-colors mt-0.5">
                NG-CDF KIBWEZI WEST
              </h2>
              <p className="text-[9px] text-emerald-400/80 italic font-medium truncate">Bursary Management System</p>
            </div>
          </div>

          {/* Close Button on Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Unified Profile & Workspace Pill */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0E1B38] to-slate-900 p-2.5 rounded-2xl border border-slate-700/60 shadow-inner space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0B6B3A] to-[#042815] text-white flex items-center justify-center font-black text-xs border border-[#D4A72C] shrink-0 shadow-md">
              {userInitials}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.designation || user.role}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
            <span className="font-bold text-[#D4A72C] bg-[#D4A72C]/10 px-2 py-0.5 rounded border border-[#D4A72C]/30 uppercase text-[9px] tracking-wide">
              {currentMeta.title}
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-beacon"></span> LIVE
            </span>
          </div>
        </div>

        {/* 🟢🔴 APPLICATION WINDOW CONTROL SWITCH (IN SIDEBAR) */}
        {isAdminOrAnalytics && (
          <div className="bg-[#080E21] p-2.5 rounded-2xl border border-slate-800 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-black uppercase tracking-wider text-slate-400">APPLICATION INTAKE</span>
              <span className={`font-bold uppercase ${isWindowOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isWindowOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onToggleWindow && onToggleWindow()}
              className={`w-full py-2 px-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isWindowOpen
                  ? 'bg-emerald-950/90 hover:bg-rose-950 text-emerald-300 hover:text-rose-300 border border-emerald-700/80 hover:border-rose-700'
                  : 'bg-rose-950/90 hover:bg-emerald-950 text-rose-300 hover:text-emerald-300 border border-rose-700/80 hover:border-emerald-700'
              }`}
              title={isWindowOpen ? 'Click to Close & Lock Application Window' : 'Click to Open Application Window'}
            >
              {isWindowOpen ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon shrink-0"></span>
                  <span>Window Open (Lock)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Window Closed (Open)</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* 2. Role-Specific Feature Navigation */}
      <div className="flex-1 px-3 py-2.5 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
          <span>NAVIGATION</span>
          <span className="font-mono text-[9px] text-emerald-500 font-bold">{currentFeatures.length} TABS</span>
        </div>

        {currentFeatures.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (onSelectTab) onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-gradient-to-r from-[#0B6B3A] via-[#08522c] to-[#0B6B3A] text-white shadow-md shadow-emerald-950/40 border border-emerald-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <p className={`text-xs truncate ${isSelected ? 'text-white font-black' : 'text-slate-300 font-medium'}`}>
                  {item.label}
                </p>
              </div>

              {isSelected && (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom Controls */}
      <div className="p-3 border-t border-slate-800/80 space-y-1.5 bg-[#080E21]">
        <button
          type="button"
          onClick={() => {
            onOpenPublic();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-between border border-slate-700 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#D4A72C]" /> View Public Website
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-rose-900/40 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sticky Sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
