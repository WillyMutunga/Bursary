import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { FileText, ShieldCheck, CheckCircle2, Download, Printer, ArrowLeft, ExternalLink } from 'lucide-react';
import API_BASE_URL from '../../config';

export default function DocumentViewPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  let rawPath = searchParams.get('path') || location.pathname || '';
  const docTitle = searchParams.get('title') || 'Verification Attachment Document';
  const refNumber = searchParams.get('ref') || 'CDF/BURS/2026';

  const filename = rawPath ? rawPath.split('/').pop() : 'verification_document.pdf';

  // Construct direct API streaming URL
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const downloadApiUrl = `${baseUrl}/api/v1/applications/download_doc/?path=${encodeURIComponent(rawPath)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans p-4 sm:p-8 print:bg-white print:p-0 print:text-black">
      
      {/* Top Header Navigation (Hidden on print) */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center pb-6 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="NG-CDF Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5 border border-[#DAA520]" />
          <div>
            <span className="text-white font-extrabold text-xs tracking-wide block">NG-CDF Kibwezi West</span>
            <span className="text-[#DAA520] font-bold text-[10px] uppercase block tracking-wider">Official Document Verification</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
          >
            <Printer size={16} /> Print / Save Document
          </button>
          <Link 
            to="/" 
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft size={16} /> Portal Home
          </Link>
        </div>
      </header>

      {/* Main Document Inspection Sheet */}
      <main className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center my-6 print:my-0 print:max-w-none">
        <div className="bg-slate-900 border-2 border-[#DAA520] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4 print:border-slate-300">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Coat of Arms" className="h-12 w-auto object-contain bg-white p-1 rounded-full border border-amber-400" />
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/20 text-[#DAA520] rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/30 print:bg-slate-100 print:text-black">
                  <ShieldCheck size={12} /> REPUBLIC OF KENYA • NG-CDF KIBWEZI WEST
                </span>
                <h1 className="text-lg font-black uppercase text-white print:text-black tracking-wider mt-0.5">{docTitle}</h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-400 block font-semibold">Verification Reference</span>
              <span className="font-mono font-black text-amber-400 text-sm print:text-black">{refNumber}</span>
            </div>
          </div>

          {/* Embedded PDF / Document Viewer Frame */}
          <div className="w-full h-[650px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
            <object 
              data={downloadApiUrl} 
              type="application/pdf"
              className="w-full h-full border-none bg-white"
            >
              <iframe 
                src={`${downloadApiUrl}#toolbar=1`}
                title={docTitle}
                className="w-full h-full border-none bg-white"
              />
            </object>
          </div>

          {/* Document Details & Download Action */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Filename Record</span>
              <span className="font-mono font-bold text-slate-300 print:text-black break-all">{filename}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={13} /> VALIDATED & AUDITED
              </span>
            </div>
            <div className="sm:text-right print:hidden">
              <a
                href={downloadApiUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-lg transition shadow-md hover:scale-105"
              >
                <Download size={14} /> Download File Attachment
              </a>
            </div>
          </div>

          {/* Official Stamp Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2 print:border-slate-300 print:text-slate-600">
            <span>National Government Constituencies Development Fund (NG-CDF) • Kibwezi West Constituency</span>
            <span>Generated on: {new Date().toLocaleString()}</span>
          </div>

        </div>
      </main>

    </div>
  );
}
