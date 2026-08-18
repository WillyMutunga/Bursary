import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, FileText, Eye, ZoomIn, ZoomOut } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, docUrl, docTitle = 'Uploaded Verification Document' }) {
  const [zoom, setZoom] = useState(100);
  if (!isOpen || !docUrl) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(docUrl);
  const isPdf = /\.pdf(\?.*)?$/i.test(docUrl);

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
            <div>
              <h3 className="font-extrabold text-sm text-white">{docTitle}</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{docUrl}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isImage && (
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F6B38] hover:bg-[#094724] text-white text-xs font-bold rounded-lg transition"
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
          {isImage ? (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
              <img 
                src={docUrl} 
                alt={docTitle} 
                style={{ width: `${zoom}%`, maxWidth: 'none' }}
                className="max-w-full h-auto rounded-lg shadow-lg object-contain transition-all duration-200" 
              />
            </div>
          ) : isPdf ? (
            <iframe 
              src={`${docUrl}#toolbar=1`}
              title={docTitle}
              className="w-full h-full rounded-lg border border-slate-300 bg-white shadow-inner"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center space-y-4">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                <Eye size={36} />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="font-bold text-slate-900 text-base">{docTitle}</h4>
                <p className="text-xs text-slate-500">Document preview mode. Click below to view or download the full document directly.</p>
              </div>
              <button
                onClick={handleOpenNewTab}
                className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Download size={16} /> Download / Open Document
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-semibold flex-shrink-0">
          NG-CDF Kibwezi West Security Document Viewer
        </div>

      </div>
    </div>,
    document.body
  );
}
