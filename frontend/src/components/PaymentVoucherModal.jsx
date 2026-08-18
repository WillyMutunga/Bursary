import { Printer, X, ShieldCheck, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function PaymentVoucherModal({ isOpen, onClose, applications = [], user = null }) {
  if (!isOpen) return null;

  const totalAmount = applications.reduce((sum, app) => sum + parseFloat(app.awarded_amount || 0), 0);
  const voucherNo = `PV/KW/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Number to Words Converter (for KSh)
  const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
      if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + inWords(n % 1000000) : '');
      return n.toString();
    };

    return inWords(Math.floor(num)) + ' Kenya Shillings Only';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="text-[#DAA520]" size={20} />
            <h2 className="font-extrabold text-sm tracking-wide">Public Finance Payment Voucher & Cheque Register</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Payment Voucher Sheet */}
        <div className="p-8 space-y-6 overflow-y-auto font-sans print:p-6 print:overflow-visible">
          
          {/* Official Letterhead */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <div className="flex justify-center items-center gap-4 mb-2">
              <img src="/logo.png" alt="Republic of Kenya Coat of Arms" className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">REPUBLIC OF KENYA</h1>
            <h2 className="text-sm font-bold text-slate-800 uppercase">NATIONAL GOVERNMENT CONSTITUENCIES DEVELOPMENT FUND (NG-CDF)</h2>
            <h3 className="text-xs font-extrabold text-[#0F6B38] uppercase tracking-widest">KIBWEZI WEST CONSTITUENCY</h3>
            <p className="text-[11px] text-slate-500 font-semibold">P.O. BOX 112 - 90138, MAKINDU / KIBWEZI | EMAIL: info@skysoftsystems.co.ke</p>
          </div>

          {/* Title & Metadata Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">Form FO-26 | PFM Act Compliant</span>
              <h2 className="text-lg font-black text-slate-900 mt-1">PAYMENT VOUCHER & DISBURSEMENT SCHEDULE</h2>
              <p className="text-xs text-slate-600 font-medium">Bursary & Educational Support Allocation • FY 2026/2027</p>
            </div>
            <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
              <p className="text-xs font-extrabold text-slate-900">Voucher No: <span className="font-mono text-red-600">{voucherNo}</span></p>
              <p className="text-xs font-bold text-slate-600">Date: {dateStr}</p>
              <p className="text-[11px] font-semibold text-slate-500">Vote Head: 4-311-002 (Bursary Fund)</p>
            </div>
          </div>

          {/* Cheque Register / Beneficiary Schedule Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Beneficiary Schedule & Disbursement Breakdown</h3>
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-extrabold uppercase text-[10px]">
                    <th className="p-2.5 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-2.5 border-r border-slate-300">Ref No.</th>
                    <th className="p-2.5 border-r border-slate-300">Applicant / Student Name</th>
                    <th className="p-2.5 border-r border-slate-300">Admission No</th>
                    <th className="p-2.5 border-r border-slate-300">Institution & Bank Details</th>
                    <th className="p-2.5 text-right font-black">Amount (KSh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {applications.map((app, idx) => (
                    <tr key={app.id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">{app.reference_number || `KW/2026/00${idx+1}`}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">
                        {app.applicant_name || `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim() || 'Student Beneficiary'}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-mono">{app.admission_number || 'KU/2024/001'}</td>
                      <td className="p-2.5 border-r border-slate-200">
                        <span className="font-bold text-slate-900">{app.institution_name}</span>
                        <div className="text-[10px] text-slate-500">Bank: KCB / Co-op Bank • Branch: Makindu</div>
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-slate-900">
                        KSh {parseFloat(app.awarded_amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400 italic">No approved bursary entries selected for this voucher schedule.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-900 font-black text-slate-900">
                    <td colSpan="5" className="p-3 text-right uppercase tracking-wider text-xs">Total Net Payable Disbursement:</td>
                    <td className="p-3 text-right text-sm text-[#0F6B38]">
                      KSh {totalAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Amount in Words Box */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Amount Authorized in Words:</span>
            <p className="text-xs font-black text-slate-900 italic">"{numberToWords(totalAmount)}"</p>
          </div>

          {/* Public Finance Verification & Signatures Block */}
          <div className="space-y-3 border-t border-slate-300 pt-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Public Finance Approvals & Authorization Signatures</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              
              {/* Prepared By */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                <span className="text-[10px] font-black text-slate-500 uppercase block">1. PREPARED BY (FINANCE OFFICER)</span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Name: <span className="font-normal">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Finance Officer'}</span></p>
                  <p className="font-bold text-slate-900">Signature: <span className="border-b border-dashed border-slate-400 inline-block w-28"></span></p>
                  <p className="font-bold text-slate-900">Date: <span className="font-normal">{dateStr}</span></p>
                </div>
              </div>

              {/* Verified By */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                <span className="text-[10px] font-black text-slate-500 uppercase block">2. CHECKED BY (FUND ACCOUNT MANAGER)</span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Name: <span className="border-b border-dashed border-slate-400 inline-block w-28"></span></p>
                  <p className="font-bold text-slate-900">Signature: <span className="border-b border-dashed border-slate-400 inline-block w-28"></span></p>
                  <p className="font-bold text-slate-900">Date: <span className="border-b border-dashed border-slate-400 inline-block w-20"></span></p>
                </div>
              </div>

              {/* Approved By */}
              <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                <span className="text-[10px] font-black text-slate-500 uppercase block">3. APPROVED BY (NG-CDF CHAIRMAN)</span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Name: <span className="border-b border-dashed border-slate-400 inline-block w-28"></span></p>
                  <p className="font-bold text-slate-900">Signature: <span className="border-b border-dashed border-slate-400 inline-block w-28"></span></p>
                  <p className="font-bold text-slate-900">Date: <span className="border-b border-dashed border-slate-400 inline-block w-20"></span></p>
                </div>
              </div>

            </div>
          </div>

          {/* Official Stamp & Security Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 gap-2">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck size={14} className="text-[#0F6B38]" /> Official NG-CDF Kibwezi West Bursary System Document
            </span>
            <span>Generated on: {new Date().toLocaleString()}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
