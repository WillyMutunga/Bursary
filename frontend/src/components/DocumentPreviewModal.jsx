import API_BASE_URL from '../config';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, FileText } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, docUrl, docTitle = 'Uploaded Verification Document' }) {
  if (!isOpen || !docUrl) return null;

  // Resolve absolute URL
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const fullUrl = docUrl.startsWith('http://') || docUrl.startsWith('https://')
    ? docUrl
    : `${baseUrl}${docUrl.startsWith('/') ? docUrl : `/${docUrl}`}`;

  const handleOpenNewTab = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden isolate">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-white truncate">{docTitle}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{fullUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-lg transition shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ExternalLink size={14} /> <span>Open in New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Preview Area - Direct Iframe Embed */}
        <div className="flex-1 bg-slate-100 overflow-hidden p-2 flex flex-col items-center justify-center relative">
          <iframe 
            src={fullUrl}
            title={docTitle}
            className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-inner"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 font-semibold flex-shrink-0 gap-2">
          <span>NG-CDF Kibwezi West Security Document Viewer</span>
          <button 
            onClick={handleOpenNewTab}
            className="text-[#0F6B38] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            Direct Document Endpoint: {fullUrl} <ExternalLink size={12} />
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
