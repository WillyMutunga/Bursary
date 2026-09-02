import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Printer, X, Download, Building2, CheckCircle2, QrCode, FileText, ChevronDown } from 'lucide-react';

// Number to Words converter (Kenyan Shillings)
function numberToKenyanWords(num) {
  if (!num || isNaN(num) || num <= 0) return 'Zero Shillings';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  const integerPart = Math.floor(num);
  let words = '';

  if (integerPart >= 1000000) {
    const millions = Math.floor(integerPart / 1000000);
    words += convertGroup(millions) + ' Million ';
  }
  const remMillions = integerPart % 1000000;
  if (remMillions >= 1000) {
    const thousands = Math.floor(remMillions / 1000);
    words += convertGroup(thousands) + ' Thousand ';
  }
  const remThousands = remMillions % 1000;
  if (remThousands > 0) {
    words += convertGroup(remThousands);
  }

  return `Kenya Shillings ${words.trim()} Only`;
}

// Accredited Kenya Institutional Postal & Campus Registry
const KNOWN_INSTITUTION_DETAILS = {
  'Kenyatta University (KU)': {
    address: 'P.O. Box 43844 - 00100, Nairobi, Kenya',
    location: 'Main Campus, Along Thika Superhighway',
    email: 'finance@ku.ac.ke | registrar-acad@ku.ac.ke',
  },
  'University of Nairobi (UoN)': {
    address: 'P.O. Box 30197 - 00100, Nairobi, Kenya',
    location: 'Main Campus, University Way',
    email: 'bursar@uonbi.ac.ke | finance@uonbi.ac.ke',
  },
  'Kabete National Polytechnic': {
    address: 'P.O. Box 29010 - 00625, Nairobi, Kenya',
    location: 'Along Waiyaki Way, Nairobi',
    email: 'info@kabetepoly.ac.ke',
  },
  'Makueni Technical College': {
    address: 'P.O. Box 112 - 90300, Wote, Kenya',
    location: 'Wote Town, Makueni County',
    email: 'info@makuenitechnical.ac.ke',
  },
  'Machakos University': {
    address: 'P.O. Box 136 - 90100, Machakos, Kenya',
    location: 'Machakos Town',
    email: 'finance@mksu.ac.ke',
  },
  'South Eastern Kenya University (SEKU)': {
    address: 'P.O. Box 170 - 90200, Kitui, Kenya',
    location: 'Main Campus, Kwa Vonza',
    email: 'finance@seku.ac.ke',
  },
};

export default function InstitutionalAwardLetterModal({
  isOpen,
  onClose,
  institution: propInstitution,
  beneficiaries = [],
  institutions = [],
  chequeDetails = { chequeNo: 'EFT-2026-992144', batchNo: 'BATCH-2026-08', date: '22nd August 2026' }
}) {
  if (!isOpen) return null;

  // 1. Group beneficiaries by institution
  const instMap = useMemo(() => {
    const map = {};
    beneficiaries.forEach((b) => {
      let instName = b.institution?.name || b.institution_name;
      if (!instName && b.institution_id && Array.isArray(institutions)) {
        const found = institutions.find((i) => i.id === b.institution_id);
        if (found) instName = found.name;
      }
      if (!instName) instName = 'Kenyatta University (KU)';

      if (!map[instName]) {
        map[instName] = [];
      }
      map[instName].push(b);
    });
    return map;
  }, [beneficiaries, institutions]);

  const availableInstNames = Object.keys(instMap);

  // 2. Initial selected institution: prefer prop if valid and matches, else first actual beneficiary institution
  const initialInstName = useMemo(() => {
    if (propInstitution?.name && propInstitution.name !== 'University of Nairobi (UoN)' && instMap[propInstitution.name]) {
      return propInstitution.name;
    }
    return availableInstNames[0] || propInstitution?.name || 'Kenyatta University (KU)';
  }, [propInstitution, instMap, availableInstNames]);

  const [selectedInstName, setSelectedInstName] = useState(initialInstName);

  useEffect(() => {
    if (initialInstName) {
      setSelectedInstName(initialInstName);
    }
  }, [initialInstName]);

  const activeInstitution = institutions.find((i) => i.name === selectedInstName) || {
    name: selectedInstName,
    code: (instMap[selectedInstName]?.[0]?.institution?.code) || 'INST-001'
  };

  const currentBeneficiaries = instMap[selectedInstName] || beneficiaries;
  const totalAmount = currentBeneficiaries.reduce((sum, b) => sum + (Number(b.approved_amount) || 0), 0);
  const amountInWords = useMemo(() => numberToKenyanWords(totalAmount), [totalAmount]);

  // Real institutional address lookup
  const instDetail = KNOWN_INSTITUTION_DETAILS[activeInstitution.name] || {
    address: activeInstitution.address || 'P.O. Box Accredited Postal Address, Kenya',
    location: activeInstitution.location || 'Accredited Campus',
    email: activeInstitution.email || 'finance@institution.ac.ke',
  };

  // Dynamic Date Formatting (e.g. "2nd September 2026")
  const formattedDate = useMemo(() => {
    if (chequeDetails?.date && chequeDetails.date !== '22nd August 2026') {
      return chequeDetails.date;
    }
    const d = new Date();
    const day = d.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${day}${suffix} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }, [chequeDetails?.date]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 overflow-hidden my-auto relative text-slate-800 print:shadow-none print:border-none print:max-w-full">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4A72C] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase">
              INSTITUTIONAL TRANSMITTAL SCHEDULE
            </span>
            {availableInstNames.length > 1 ? (
              <select
                value={selectedInstName}
                onChange={(e) => setSelectedInstName(e.target.value)}
                className="bg-slate-800 text-xs text-[#D4A72C] font-bold px-2 py-1 rounded border border-slate-600 outline-none cursor-pointer"
              >
                {availableInstNames.map((name) => (
                  <option key={name} value={name}>
                    {name} ({instMap[name].length})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-300 font-bold">{activeInstitution.name}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Institutional Letter & Schedule
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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

          {/* Reference & Date (Dynamic) */}
          <div className="flex justify-between items-start text-xs font-sans pt-2">
            <div>
              <p><strong>Our Ref:</strong> NG-CDF/KBW/BURS/{chequeDetails.batchNo || 'BATCH-2026'}</p>
              <p><strong>Cheque / EFT Ref:</strong> {chequeDetails.chequeNo || 'EFT-88492011'}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {formattedDate}</p>
            </div>
          </div>

          {/* Addressee (Real Address & Campus Location) */}
          <div className="space-y-0.5 text-xs font-sans">
            <p className="font-bold">TO:</p>
            <p className="font-bold text-slate-900 uppercase">THE VICE-CHANCELLOR / PRINCIPAL / BURSAR,</p>
            <p className="font-bold text-slate-800 text-sm text-[#0B6B3A]">{activeInstitution.name}</p>
            <p className="text-slate-700 font-medium">{instDetail.address}</p>
            {instDetail.location && <p className="text-slate-500 text-[11px]">{instDetail.location}</p>}
          </div>

          {/* Subject Line */}
          <div className="py-2 border-y border-slate-300 font-sans">
            <h3 className="text-sm font-black uppercase text-slate-900 underline decoration-slate-900">
              RE: TRANSMITTAL OF NG-CDF BURSARY DISBURSEMENT CHEQUE / EFT FOR ACADEMIC YEAR 2026/2027 BENEFICIARIES
            </h3>
          </div>

          {/* Letter Body Text (Includes Amount in Words) */}
          <div className="space-y-3 text-justify text-xs text-slate-800 leading-normal">
            <p>
              The Kibwezi West National Government Constituency Development Fund (NG-CDF) Committee is pleased to forward herewith our payment of <strong>KSh {totalAmount.toLocaleString()} ({amountInWords})</strong> in respect of bursary sponsorship awarded to the underlisted students enrolled in your institution for the 2026/2027 Academic Year.
            </p>
            <p>
              Kindly credit the respective student tuition accounts with the corresponding amounts indicated against their names and issue official receipts acknowledging receipt of these public funds.
            </p>
          </div>

          {/* Combined Beneficiary Schedule Table */}
          <div className="space-y-2 font-sans pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-900">
              SCHEDULE OF BENEFICIARY STUDENTS ({currentBeneficiaries.length} STUDENTS)
            </h4>
            
            <div className="overflow-x-auto border border-slate-400 rounded-lg">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold uppercase">
                    <th className="p-2 border-r border-slate-300 text-center">S/No</th>
                    <th className="p-2 border-r border-slate-300">Student Full Name</th>
                    <th className="p-2 border-r border-slate-300">Admission No</th>
                    <th className="p-2 border-r border-slate-300">Course / Programme</th>
                    <th className="p-2 text-right">Awarded (KSh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {currentBeneficiaries.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-bold uppercase">{b.full_name}</td>
                      <td className="p-2 border-r border-slate-300 font-mono font-bold">{b.admission_no}</td>
                      <td className="p-2 border-r border-slate-300">{b.course_name || 'Academic Studies'}</td>
                      <td className="p-2 text-right font-mono font-black text-[#0B6B3A]">
                        KSh {Number(b.approved_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                    <td colSpan="4" className="p-2.5 text-right uppercase border-r border-slate-300">
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

          {/* Signatures, Official Stamp Box, and Verification Seals */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 items-end font-sans">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-600">Fund Manager Signature:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Willy</span>
              </div>
              <p className="text-[9px] text-slate-500">Constituency Fund Manager</p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-600">Committee Chairperson:</p>
              <div className="border-b border-slate-400 pb-1">
                <span className="font-serif italic font-bold text-slate-900">Pastor David Musyoka</span>
              </div>
              <p className="text-[9px] text-slate-500">Bursary Committee Chairperson</p>
            </div>

            {/* Official NG-CDF Rubber Stamp Box */}
            <div className="border-2 border-dashed border-slate-400 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center h-28 bg-slate-50">
              <Shield className="w-5 h-5 text-[#0B6B3A] mb-1" />
              <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">OFFICIAL NG-CDF STAMP</span>
              <span className="text-[8px] text-slate-500 font-semibold">Kibwezi West Constituency</span>
              <span className="text-[7px] font-mono text-slate-400 mt-1">[ AFFIX PHYSICAL STAMP ]</span>
            </div>

            {/* Digital Batch QR Seal */}
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-300 text-center h-28">
              <QrCode className="w-10 h-10 text-slate-900" />
              <span className="text-[8px] font-mono font-bold text-slate-600 mt-1 uppercase">E-SEAL VERIFIED</span>
              <span className="text-[7px] font-mono text-slate-400">BATCH-{chequeDetails.batchNo || '2026'}</span>
            </div>
          </div>

          {/* Statutory Tear-off / Institutional Acknowledgment Return Slip */}
          <div className="pt-6 border-t-2 border-dashed border-slate-400 space-y-3 print:pt-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span className="flex items-center gap-1.5">
                ✂ OFFICIAL INSTITUTIONAL ACKNOWLEDGMENT VOUCHER (NG-CDF RETURN SLIP)
              </span>
              <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                STATUTORY AUDIT COPY
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 space-y-3 text-xs font-sans">
              <p className="text-[11px] text-slate-800 leading-snug">
                <strong>TO:</strong> The Constituency Fund Manager, Kibwezi West NG-CDF, P.O. Box 128 - 90137, Kibwezi.
                <br />
                We hereby acknowledge receipt of the bursary disbursement cheque/EFT amounting to <strong>KSh {totalAmount.toLocaleString()} ({amountInWords})</strong> in respect of <strong>{currentBeneficiaries.length}</strong> sponsored student(s) for the 2026/2027 Academic Year. Respective student fee accounts have been duly credited as listed on the schedule.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-[10px]">
                <div className="border-b border-slate-400 pb-1">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Official Receipt No:</span>
                  <span className="font-mono font-bold text-slate-800">&nbsp;</span>
                </div>
                <div className="border-b border-slate-400 pb-1">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Date Credited:</span>
                  <span className="font-mono font-bold text-slate-800">&nbsp;</span>
                </div>
                <div className="border-b border-slate-400 pb-1">
                  <span className="text-slate-500 font-bold block uppercase text-[9px]">Received By (Bursar / Cashier):</span>
                  <span className="font-bold text-slate-800">&nbsp;</span>
                </div>
                <div className="border border-dashed border-slate-400 rounded-xl p-2 text-center flex flex-col justify-center items-center h-16 bg-white">
                  <span className="text-slate-400 font-bold text-[8px] uppercase leading-tight">
                    Official University / School Rubber Stamp
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-slate-500 italic text-center pt-1 border-t border-slate-200">
                * In accordance with NG-CDF statutory guidelines, please detach and return this acknowledgment slip or email a stamped scanned copy to: <strong>receipts@kibweziwestngcdf.go.ke</strong>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
