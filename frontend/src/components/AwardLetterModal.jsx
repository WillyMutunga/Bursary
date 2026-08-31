import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Printer, CheckCircle2, QrCode, Download, ExternalLink, X, Building2, User, FileText } from 'lucide-react';

export default function AwardLetterModal({
  application,
  isOpen,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('certificate');
  const [scanResult, setScanResult] = useState(null);

  if (!isOpen || !application) return null;

  const app = application;
  const hash = app.award_certificate_hash || 'CDF-AWARD-2026-992144';
  const approvedAmount = Number(app.approved_amount || 20000);

  const qrPayload = JSON.stringify({
    type: 'NG_CDF_OFFICIAL_BURSARY_AWARD',
    app_no: app.application_no,
    beneficiary: app.full_name,
    national_id: app.national_id,
    institution: app.institution?.name || app.institution_name || 'University of Nairobi (UoN)',
    amount_kes: approvedAmount,
    cycle: '2026/2027 Financial Year',
    hash: hash,
    verification_url: `https://bursary.skysoftsystems.co.ke/verify/award/${hash}`,
    status: 'OFFICIALLY_VERIFIED_VALID',
  });

  const handleSimulateScan = () => {
    setScanResult({
      isValid: true,
      hash: hash,
      app_no: app.application_no,
      beneficiary: app.full_name,
      amount: approvedAmount,
      institution: app.institution?.name || 'University of Nairobi',
      cycle: '2026/2027 Cycle',
      timestamp: new Date().toLocaleString(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto relative text-slate-800 print:shadow-none print:border-none print:max-w-full">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              OFFICIAL AWARD LETTER
            </span>
            <span className="text-xs text-slate-300 font-mono font-bold">{app.application_no}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Award Letter
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Kenya NG-CDF Award Letter */}
        <div className="p-8 sm:p-12 space-y-6 text-xs font-serif leading-relaxed print:p-6 print:space-y-4">
          
          {/* Government Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="flex justify-center items-center mb-2">
              <img
                src="/logo.png"
                alt="Republic of Kenya NG-CDF Logo"
                className="h-16 w-auto object-contain mx-auto"
              />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#0F172A] font-sans">
              REPUBLIC OF KENYA
            </p>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#0B6B3A] font-sans">
              NATIONAL GOVERNMENT CONSTITUENCIES DEVELOPMENT FUND (NG-CDF)
            </h1>
            <h2 className="text-sm font-bold uppercase text-slate-800 font-sans">
              KIBWEZI WEST CONSTITUENCY
            </h2>
            <p className="text-[10px] text-slate-500 font-sans">
              Office of the Constituency Fund Manager | P.O. Box 128 - 90137, Kibwezi | Email: bursary@kibweziwestngcdf.go.ke
            </p>
          </div>

          {/* Letter Reference & Date */}
          <div className="flex justify-between items-start text-xs font-sans pt-1">
            <div>
              <p><strong>Ref No:</strong> NG-CDF/KBW/BURS/{app.application_no || '2026/001'}</p>
              <p><strong>Certificate Hash:</strong> <span className="font-mono text-slate-600">{hash}</span></p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Beneficiary Address Box */}
          <div className="space-y-0.5 text-xs font-sans">
            <p className="font-bold">TO:</p>
            <p className="font-bold text-slate-900 uppercase">{app.full_name}</p>
            <p><strong>National ID / Reg:</strong> {app.national_id}</p>
            <p><strong>Admission No:</strong> {app.admission_no || 'UON/ENG/2024/045'}</p>
            <p><strong>Institution:</strong> {app.institution?.name || app.institution_name || 'University of Nairobi (UoN)'}</p>
          </div>

          {/* Subject Line */}
          <div className="py-2 border-y border-slate-300 font-sans">
            <h3 className="text-sm font-black uppercase text-slate-900 underline decoration-slate-900">
              RE: OFFICIAL NOTIFICATION OF NG-CDF BURSARY AWARD (FY 2026/2027)
            </h3>
          </div>

          {/* Body Content */}
          <div className="space-y-3 text-justify text-xs text-slate-800 leading-relaxed font-sans">
            <p>
              We are pleased to inform you that your application for bursary sponsorship under the Kibwezi West NG-CDF Education Bursary Scheme has been evaluated and formally <strong>APPROVED</strong> by the Constituency Bursary Committee.
            </p>
            
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-xl my-3 flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="font-bold text-xs uppercase text-slate-700">APPROVED BURSARY GRANT AMOUNT:</span>
              <span className="font-mono text-xl font-black text-[#0B6B3A]">
                KSh {approvedAmount.toLocaleString()}
              </span>
            </div>

            <p>
              <strong>TERMS AND CONDITIONS OF GRANT:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[11px]">
              <li>This bursary grant is non-transferable and is disbursed strictly via direct Electronic Funds Transfer (EFT) / Cheque to your learning institution: <strong>{app.institution?.name || 'University of Nairobi'}</strong>.</li>
              <li>The awarded amount must be credited solely towards your tuition fee account for the 2026/2027 Academic Year.</li>
              <li>Present this verified letter together with your Student ID card to the institution bursar for fee ledger crediting.</li>
            </ul>
          </div>

          {/* Signatures and QR Code */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 items-end font-sans">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-600">Fund Manager Signature:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Willy</span>
              </div>
              <p className="text-[9px] text-slate-500">Constituency Fund Manager / Super Admin</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-600">Committee Chairperson:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Hon. Committee Chairperson</span>
              </div>
              <p className="text-[9px] text-slate-500">Kibwezi West NG-CDF</p>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-300 text-center">
              <QRCodeSVG value={qrPayload} size={64} />
              <span className="text-[9px] font-mono text-slate-500 mt-1">VERIFY: {app.application_no}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
