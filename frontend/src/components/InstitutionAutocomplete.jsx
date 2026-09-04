import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Check, PlusCircle, MapPin, ChevronDown } from 'lucide-react';
import { KENYA_INSTITUTIONS_REGISTRY } from '../mockData';

export default function InstitutionAutocomplete({
  value = '',
  educationLevel = '',
  onChange,
  disabled = false,
  placeholder = 'Type to search or select accredited institution in Kenya...'
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter institutions based on query and education level preference
  const filtered = React.useMemo(() => {
    const q = (query || '').toLowerCase().trim();
    let list = KENYA_INSTITUTIONS_REGISTRY || [];

    if (q) {
      list = list.filter((inst) => {
        const nameMatch = inst.name.toLowerCase().includes(q);
        const codeMatch = inst.code?.toLowerCase().includes(q);
        const countyMatch = inst.county?.toLowerCase().includes(q);
        const campusMatch = inst.campus?.toLowerCase().includes(q);
        return nameMatch || codeMatch || countyMatch || campusMatch;
      });
    }

    // Sort matching items: if educationLevel matches, boost them to the top
    if (educationLevel) {
      const targetType = educationLevel === 'secondary' ? 'secondary'
        : educationLevel === 'university' ? 'university'
        : educationLevel === 'special_needs' ? 'special_needs'
        : 'college_tvet';

      list = [...list].sort((a, b) => {
        const aMatch = a.type === targetType ? -1 : 1;
        const bMatch = b.type === targetType ? -1 : 1;
        return aMatch - bMatch;
      });
    }

    return list.slice(0, 15);
  }, [query, educationLevel]);

  const handleSelect = (inst) => {
    setQuery(inst.name);
    setIsOpen(false);
    if (onChange) {
      onChange(inst.name, inst);
    }
  };

  const handleCustomInput = (customName) => {
    setQuery(customName);
    setIsOpen(false);
    if (onChange) {
      onChange(customName, {
        name: customName,
        type: educationLevel || 'university',
        county: 'Kenya',
        address: '',
        campus: '',
      });
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'university':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'college_tvet':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'secondary':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'special_needs':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'university': return 'University';
      case 'college_tvet': return 'TVET / KMTC';
      case 'secondary': return 'Secondary';
      case 'special_needs': return 'Special Needs';
      default: return 'Institution';
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (onChange) {
              onChange(e.target.value, null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full p-2.5 pl-9 pr-8 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-[#0B6B3A] focus:border-transparent outline-none transition-all"
          required
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs animate-fade-in">
          {filtered.length > 0 ? (
            <div>
              <div className="px-3 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Accredited Institutions in Kenya</span>
                <span className="text-[#0B6B3A] font-semibold">{filtered.length} Suggestions</span>
              </div>
              {filtered.map((inst, index) => {
                const isSelected = inst.name.toLowerCase() === (value || '').toLowerCase();
                return (
                  <div
                    key={inst.code || index}
                    onClick={() => handleSelect(inst)}
                    className={`px-3 py-2.5 hover:bg-emerald-50/80 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                      isSelected ? 'bg-emerald-50/90 font-bold' : ''
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900">{inst.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getBadgeColor(inst.type)}`}>
                          {getTypeLabel(inst.type)}
                        </span>
                      </div>
                      {inst.campus && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{inst.campus} {inst.county ? `(${inst.county} County)` : ''}</span>
                        </p>
                      )}
                      {inst.address && (
                        <p className="text-[9px] text-slate-400 font-mono">
                          📮 {inst.address}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Option to Add Custom / Unlisted Institution */}
          {query.trim() && (
            <div
              onClick={() => handleCustomInput(query.trim())}
              className="p-3 bg-amber-50 hover:bg-amber-100/80 cursor-pointer transition-colors flex items-center gap-2 text-amber-900"
            >
              <PlusCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-[11px]">
                  Use Custom / Unlisted School: <span className="underline italic">"{query.trim()}"</span>
                </p>
                <p className="text-[10px] text-amber-800/80">
                  Select this if your institution is not in the registry above.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}