import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, X, CheckCircle2, School, Users, DollarSign, BarChart3, UserCheck } from 'lucide-react';

export default function PortalLoginModal({
  isOpen,
  onClose,
  onSelectRole,
}) {
  const [activeTab, setActiveTab] = useState('demo_roles'); // 'demo_roles' or 'login_form'
  const [credentials, setCredentials] = useState({ idOrEmail: '', password: '' });

  if (!isOpen) return null;

  const roleProfiles = [
    {
      id: 'applicant',
      title: 'Applicant / Student Portal',
      user: 'John Kamau',
      desc: 'Track application, upload documents, view 100-pt score and digital QR award letter.',
      icon: UserCheck,
      color: 'bg-emerald-600',
      badge: 'CITIZEN ACCESS',
    },
    {
      id: 'verification',
      title: 'Verification Officer Desk',
      user: 'Peter Mwangi (Senior Officer)',
      desc: 'Verify applications, side-by-side OCR comparison, duplicate radar, and field inspections.',
      icon: Shield,
      color: 'bg-amber-600',
      badge: 'ADMIN DESK',
    },
    {
      id: 'committee',
      title: 'Bursary Committee Suite',
      user: 'Hon. Grace Njeri (Member 004)',
      desc: '100-point explainable scoring matrix, award deliberations, and mandatory rationale audit.',
      icon: Users,
      color: 'bg-purple-600',
      badge: 'COMMITTEE',
    },
    {
      id: 'finance',
      title: 'Finance & Fund Disbursement',
      user: 'David Ochieng (Finance Director)',
      desc: 'KSh 30M budget utilization, batch payment processing, and direct institution EFT disbursement.',
      icon: DollarSign,
      color: 'bg-teal-600',
      badge: 'FINANCE',
    },
    {
      id: 'school',
      title: 'Educational Institution Portal',
      user: 'Dr. Mary Mutiso (UoN Registrar)',
      desc: 'Restricted school verification to confirm active student enrollment and fee balance ledgers.',
      icon: School,
      color: 'bg-indigo-600',
      badge: 'INSTITUTION',
    },
    {
      id: 'analytics',
      title: 'Executive Analytics & Governance',
      user: 'Alex Kimani (Fund Manager)',
      desc: 'Ward equity allocations, lifecycle pipeline funnel, audit trails, and scoring settings.',
      icon: BarChart3,
      color: 'bg-slate-800',
      badge: 'EXECUTIVE',
    },
  ];

  const handleManualLogin = (e) => {
    e.preventDefault();
    onSelectRole('applicant');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-xs my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B6B3A] text-white flex items-center justify-center border-2 border-[#D4A72C] shadow-md">
            <Shield className="w-6 h-6 text-[#D4A72C]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0F172A] uppercase">
              NG-CDF BURSARY PORTAL ACCESS
            </h3>
            <p className="text-xs text-slate-500 font-medium">Select your portal environment to log in</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('demo_roles')}
            className={`pb-2.5 transition-colors ${activeTab === 'demo_roles' ? 'text-[#0B6B3A] border-b-2 border-[#0B6B3A]' : 'text-slate-500'}`}
          >
            One-Click Portal Switcher
          </button>
          <button
            onClick={() => setActiveTab('login_form')}
            className={`pb-2.5 transition-colors ${activeTab === 'login_form' ? 'text-[#0B6B3A] border-b-2 border-[#0B6B3A]' : 'text-slate-500'}`}
          >
            Standard ID / Password Login
          </button>
        </div>

        {activeTab === 'demo_roles' ? (
          /* Role Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {roleProfiles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => {
                    onSelectRole(role.id);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#0B6B3A] bg-slate-50/70 hover:bg-emerald-50/50 cursor-pointer transition-all hover:scale-[1.02] space-y-2 group shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-xl ${role.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {role.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0B6B3A] transition-colors">{role.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-600">{role.user}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{role.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">National ID / Official Email</label>
              <input
                type="text"
                placeholder="e.g. 38492011 or staff@ngcdf.go.ke"
                value={credentials.idOrEmail}
                onChange={(e) => setCredentials({ ...credentials, idOrEmail: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Sign In to Bursary Portal <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
