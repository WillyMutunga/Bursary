import React from 'react';
import { Shield, CheckCircle2, Phone, Mail, MapPin, Award, Lock, FileText, Globe } from 'lucide-react';

export default function Footer({ onOpenStatusModal, onSelectRole }) {
  return (
    <footer className="bg-[#0F172A] text-slate-300 pt-16 pb-8 border-t-4 border-[#0B6B3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mandate */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B6B3A] flex items-center justify-center text-white border-2 border-[#D4A72C]">
                <Shield className="w-6 h-6 text-[#D4A72C]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">SMART NG-CDF BURSARY</h3>
                <p className="text-[11px] text-slate-400">National Government Constituencies Development Fund</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              Digitizing and transforming constituency bursary administration with transparent smart scoring, real-time national ID authentication, OCR document verification, duplicate detection, and tamper-proof QR award letters.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-300 font-semibold px-2.5 py-1 rounded-md border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> ISO 9001:2015 Compliant
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-amber-950 text-amber-300 font-semibold px-2.5 py-1 rounded-md border border-amber-800">
                <Lock className="w-3.5 h-3.5" /> Data Protection Act 2019
              </span>
            </div>
          </div>

          {/* Col 2: Fast Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 text-[#D4A72C]">
              System Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onSelectRole && onSelectRole('applicant')} className="hover:text-emerald-400 transition-colors">Applicant Portal</button></li>
              <li><button onClick={() => onSelectRole && onSelectRole('verification')} className="hover:text-emerald-400 transition-colors">Verification Desk</button></li>
              <li><button onClick={() => onSelectRole && onSelectRole('committee')} className="hover:text-emerald-400 transition-colors">Committee Review Portal</button></li>
              <li><button onClick={() => onSelectRole && onSelectRole('finance')} className="hover:text-emerald-400 transition-colors">Finance & Disbursement</button></li>
              <li><button onClick={() => onSelectRole && onSelectRole('school')} className="hover:text-emerald-400 transition-colors">School Confirmation</button></li>
              <li><button onClick={() => onSelectRole && onSelectRole('analytics')} className="hover:text-emerald-400 transition-colors">Executive Analytics</button></li>
            </ul>
          </div>

          {/* Col 3: Citizen Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 text-[#D4A72C]">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onSelectRole && onSelectRole('applicant')} className="hover:text-emerald-400 transition-colors">Online Bursary Application</button></li>
              <li><button onClick={onOpenStatusModal} className="hover:text-emerald-400 transition-colors">Check Application Status</button></li>
              <li><a href="#eligibility" className="hover:text-emerald-400 transition-colors">Bursary Eligibility Criteria</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">6-Step Application Process</a></li>
              <li><button onClick={() => onSelectRole && onSelectRole('committee')} className="hover:text-emerald-400 transition-colors">Verify Award Letter QR</button></li>
              <li><a href="#faqs" className="hover:text-emerald-400 transition-colors">Constituency Bursary FAQs</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 text-[#D4A72C]">
              Constituency Office
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-0.5" />
                <span>Constituency NG-CDF Office, CDF Complex, Off Waiyaki Way, Nairobi</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0B6B3A] shrink-0" />
                <span>+254 (020) 2728490 / 0712 000 999</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0B6B3A] shrink-0" />
                <span>bursary@ngcdf.go.ke</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">Working Hours: Mon - Fri: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 National Government Constituencies Development Fund (NG-CDF). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onSelectRole && onSelectRole('audit')} className="hover:text-slate-300">Public Audit Trail</button>
            <button onClick={() => onSelectRole && onSelectRole('settings')} className="hover:text-slate-300">System Parameters</button>
            <span className="text-slate-600">•</span>
            <span className="text-[#D4A72C] font-semibold">Reference: Skysoft Systems Bursary Baseline</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
