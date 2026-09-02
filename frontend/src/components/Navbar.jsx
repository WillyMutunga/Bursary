import React from 'react';
import { Shield, LogIn, UserPlus, LogOut, ArrowRight, User, Sparkles, Activity, Bell, Search, Globe, ChevronRight } from 'lucide-react';

export default function Navbar({
  authSession,
  activeRole: propActiveRole,
  currentUser: propCurrentUser,
  onLogout,
  onOpenStatusModal,
  onOpenAuth,
  onOpenAuthModal,
  onSelectRole,
  onToggleMobileSidebar,
}) {
  const triggerAuth = onOpenAuthModal || onOpenAuth || (() => {});
  const role = authSession ? authSession.role : (propActiveRole || 'public');
  const isPublic = !role || role === 'public';
  const safeUser = authSession?.user || propCurrentUser || {
    name: 'Willy Mutunga',
    role: 'applicant',
    designation: 'Applicant / Student',
  };

  const userInitials = (safeUser.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#0B1528] text-white border-b border-slate-800 shadow-xl transition-all font-sans">
      {/* Top Kenyan National Flag 3-Color Ribbon Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0B6B3A] via-[#D4A72C] to-[#991B1B]"></div>

      {isPublic ? (
        /* ==================== 1. PUBLIC LANDING HEADER ==================== */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Title */}
            <div
              onClick={() => onSelectRole && onSelectRole('public')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="relative shrink-0">
                <img
                  src="/logo.png"
                  alt="Republic of Kenya NG-CDF Logo"
                  className="w-13 h-13 object-contain bg-white rounded-2xl p-1.5 shadow-lg border-2 border-[#D4A72C]/40 transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4A72C]"
                />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0B1528]"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A72C] flex items-center gap-1">
                    <span>🇰🇪</span> REPUBLIC OF KENYA
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-700/60 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> FY 2026/2027 ACTIVE
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-300 transition-colors">
                  NG-CDF KIBWEZI WEST CONSTITUENCY
                </h1>
                <p className="text-[10px] text-emerald-400/90 font-semibold tracking-wide">
                  Autonomous Bursary Management & Decision-Support System
                </p>
              </div>
            </div>

            {/* Public Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => triggerAuth('login')}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700 rounded-xl border border-slate-700 shadow-sm transition-all duration-200 hover:scale-105 hover:text-white cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D4A72C]" /> Portal Sign In
              </button>

              <button
                type="button"
                onClick={() => triggerAuth('register')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-[#0B6B3A] to-[#074726] hover:from-[#0d8246] hover:to-[#0B6B3A] rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-500/50 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D4A72C]" /> New Student Register
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* ==================== 2. AUTHENTICATED EXECUTIVE TOP BAR ==================== */
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Mobile Hamburger & System Status Banner */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                title="Toggle Navigation Menu"
              >
                <div className="space-y-1 w-4">
                  <span className="block h-0.5 w-4 bg-emerald-400"></span>
                  <span className="block h-0.5 w-3 bg-[#D4A72C]"></span>
                  <span className="block h-0.5 w-4 bg-emerald-400"></span>
                </div>
              </button>

              <div className="flex items-center gap-2 bg-slate-900/95 px-3 py-1.5 rounded-xl border border-slate-800 text-xs shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-black text-slate-200">Kibwezi West NG-CDF</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-[#D4A72C] font-mono font-bold hidden sm:inline">FY 2026/2027 Cycle 1</span>
              </div>
            </div>

            {/* Right: Quick Action Controls & User Pill */}
            <div className="flex items-center gap-3">
              
              <button
                type="button"
                onClick={() => onSelectRole && onSelectRole('public')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A72C]" /> Public Site
              </button>

              {/* User Profile Capsule with Dynamic Role Badge */}
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-slate-900 via-slate-900 to-[#121E36] pl-2 pr-3 py-1 rounded-2xl border border-slate-700 shadow-md">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0B6B3A] to-[#042815] text-white flex items-center justify-center font-black text-xs border border-[#D4A72C] shadow-sm shrink-0">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left overflow-hidden max-w-[180px]">
                  <p className="text-xs font-black text-slate-100 truncate leading-none">{safeUser.name}</p>
                  <p className="text-[10px] font-bold truncate mt-0.5 uppercase tracking-wider text-[#D4A72C]">
                    {safeUser.designation || safeUser.role}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 transition-all cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
