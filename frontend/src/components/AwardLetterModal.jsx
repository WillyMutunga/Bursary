import API_BASE_URL from '../config';
import { useState, useEffect } from 'react';
import { X, Printer, Award, ShieldCheck, Users, FileText } from 'lucide-react';

export default function AwardLetterModal({ application, user, onClose }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('institutional'); // 'institutional' or 'individual'

  useEffect(() => {
    if (!application || !application.institution_name) return;

    const fetchBeneficiaries = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const instName = encodeURIComponent(application.institution_name);
        const res = await fetch(`${API_BASE_URL}/api/v1/applications/institutional_beneficiaries/?institution_name=${instName}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBeneficiaries(data);
        }
      } catch (err) {
        console.error("Failed to fetch institutional beneficiaries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [application]);

  if (!application) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-award-letter');
    if (!element) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>NG-CDF_Kibwezi_West_Award_Letter_${application.reference_number || 'OFFICIAL'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body onload="window.print(); window.close();" class="bg-white p-8">
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const studentName = user ? (user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.username) : 'Valued Applicant';
  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const awardedAmount = parseFloat(application.awarded_amount || 0).toLocaleString();

  // Total sum for institution
  const totalInstitutionalAward = beneficiaries.reduce((acc, curr) => acc + parseFloat(curr.awarded_amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <Award className="text-[#DAA520]" size={22} />
            <div>
              <h3 className="font-bold text-base">Consolidated Institutional Bursary Award Letter</h3>
              <p className="text-[11px] text-emerald-400 font-medium">NG-CDF Kibwezi West Constituency</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs">
              <button 
                onClick={() => setViewMode('institutional')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${viewMode === 'institutional' ? 'bg-[#0F6B38] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Users size={14} /> Institutional Award Letter
              </button>
              <button 
                onClick={() => setViewMode('individual')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${viewMode === 'individual' ? 'bg-[#0F6B38] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <FileText size={14} /> Individual Summary
              </button>
            </div>

            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#DAA520] hover:bg-[#b88a18] text-[#121820] text-xs font-black rounded-xl transition-all shadow-md"
            >
              <Printer size={16} /> Direct PDF Download
            </button>
            
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-serif text-slate-800 space-y-8 bg-white print:p-6" id="printable-award-letter">
          
          {/* Government Coat of Arms & Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
            <img src="/logo.png" alt="NG-CDF Kibwezi West Logo" className="h-20 mx-auto object-contain mb-2" />
            <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900">Republic of Kenya</h1>
            <h2 className="text-lg font-bold uppercase text-slate-800">National Government Constituencies Development Fund (NG-CDF)</h2>
            <h3 className="text-sm font-bold uppercase text-[#0F6B38] tracking-wider">Kibwezi West Constituency</h3>
            <p className="text-xs uppercase tracking-wider text-slate-600 font-sans font-semibold">Constituency Bursary Management Committee</p>
          </div>

          {/* Reference & Metadata Grid */}
          <div className="flex justify-between items-start text-xs font-sans font-semibold text-slate-600 border-b border-slate-200 pb-4">
            <div>
              <p>REF NO: <span className="font-mono text-slate-900 font-bold text-sm">{application.reference_number || 'CDF/BURS/2026/OFFICIAL'}</span></p>
              <p>DATE OF ISSUE: <span className="text-slate-900 font-bold">{issueDate}</span></p>
            </div>
            <div className="text-right">
              <p>STATUS: <span className="text-emerald-700 font-bold uppercase">{application.status}</span></p>
              <p>FINANCIAL YEAR: <span className="text-slate-900 font-bold">2026/2027</span></p>
            </div>
          </div>

          {/* Letter Addressee */}
          <div className="font-sans text-sm space-y-1">
            <p className="font-bold text-slate-900">TO THE VICE CHANCELLOR / PRINCIPAL / BURSAR,</p>
            <p className="font-extrabold text-[#0F6B38] text-base">{application.institution_name || 'Educational Institution'}</p>
            <p className="text-slate-600">Re: Institutional Bursary Sponsorship Disbursement & Award List</p>
          </div>

          {viewMode === 'institutional' ? (
            /* Institutional Consolidated Letter View */
            <div className="space-y-6">
              
              <div className="text-center font-sans">
                <h3 className="text-base font-bold text-slate-900 uppercase underline tracking-wide">
                  CONFIRMATION OF BURSARY SPONSORSHIP DISBURSEMENT FOR {application.institution_name?.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500 mt-1">FY 2026/2027 Constituency Allocation Beneficiaries List</p>
              </div>

              <p className="font-serif text-sm leading-relaxed text-slate-800 text-justify">
                The National Government Constituencies Development Fund (NG-CDF) Bursary Management Committee for Kibwezi West Constituency is pleased to notify your office that tuition fee bursary grants have been awarded to the following <strong className="font-sans font-bold">{beneficiaries.length} student(s)</strong> enrolled in your institution:
              </p>

              {/* Official Beneficiaries Schedule Table */}
              <div className="font-sans border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm my-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                      <th className="p-3 border-r border-slate-700 w-12 text-center">#</th>
                      <th className="p-3 border-r border-slate-700">Full Student Name</th>
                      <th className="p-3 border-r border-slate-700">Registration / Admission Number</th>
                      <th className="p-3 text-right">Amount Allocated (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {beneficiaries.map((b, idx) => (
                      <tr key={b.id || idx} className={b.id === application.id ? "bg-amber-50 font-bold" : "hover:bg-slate-50"}>
                        <td className="p-3 border-r border-slate-200 font-mono text-center">{idx + 1}</td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900">
                          {b.applicant_full_name}
                          {b.id === application.id && <span className="ml-2 text-[10px] text-[#0F6B38] font-extrabold uppercase">(Your Profile)</span>}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-mono font-semibold text-slate-800">{b.admission_number || 'N/A'}</td>
                        <td className="p-3 text-right font-mono font-bold text-[#0F6B38]">
                          KSh {parseFloat(b.awarded_amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {beneficiaries.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-slate-400 italic">
                          No additional institutional beneficiaries recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-900 text-xs">
                      <td colSpan="3" className="p-3.5 uppercase text-right">Total Institutional Bursary Award Allocation:</td>
                      <td className="p-3.5 text-right font-mono text-[#0F6B38] text-sm">
                        KSh {totalInstitutionalAward.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="font-serif text-sm leading-relaxed text-slate-800 text-justify">
                Please credit the respective student accounts accordingly upon receipt of the official bank EFT manifest. The bursary awards are non-transferable and strictly intended for tuition fee balance clearance.
              </p>

            </div>
          ) : (
            /* Individual Award Summary View */
            <div className="space-y-6">
              
              <div className="text-center font-sans">
                <h3 className="text-base font-bold text-slate-900 uppercase underline tracking-wide">
                  INDIVIDUAL BURSARY AWARD COMMITMENT FOR {studentName.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-600 font-bold mt-1.5">
                  Admission No: <span className="font-mono text-slate-900">{application.admission_number || 'N/A'}</span> • Institution: <span className="text-[#0F6B38]">{application.institution_name}</span>
                </p>
              </div>

              <div className="space-y-4 font-serif text-sm leading-relaxed text-slate-800 text-justify">
                <p>
                  The National Government Constituencies Development Fund (NG-CDF) Bursary Management Committee for Kibwezi West Constituency is pleased to confirm that 
                  <strong className="font-sans font-bold"> {studentName} </strong> (Admission No: <span className="font-mono font-bold">{application.admission_number || 'N/A'}</span>) has been officially awarded an individual tuition bursary of:
                </p>
                
                <div className="bg-slate-50 border-2 border-slate-900 p-6 text-center rounded-2xl font-sans my-6 shadow-sm">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Approved Sponsorship Amount</span>
                  <span className="text-4xl font-black text-[#0F6B38]">KSh {awardedAmount}</span>
                  <span className="text-xs text-slate-600 block mt-1">(Kenya Shillings {awardedAmount} Only)</span>
                </div>

                <p>
                  This financial award is committed directly towards your tuition fees at <strong className="font-sans font-bold">{application.institution_name}</strong> and will be disbursed directly via electronic bank transfer.
                </p>
              </div>

            </div>
          )}

          {/* Official Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 font-sans text-xs">
            <div className="space-y-4">
              <div className="h-10 border-b border-slate-400 w-48 flex items-end">
                <span className="text-slate-400 italic text-[10px]">Signed Electronically</span>
              </div>
              <div>
                <p className="font-bold text-slate-900">Fund Account Manager</p>
                <p className="text-slate-500">NG-CDF Kibwezi West Committee</p>
              </div>
            </div>

            <div className="space-y-4 text-right">
              <div className="w-20 h-20 ml-auto border-2 border-dashed border-[#0F6B38] rounded-full flex flex-col items-center justify-center p-1 text-[9px] font-bold text-[#0F6B38] uppercase text-center leading-tight">
                <ShieldCheck size={20} className="mb-0.5" />
                OFFICIAL SEAL VERIFIED
              </div>
              <div>
                <p className="font-bold text-slate-900">Constituency Secretary</p>
                <p className="text-slate-500">Bursary Management Board</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
