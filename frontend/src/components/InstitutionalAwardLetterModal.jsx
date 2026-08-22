import React from 'react';
import { Shield, Printer, X, Download, Building2, CheckCircle2, QrCode, FileText } from 'lucide-react';

export default function InstitutionalAwardLetterModal({
  isOpen,
  onClose,
  institution = { name: 'University of Nairobi (UoN)', code: 'UON-001' },
  beneficiaries = [],
  chequeDetails = { chequeNo: 'EFT-2026-992144', batchNo: 'BATCH-2026-08', date: '22nd August 2026' }
}) {
  if (!isOpen) return null;

  const totalAmount = beneficiaries.reduce((sum, b) => sum + (Number(b.approved_amount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto relative text-slate-800 print:shadow-none print:border-none print:max-w-full">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              INSTITUTIONAL TRANSMITTAL SCHEDULE
            </span>
            <span className="text-xs text-slate-300 font-bold">{institution.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Institutional Letter & Schedule
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Institutional Transmittal Document */}
        <div className="p-8 sm:p-12 space-y-6 text-xs font-serif leading-relaxed print:p-6 print:space-y-4">
          
          {/* Kenya Government Letterhead */}
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
            <p className="text-[10px] text-slate-500 font-sans font-medium">
              Office of the Constituency Fund Manager | P.O. Box 128 - 90137, Kibwezi | Email: info@kibweziwestngcdf.go.ke
            </p>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-start text-xs font-sans pt-2">
            <div>
              <p><strong>Our Ref:</strong> NG-CDF/KBW/BURS/{chequeDetails.batchNo || 'BATCH-2026'}</p>
              <p><strong>Cheque / EFT Ref:</strong> {chequeDetails.chequeNo || 'EFT-88492011'}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {chequeDetails.date || new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Addressee */}
          <div className="space-y-0.5 text-xs font-sans">
            <p className="font-bold">TO:</p>
            <p className="font-bold text-slate-900 uppercase">THE VICE-CHANCELLOR / PRINCIPAL / BURSAR,</p>
            <p className="font-bold text-slate-800">{institution.name}</p>
            <p className="text-slate-600">P.O. Box Accredited Address</p>
          </div>

          {/* Subject Line */}
          <div className="py-2 border-y border-slate-300 font-sans">
            <h3 className="text-sm font-black uppercase text-slate-900 underline decoration-slate-900">
              RE: TRANSMITTAL OF NG-CDF BURSARY DISBURSEMENT CHEQUE / EFT FOR ACADEMIC YEAR 2026/2027 BENEFICIARIES
            </h3>
          </div>

          {/* Letter Body Text */}
          <div className="space-y-3 text-justify text-xs text-slate-800 leading-normal">
            <p>
              The Kibwezi West National Government Constituency Development Fund (NG-CDF) Committee is pleased to forward herewith our payment of <strong>KSh {totalAmount.toLocaleString()}</strong> in respect of bursary sponsorship awarded to the underlisted students enrolled in your institution for the 2026/2027 Academic Year.
            </p>
            <p>
              Kindly credit the respective student tuition accounts with the corresponding amounts indicated against their names and issue official receipts acknowledging receipt of these public funds.
            </p>
          </div>

          {/* Combined Beneficiary Schedule Table */}
          <div className="space-y-2 font-sans pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-900">
              SCHEDULE OF BENEFICIARY STUDENTS ({beneficiaries.length} STUDENTS)
            </h4>
            
            <div className="overflow-x-auto border border-slate-400 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase">
                    <th className="p-2 border-r border-slate-300 text-center">S/No</th>
                    <th className="p-2 border-r border-slate-300">Student Full Name</th>
                    <th className="p-2 border-r border-slate-300">Admission No</th>
                    <th className="p-2 border-r border-slate-300">Course / Programme</th>
                    <th className="p-2 border-r border-slate-300">National ID</th>
                    <th className="p-2 border-r border-slate-300">Sub-County Ward</th>
                    <th className="p-2 text-right">Awarded (KSh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {beneficiaries.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-bold uppercase">{b.full_name}</td>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold">{b.admission_no}</td>
                      <td className="p-2 border-r border-slate-300">{b.course_name || 'Academic Studies'}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{b.national_id}</td>
                      <td className="p-2 border-r border-slate-300">{b.ward?.name || 'Kibwezi West'}</td>
                      <td className="p-2 text-right font-mono font-black text-[#0B6B3A]">
                        KSh {Number(b.approved_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                    <td colSpan="6" className="p-2.5 text-right uppercase border-r border-slate-300">
                      TOTAL INSTITUTIONAL DISBURSEMENT AMOUNT:
                    </td>
                    <td className="p-2.5 text-right font-mono text-sm text-[#0B6B3A]">
                      KSh {totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures and Seals */}
          <div className="pt-8 grid grid-cols-3 gap-6 items-end font-sans">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-600">Fund Manager Signature:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Alex Kimani</span>
              </div>
              <p className="text-[9px] text-slate-500">Constituency Fund Manager</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-600">Committee Chairperson:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Willy / Hon. Grace Njeri</span>
              </div>
              <p className="text-[9px] text-slate-500">Bursary Committee Chairperson</p>
            </div>

            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-300 text-center">
              <QrCode className="w-12 h-12 text-slate-900" />
              <span className="text-[9px] font-mono text-slate-500 mt-1">BATCH VERIFICATION SEAL</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
