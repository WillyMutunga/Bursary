import React, { useState } from 'react';
import { Sparkles, X, Shield, UserCheck, Users, DollarSign, School, BarChart3, History, Sliders } from 'lucide-react';

export default function RoleSwitcherDrawer({ activeRole, onSelectRole }) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: 'public', label: '1. Public Citizen Portal', icon: Shield, desc: 'Public website, eligibility checker & fast status tracker' },
    { id: 'applicant', label: '2. Applicant (John Kamau)', icon: UserCheck, desc: '75% progress dashboard & 10-step application wizard' },
    { id: 'verification', label: '3. Verification Desk', icon: Shield, desc: 'Queue, side-by-side OCR comparator & duplicate radar' },
    { id: 'committee', label: '4. Committee Suite (82/100)', icon: Users, desc: '100-pt explainable scoring & mandatory rationale modal' },
    { id: 'finance', label: '5. Finance & Disbursements', icon: DollarSign, desc: 'KSh 30M budget utilization & batch EFT processing' },
    { id: 'school', label: '6. School Portal (UoN)', icon: School, desc: 'Restricted registrar admission & fee ledger checks' },
    { id: 'analytics', label: '7. Executive Dashboard', icon: BarChart3, desc: 'Ward distribution equity & lifecycle pipeline funnel' },
    { id: 'audit', label: '8. Compliance Audit Trail', icon: History, desc: 'Immutable cryptographically timestamped event log' },
    { id: 'settings', label: '9. Scoring Configurator', icon: Sliders, desc: 'Adjust 6 assessment criteria weights & cycle dates' },
  ];

  return (
    <>
      {/* Floating Action Button at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] hover:bg-[#0B6B3A] text-white text-xs font-bold rounded-full shadow-2xl border-2 border-[#D4A72C] transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-[#D4A72C] animate-spin" />
          <span>Switch Environment</span>
        </button>
      </div>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-200 text-xs relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  DEMO CONTROLS
                </span>
                <h3 className="text-base font-black text-[#0F172A]">Switch Environment</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select any role to test the complete SMART NG-CDF Bursary lifecycle from end to end:
            </p>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = activeRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectRole(r.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-[#0B6B3A] shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#0B6B3A] text-white' : 'bg-slate-200 text-slate-700'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${isSelected ? 'text-[#0B6B3A]' : 'text-slate-900'}`}>{r.label}</h4>
                        <p className="text-[10px] text-slate-500 leading-snug">{r.desc}</p>
                      </div>
                    </div>
                    {isSelected && <span className="text-[10px] bg-[#0B6B3A] text-white font-bold px-2 py-0.5 rounded">ACTIVE</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
