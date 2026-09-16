import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Building2, Search, MapPin, Check, X, Shield, ArrowRight, Plus } from 'lucide-react';

export default function ConstituencySwitcherModal({ onOpenSuperAdmin }) {
  const {
    currentConstituency,
    availableConstituencies,
    selectConstituency,
    isSwitcherOpen,
    setIsSwitcherOpen
  } = useTenant();

  const [query, setQuery] = useState('');

  if (!isSwitcherOpen) return null;

  const filtered = availableConstituencies.filter((c) => {
    const q = query.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.county && c.county.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.mp_name && c.mp_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B6B3A] to-[#084e2a] p-6 text-white relative">
          <button
            onClick={() => setIsSwitcherOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#D4A72C]" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Select Constituency Portal</h2>
              <p className="text-emerald-100 text-xs">
                Switch to your constituency to view local bursary cycles, wards, and submit applications.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-emerald-200 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by constituency name, county (e.g. Makueni, Nairobi)..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-200/70 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C] focus:bg-white/20 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* List of Constituencies */}
        <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-3 flex-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Registered Constituencies ({filtered.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {filtered.map((c) => {
              const isSelected = c.id === currentConstituency?.id || c.slug === currentConstituency?.slug;
              return (
                <div
                  key={c.id || c.code}
                  onClick={() => selectConstituency(c)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                    isSelected
                      ? 'border-[#0B6B3A] bg-emerald-50/60 ring-2 ring-[#0B6B3A]/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-[#0B6B3A]/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {c.code || 'CDF'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{c.county || 'Kenya'}</span>
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#0B6B3A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="truncate max-w-[160px]">{c.mp_name || 'Hon. MP'}</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded text-[10px]">
                      {c.wards_count !== undefined ? `${c.wards_count} Wards` : (c.wards?.length ? `${c.wards.length} Wards` : 'Active')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-slate-600 text-sm">No constituency matching "{query}" found</p>
              <p className="text-xs text-slate-400 mt-1">
                Constituency administrators can onboard new constituencies through the Super Admin portal.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Multi-Tenant National NG-CDF Governance</span>
          </div>

          {onOpenSuperAdmin && (
            <button
              onClick={() => {
                setIsSwitcherOpen(false);
                onOpenSuperAdmin();
              }}
              className="text-[#0B6B3A] font-bold hover:underline flex items-center gap-1"
            >
              <span>+ Register New Constituency</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
