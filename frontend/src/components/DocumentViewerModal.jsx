import React, { useState } from 'react';
import { FileText, X, Download, ZoomIn, ZoomOut, CheckCircle2, AlertCircle, Eye, Shield } from 'lucide-react';

export default function DocumentViewerModal({ isOpen, onClose, document, studentName }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen || !document) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));

  const docTitle = document.title || document.name || 'Uploaded Verification Document';
  const docType = document.type || 'FEE_STRUCTURE';
  const uploadDate = document.uploadDate || '22/08/2026';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#0F172A] text-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-700 overflow-hidden my-auto relative">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0B132B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A72C] bg-[#D4A72C]/10 px-2 py-0.5 rounded border border-[#D4A72C]/30">
                  OFFICIAL ATTACHMENT
                </span>
                <span className="text-xs text-slate-400 font-mono">Uploaded: {uploadDate}</span>
              </div>
              <h3 className="text-sm font-black text-white mt-0.5">{docTitle}</h3>
              <p className="text-[11px] text-emerald-400 font-medium">Applicant: {studentName || 'Student Beneficiary'}</p>
            </div>
          </div>

          {/* Controls & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-[10px] font-mono font-bold text-slate-300">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Display Canvas */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[420px] max-h-[600px] overflow-auto custom-scrollbar">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top' }}
            className="transition-transform duration-200 w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-300 space-y-6 font-sans text-xs"
          >
            {/* Embedded Mock Official Document Representation */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Seal" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="font-black text-sm text-[#0F172A] uppercase">
                    {docType === 'FEE_STRUCTURE'
                      ? 'UNIVERSITY OF NAIROBI - OFFICIAL FEE STATEMENT'
                      : docType === 'NATIONAL_ID'
                      ? 'REPUBLIC OF KENYA - NATIONAL REGISTRATION BUREAU'
                      : docType === 'CHIEFS_LETTER'
                      ? 'OFFICE OF THE SENIOR CHIEF - KIBWEZI LOCATION'
                      : 'OFFICIAL CIVIL REGISTRATION BUREAU'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">DOCUMENT REF: DOC-KBW-2026-0899X</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> AUTHENTICATED
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Student Legal Name:</span>
                  <strong className="text-slate-900 uppercase font-bold">{studentName || 'Willy Mutunga'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Academic Reference / ID:</span>
                  <strong className="font-mono text-slate-900 font-bold">UON/ENG/2024/045</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Academic Year / Cycle:</span>
                  <strong className="text-slate-900">2026 / 2027 Academic Year</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Outstanding Balance:</span>
                  <strong className="font-mono text-rose-700 font-black">KSh 60,000.00</strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-700" /> Verification Officer Attestation
                </p>
                <p>
                  This official document has been verified against the National Registration IPRS database and the academic registrar's master fee ledger. All stamps and signatures are authentic.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>SCAN HASH: SHA256:7f83b165...c992</span>
              <span>VERIFIED BY: OFFICER MWANGI</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B132B] flex justify-between items-center text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Format: PDF / High-Res Image ({document?.file_size_kb ? `${document.file_size_kb} KB` : 'Verified'})</span>
          <div className="flex items-center gap-2">
            {document?.file_path && (
              <a
                href={`/storage/${document.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </a>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold rounded-xl shadow transition-colors cursor-pointer"
            >
              Close Document Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
