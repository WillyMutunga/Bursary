import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, QrCode, X, ArrowRight, Shield, Award, Clock, FileText, School, DollarSign, Layers } from 'lucide-react';

export default function StatusTrackerModal({
  isOpen,
  onClose,
  applications = [],
  onOpenAwardModal,
}) {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanQuery = query.toLowerCase().trim();
    const found = applications.find(
      (a) =>
        a.application_no?.toLowerCase().trim() === cleanQuery ||
        String(a.national_id || '').trim() === cleanQuery ||
        String(a.admission_no || '').toLowerCase().trim() === cleanQuery
    );
    setSearchResult(found || null);
  };

  const getStageIndex = (stage) => {
    switch (stage) {
      case 'submitted': return 1;
      case 'verification_passed':
      case 'field_verified':
      case 'committee_review': return 2;
      case 'approved':
      case 'awarded': return 3;
      case 'paid': return 4;
      case 'reconciled': return 5;
      default: return 2;
    }
  };

  const currentStageNum = searchResult ? getStageIndex(searchResult.stage) : 1;

  const stages = [
    { num: 1, title: 'Submitted', desc: 'Dossier Logged' },
    { num: 2, title: 'Verified', desc: 'IPRS & Field Check' },
    { num: 3, title: 'Approved', desc: 'Committee Awarded' },
    { num: 4, title: 'Disbursed', desc: 'Bank EFT Dispatch' },
    { num: 5, title: 'Reconciled', desc: 'School Received' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0B6B3A] flex items-center justify-center mb-2 shadow-sm">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-[#0F172A]">Public Bursary Status Tracker</h3>
          <p className="text-slate-500 text-xs">
            Enter your official Application Reference Number (e.g. <code>CDF/BURS/2026/000245</code>) or National ID number.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. CDF/BURS/2026/000245 or 41354126"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-300 focus:border-[#0B6B3A] rounded-xl font-mono text-sm font-bold outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> QUERY CONSTITUENCY BURSARY DATABASE
          </button>
        </form>

        {hasSearched && (
          <div className="space-y-4 animate-in fade-in">
            {searchResult ? (
              <div className="p-5 bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-300 rounded-3xl space-y-4 shadow-sm">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-200 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold block">{searchResult.application_no}</span>
                    <h4 className="text-base font-black text-slate-900 uppercase">{searchResult.full_name}</h4>
                  </div>
                  <span className="bg-[#0B6B3A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase self-start">
                    {searchResult.stage ? searchResult.stage.replace('_', ' ') : 'UNDER VERIFICATION'}
                  </span>
                </div>

                {/* 5-Gate Live Status Progression Bar */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    LIVE PROCESSING ROADMAP (GATE {currentStageNum} OF 5)
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {stages.map((st) => {
                      const isComplete = currentStageNum >= st.num;
                      const isCurrent = currentStageNum === st.num;

                      return (
                        <div key={st.num} className="space-y-1">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              isComplete ? 'bg-[#0B6B3A]' : 'bg-slate-200'
                            } ${isCurrent ? 'ring-2 ring-emerald-400' : ''}`}
                          />
                          <p className={`text-[10px] font-bold truncate ${isComplete ? 'text-emerald-950 font-black' : 'text-slate-400'}`}>
                            {st.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Particulars Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Institution:</span>
                    <strong className="text-slate-800 truncate block">{searchResult.institution?.name || searchResult.institution_name || 'University of Nairobi'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Ward:</span>
                    <strong className="text-slate-800 block">{searchResult.ward?.name || 'Emali / Mulala'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Approved Award:</span>
                    <strong className="font-mono text-[#0B6B3A] text-sm font-black block">
                      KSh {Number(searchResult.approved_amount || searchResult.recommended_amount || 20000).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">IPRS Check:</span>
                    <strong className="text-emerald-700 font-bold block">VERIFIED ✓</strong>
                  </div>
                </div>

                {/* Digital QR Award Letter Trigger */}
                {(searchResult.stage === 'approved' || searchResult.stage === 'paid' || searchResult.stage === 'awarded') && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAwardModal(searchResult);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#0B6B3A] to-[#084e2a] hover:from-[#0d8246] hover:to-[#0B6B3A] text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-[#D4A72C]" /> VIEW & DOWNLOAD OFFICIAL AWARD LETTER
                  </button>
                )}
              </div>
            ) : (
              <div className="p-5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">No Matching Record Found</h4>
                  <p className="text-[11px] text-rose-700">
                    No bursary application matches "{query}". Please verify your National ID number or Application Number.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
