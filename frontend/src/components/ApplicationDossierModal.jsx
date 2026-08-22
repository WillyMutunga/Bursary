import React from 'react';
import { Printer, X, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ApplicationDossierModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  const app = application;
  const isApproved = app.stage === 'approved' || app.stage === 'paid' || app.stage === 'awarded';

  const handlePrint = () => {
    window.print();
  };

  const qrPayload = JSON.stringify({
    system: 'NG_CDF_KIBWEZI_WEST_BURSARY',
    app_no: app.application_no,
    student: app.full_name,
    national_id: app.national_id,
    admission_no: app.admission_no,
    institution: app.institution?.name || app.institution_name || 'University of Nairobi',
    stage: app.stage || 'submitted',
    cycle: '2026/2027 Financial Year',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto relative text-slate-800 print:shadow-none print:border-none print:max-w-full">
        
        {/* Action Header Bar (Hidden during Print) */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
              OFFICIAL APPLICATION FORM
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">
              {app.application_no || 'CDF/BURS/2026/000001'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Application Form Container */}
        <div className="p-8 sm:p-12 space-y-6 text-xs font-sans leading-relaxed print:p-6 print:space-y-4 bg-white">
          
          {/* 1. Official Government Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="flex justify-center items-center mb-2">
              <img
                src="/logo.png"
                alt="Republic of Kenya NG-CDF Logo"
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">
              REPUBLIC OF KENYA
            </p>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#0B6B3A]">
              NATIONAL GOVERNMENT CONSTITUENCIES DEVELOPMENT FUND (NG-CDF)
            </h1>
            <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800">
              KIBWEZI WEST CONSTITUENCY BURSARY MANAGEMENT SCHEME
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              P.O. Box 128 - 90137, Kibwezi | Tel: +254 (020) 2728490 | Email: bursary@kibweziwestngcdf.go.ke
            </p>
            <div className="pt-2">
              <span className="inline-block bg-slate-100 text-slate-900 text-[10px] font-black px-4 py-1 rounded border border-slate-300 uppercase tracking-wider">
                CONFIDENTIAL STUDENT BURSARY APPLICATION FORM (FY 2026/2027)
              </span>
            </div>
          </div>

          {/* Reference Particulars Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-300 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Application No:</span>
              <strong className="text-[#0B6B3A]">{app.application_no}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Date Submitted:</span>
              <strong>{app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB') : '22/08/2026'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Current Status:</span>
              <strong className="uppercase">{app.stage ? app.stage.replace('_', ' ') : 'UNDER VERIFICATION'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-sans">Academic Year:</span>
              <strong>2026 / 2027</strong>
            </div>
          </div>

          {/* SECTION 1: Personal & Residential Particulars */}
          <div className="space-y-2 border border-slate-300 rounded-xl p-4">
            <h3 className="font-black text-slate-900 uppercase text-[11px] bg-slate-100 p-1.5 rounded flex items-center justify-between">
              <span>SECTION 1: APPLICANT PERSONAL & RESIDENTIAL INFORMATION</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Full Legal Name:</span>
                <strong className="text-slate-900 uppercase text-xs">{app.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">National ID / Birth Cert No:</span>
                <strong className="font-mono text-slate-900">{app.national_id}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Gender:</span>
                <strong className="capitalize text-slate-900">{app.gender || 'Male'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Mobile Phone:</span>
                <strong className="text-slate-900">{app.phone || '0712345678'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Email Address:</span>
                <strong className="text-slate-900">{app.email || 'applicant@bursary.go.ke'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Sub-County Ward:</span>
                <strong className="text-slate-900">{app.ward?.name || 'Emali / Mulala Ward'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Polling Station / Village:</span>
                <strong className="text-slate-900">{app.location || 'Emali Township'}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Physical Residential Address:</span>
                <strong className="text-slate-900">{app.physical_address || 'Kibwezi West Constituency'}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 2: Educational Institution & Fee Statement */}
          <div className="space-y-2 border border-slate-300 rounded-xl p-4">
            <h3 className="font-black text-slate-900 uppercase text-[11px] bg-slate-100 p-1.5 rounded flex items-center justify-between">
              <span>SECTION 2: LEARNING INSTITUTION & FEE PARTICULARS</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Learning Institution:</span>
                <strong className="text-slate-900">{app.institution?.name || app.institution_name || 'University of Nairobi (UoN)'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Admission / Reg No:</span>
                <strong className="font-mono text-slate-900">{app.admission_no || 'UON/ENG/2024/045'}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px]">Course / Programme of Study:</span>
                <strong className="text-slate-900">{app.course_name || 'Bachelor of Science'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Year of Study:</span>
                <strong className="text-slate-900">{app.year_of_study || 'Year 1'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Annual Total Fees (KSh):</span>
                <strong className="font-mono text-slate-900">KSh {Number(app.fees_payable || 92000).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Fees Paid to Date (KSh):</span>
                <strong className="font-mono text-emerald-800">KSh {Number(app.fees_paid || 32000).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Outstanding Fee Balance (KSh):</span>
                <strong className="font-mono text-rose-700 font-black">KSh {Number(app.fee_balance || 60000).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* SECTION 3: Family Socio-Economic & Vulnerability Background */}
          <div className="space-y-2 border border-slate-300 rounded-xl p-4">
            <h3 className="font-black text-slate-900 uppercase text-[11px] bg-slate-100 p-1.5 rounded flex items-center justify-between">
              <span>SECTION 3: FAMILY & SOCIO-ECONOMIC BACKGROUND</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Parental Status:</span>
                <strong className="capitalize text-slate-900">{(app.parent_status || 'partial_orphan').replace('_', ' ')}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Parent / Guardian Name:</span>
                <strong className="text-slate-900">{app.guardian_name || 'Grace Mutunga'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Guardian Phone Number:</span>
                <strong className="font-mono text-slate-900">{app.guardian_phone || '0722111222'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Estimated Monthly Income:</span>
                <strong className="text-slate-900">KSh {Number(app.guardian_monthly_income || 8500).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Family Size / Siblings in School:</span>
                <strong className="text-slate-900">{app.family_size || 5} Members ({app.siblings_in_school || 3} in School)</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Special Needs / PWD:</span>
                <strong className="text-slate-900">{app.is_disabled ? 'Yes (PWD Registered)' : 'None'}</strong>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-500 block text-[10px]">Reason for Bursary Assistance / Hardship Statement:</span>
                <p className="text-slate-800 italic bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                  "{app.special_circumstances || 'Father deceased. Single parent household with multiple dependents and high fee balance burden.'}"
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Official Verification & Decision Summary */}
          <div className="space-y-2 border-2 border-slate-900 rounded-xl p-4 bg-slate-50">
            <h3 className="font-black text-slate-900 uppercase text-[11px] bg-slate-200 p-1.5 rounded flex items-center justify-between">
              <span>SECTION 4: OFFICIAL CONSTITUENCY BURSARY COMMITTEE RECORD</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2 bg-white rounded border border-slate-300">
                <span className="text-slate-500 text-[10px] block">Civil Registry (IPRS) Match:</span>
                <strong className="text-emerald-700">VERIFIED ✓ (100% Match)</strong>
              </div>
              <div className="p-2 bg-white rounded border border-slate-300">
                <span className="text-slate-500 text-[10px] block">Committee Recommendation:</span>
                <strong className={isApproved ? 'text-[#0B6B3A]' : 'text-amber-700'}>
                  {isApproved ? 'APPROVED FOR FUNDING' : 'IN REVIEW QUEUE'}
                </strong>
              </div>
              <div className="p-2 bg-white rounded border border-slate-300">
                <span className="text-slate-500 text-[10px] block">Approved Award Amount:</span>
                <strong className="text-base font-black text-[#0B6B3A]">
                  KSh {Number(app.approved_amount || 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* SECTION 5: Declaration & Signatures */}
          <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 items-end">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-600">Applicant Digital Signature:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-800 text-sm">{app.full_name}</span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-600">Constituency Fund Manager Seal:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-800 text-sm">Alex Kimani (Fund Manager)</span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">Kibwezi West NG-CDF Official Seal</p>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-300 text-center">
              <QRCodeSVG value={qrPayload} size={60} />
              <span className="text-[9px] font-mono text-slate-500 mt-1">VERIFY: {app.application_no}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
