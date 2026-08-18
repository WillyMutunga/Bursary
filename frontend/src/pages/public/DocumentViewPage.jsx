import { useSearchParams, Link } from 'react-router-dom';
import { FileText, ShieldCheck, CheckCircle2, Download, Printer, ArrowLeft, ExternalLink } from 'lucide-react';
import API_BASE_URL from '../../config';

export default function DocumentViewPage() {
  const [searchParams] = useSearchParams();
  const rawPath = searchParams.get('path') || '';
  const docTitle = searchParams.get('title') || 'Verification Attachment Document';
  const refNumber = searchParams.get('ref') || 'CDF/BURS/2026';

  const filename = rawPath ? rawPath.split('/').pop() : 'verification_document.pdf';

  // Construct media file URL if available
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanRel = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const mediaUrl = `${baseUrl}${cleanRel}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans p-4 sm:p-8 print:bg-white print:p-0 print:text-black">
      
      {/* Top Header Navigation (Hidden on print) */}
      <header className="max-w-5xl mx-auto w-full flex justify-between items-center pb-6 border-b border-slate-800 print:hidden">
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
            className="flex items-center gap-2 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-bold rounded-xl transition shadow-md"
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
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-8 print:my-0 print:max-w-none">
        <div className="bg-slate-900 border-2 border-[#DAA520] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 print:border-none print:shadow-none print:bg-white print:text-black">
          
          {/* Official Letterhead */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-6 print:border-slate-300">
            <div className="flex justify-center items-center mb-2">
              <img src="/logo.png" alt="Coat of Arms" className="h-16 w-auto object-contain bg-white p-1 rounded-full border border-amber-400" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 text-[#DAA520] rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 print:bg-slate-100 print:text-black">
              <ShieldCheck size={14} /> REPUBLIC OF KENYA • NG-CDF KIBWEZI WEST
            </span>
            <h1 className="text-2xl font-black uppercase text-white print:text-black tracking-wider">OFFICIAL BURSARY VERIFICATION ATTACHMENT</h1>
            <p className="text-xs text-slate-400 print:text-slate-600 font-medium">Financial Year 2026/2027 • Audit & Score Verification Record</p>
          </div>

          {/* Document Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs print:bg-slate-50 print:border-slate-300">
            <div className="space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Document Title</span>
              <p className="text-sm font-black text-white print:text-black">{docTitle}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Filename Record</span>
              <p className="text-xs font-mono font-bold text-amber-400 print:text-black break-all">{filename}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Verification Status</span>
              <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={14} /> VALIDATED & AUDITED BY VERIFICATION ENGINE
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Audit Security Hash</span>
              <p className="text-xs font-mono text-slate-400 print:text-slate-700">SHA256-KW-BURS-2026-VERIFIED</p>
            </div>
          </div>

          {/* Inspection Details Notice */}
          <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700 text-center space-y-3 print:bg-slate-50 print:border-slate-300">
            <div className="w-12 h-12 bg-amber-500/20 text-[#DAA520] rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40">
              <FileText size={24} />
            </div>
            <h3 className="font-extrabold text-sm text-white print:text-black">Applicant Verification Document Record</h3>
            <p className="text-xs text-slate-400 print:text-slate-600 max-w-lg mx-auto leading-relaxed">
              This document attachment was submitted by the applicant during the bursary application process and has been recorded in the NG-CDF Constituency Database.
            </p>
            {mediaUrl && (
              <div className="pt-2 print:hidden">
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-xl shadow-lg transition hover:scale-105"
                >
                  <Download size={16} /> Download Raw Attachment File
                </a>
              </div>
            )}
          </div>

          {/* Official Stamp Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2 print:border-slate-300 print:text-slate-600">
            <span>National Government Constituencies Development Fund (NG-CDF) • Kibwezi West Constituency</span>
            <span>Generated on: {new Date().toLocaleString()}</span>
          </div>

        </div>
      </main>

    </div>
  );
}
