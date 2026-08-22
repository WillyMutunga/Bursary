import React from 'react';
import { Shield, UserCheck, Users, DollarSign, School, BarChart3, QrCode, Sliders, History, Sparkles } from 'lucide-react';

export default function DemoBar({ activeRole = 'public', onSelectRole, onOpenAwardModal }) {
  const roles = [
    { id: 'public', label: '1. Public Website', icon: Shield, color: 'bg-emerald-700' },
    { id: 'applicant', label: '2. Applicant (John Kamau)', icon: UserCheck, color: 'bg-blue-700' },
    { id: 'verification', label: '3. Verification Desk', icon: Shield, color: 'bg-amber-700' },
    { id: 'committee', label: '4. Committee Suite (82/100)', icon: Users, color: 'bg-purple-700' },
    { id: 'finance', label: '5. Finance & Payments', icon: DollarSign, color: 'bg-teal-700' },
    { id: 'school', label: '6. School Portal (UoN)', icon: School, color: 'bg-indigo-700' },
    { id: 'analytics', label: '7. Executive Dashboard', icon: BarChart3, color: 'bg-slate-800' },
    { id: 'audit', label: '8. Audit Logs', icon: History, color: 'bg-slate-700' },
    { id: 'settings', label: '9. System Config', icon: Sliders, color: 'bg-slate-900' },
  ];

  return (
    <aside aria-label="Interactive Demo Switcher" className="bg-[#0B6B3A] text-white px-3 py-2 text-xs shadow-inner flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
      <div className="flex items-center gap-2">
        <span className="bg-[#D4A72C] text-[#0F172A] font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" /> DEMO CONTROLS
        </span>
        <span className="hidden md:inline text-emerald-100 text-[11px] font-medium">
          Switch between 9 environments to experience the complete bursary lifecycle:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = activeRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRole && onSelectRole(r.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all shadow-sm ${
                isActive
                  ? 'bg-[#D4A72C] text-[#0F172A] ring-2 ring-white scale-105'
                  : 'bg-black/30 hover:bg-black/50 text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              {r.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
