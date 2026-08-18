import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, FileText, Eye, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, docUrl, docTitle = 'Uploaded Verification Document' }) {
  const [zoom, setZoom] = useState(100);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setZoom(100);
  }, [docUrl]);

  if (!isOpen || !docUrl) return null;

  const handleOpenNewTab = () => {
    window.open(docUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden isolate">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg flex-shrink-0">
              <FileText size={18} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-white truncate">{docTitle}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{docUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {!imgError && (
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
        <div className="flex-1 bg-slate-100 overflow-auto p-4 flex flex-col items-center justify-center relative">
          
          {!imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-auto p-2">
              <img 
                src={docUrl} 
                alt={docTitle} 
                onError={() => setImgError(true)}
                style={{ width: `${zoom}%`, maxWidth: 'none' }}
                className="max-w-full max-h-[75vh] h-auto rounded-xl shadow-2xl object-contain transition-all duration-200 bg-white border border-slate-200" 
              />
            </div>
          ) : (
            <div className="w-full max-w-xl p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-6 shadow-xl my-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-[#0F6B38] rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-inner">
                <FileText size={40} />
              </div>
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-emerald-100 text-[#0F6B38] rounded-full text-[10px] font-black uppercase tracking-wider">
                  Verified Document Attachment
                </span>
                <h4 className="font-black text-slate-900 text-xl">{docTitle}</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This document (PDF or official scan) is ready for committee review. Click below to open and inspect the full document in a dedicated high-resolution browser tab.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleOpenNewTab}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2.5 hover:scale-105 active:scale-95"
                >
                  <ExternalLink size={18} /> Open & Inspect Document
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
            Click here to open document directly in new tab <ExternalLink size={12} />
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
