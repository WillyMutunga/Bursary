import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, FileText, Eye, ZoomIn, ZoomOut, ShieldAlert } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, docUrl, docTitle = 'Uploaded Verification Document' }) {
  const [zoom, setZoom] = useState(100);
  const [imgError, setImgError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setIframeError(false);
    setZoom(100);
  }, [docUrl]);

  if (!isOpen || !docUrl) return null;

  // Extension check (handles query parameters and hashes)
  const cleanUrl = docUrl.split('?')[0].split('#')[0];
  const isImage = !imgError && (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cleanUrl) || !/\.(pdf|doc|docx)$/i.test(cleanUrl));
  const isPdf = /\.pdf$/i.test(cleanUrl);

  const handleOpenNewTab = () => {
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden isolate">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <FileText size={18} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-white truncate">{docTitle}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{docUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {isImage && !imgError && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 mr-2">
                <button 
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))} 
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700" 
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-[11px] font-mono px-2 text-slate-300">{zoom}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))} 
                  className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700" 
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-lg transition shadow-md hover:scale-105 active:scale-95"
            >
              <ExternalLink size={14} /> <span>Open in New Tab</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Preview Area */}
        <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center relative">
          
          {/* 1. Try Image Rendering First */}
          {isImage && !imgError && (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
              <img 
                src={docUrl} 
                alt={docTitle} 
                onError={() => setImgError(true)}
                style={{ width: `${zoom}%`, maxWidth: 'none' }}
                className="max-w-full h-auto rounded-lg shadow-xl object-contain transition-all duration-200 bg-white" 
              />
            </div>
          )}

          {/* 2. Try PDF / Embedded Object */}
          {(!isImage || imgError) && !iframeError && (
            <object 
              data={docUrl} 
              type="application/pdf"
              className="w-full h-full rounded-lg border border-slate-300 bg-white shadow-inner"
              onError={() => setIframeError(true)}
            >
              <iframe 
                src={`${docUrl}#toolbar=1`}
                title={docTitle}
                className="w-full h-full rounded-lg border border-slate-300 bg-white shadow-inner"
              />
            </object>
          )}

          {/* 3. Fallback Display Card (Always accessible if browser blocks frame embedding) */}
          {(imgError && iframeError) && (
            <div className="w-full max-w-xl p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-5 shadow-xl my-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-lg">{docTitle}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This document is stored securely on the server. Your browser's security frame policy requires opening it directly in a dedicated tab.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleOpenNewTab}
                  className="px-8 py-3.5 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2.5 mx-auto hover:scale-105 active:scale-95"
                >
                  <ExternalLink size={18} /> Open & Download Document
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 font-semibold flex-shrink-0 gap-2">
          <span>NG-CDF Kibwezi West Security Document Viewer</span>
          <button 
            onClick={handleOpenNewTab}
            className="text-[#0F6B38] hover:underline font-bold flex items-center gap-1"
          >
            Trouble viewing? Click here to open document directly <ExternalLink size={12} />
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
