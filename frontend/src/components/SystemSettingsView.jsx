import React, { useState } from 'react';
import { Settings, Sliders, Shield, Save, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function SystemSettingsView({
  settings = {},
  onSaveSettings,
}) {
  const [weights, setWeights] = useState({
    financial_need: 25,
    vulnerability: 20,
    fee_burden: 20,
    education_need: 15,
    household: 10,
    previous_support: 10,
  });

  const [generalConfig, setGeneralConfig] = useState({
    cycle_name: '2026/2027 Academic Financial Year',
    total_budget: 30000000,
    min_score_threshold: 50,
    iprs_provider: 'IPRS_SECURE_GATEWAY_V2',
    ocr_confidence_threshold: 90,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert(`The sum of scoring weights must equal 100%. Current total: ${totalWeight}%`);
      return;
    }
    if (onSaveSettings) {
      onSaveSettings({ weights, generalConfig });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              ADMIN CONFIGURATION
            </span>
            <span className="text-xs text-slate-500 font-medium">Scoring Weights & System Governance</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">System Settings & Scoring Engine Config</h2>
          <p className="text-xs text-slate-500">Fine-tune the 100-point algorithmic scoring weights, API integrations, and budget allocations.</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-lg border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-[#0B6B3A]" /> Settings Updated Successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* 1. Algorithmic 100-Point Scoring Weights Configurator */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#0B6B3A]" /> 100-Point Scoring Weight Configuration
              </h3>
              <p className="text-xs text-slate-500">Determines the weight distribution of the explainable assessment model.</p>
            </div>
            <span className={`px-3 py-1 rounded-full font-black text-xs ${
              totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              Total: {totalWeight} / 100%
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>1. Financial Need (Income & Economic Hardship)</span>
                <span className="text-[#0B6B3A]">{weights.financial_need}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.financial_need}
                onChange={(e) => setWeights({ ...weights, financial_need: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>2. Vulnerability (Orphan Status / Single Parent / PWD)</span>
                <span className="text-[#0B6B3A]">{weights.vulnerability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.vulnerability}
                onChange={(e) => setWeights({ ...weights, vulnerability: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>3. Fee Burden (Outstanding Balance Ratio)</span>
                <span className="text-[#0B6B3A]">{weights.fee_burden}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.fee_burden}
                onChange={(e) => setWeights({ ...weights, fee_burden: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>4. Education Need (Course Level & STEM/TVET Priority)</span>
                <span className="text-[#0B6B3A]">{weights.education_need}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.education_need}
                onChange={(e) => setWeights({ ...weights, education_need: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>5. Household Circumstances (Family Size & School Siblings)</span>
                <span className="text-[#0B6B3A]">{weights.household}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.household}
                onChange={(e) => setWeights({ ...weights, household: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>6. Previous Support & Academic Consistency (GPA)</span>
                <span className="text-[#0B6B3A]">{weights.previous_support}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights.previous_support}
                onChange={(e) => setWeights({ ...weights, previous_support: Number(e.target.value) })}
                className="w-full accent-[#0B6B3A]"
              />
            </div>
          </div>
        </div>

        {/* 2. General Constituency Config */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2 pb-4 border-b border-slate-100">
              <Settings className="w-5 h-5 text-slate-700" /> Constituency Cycle Parameters
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Active Cycle Name</label>
              <input
                type="text"
                value={generalConfig.cycle_name}
                onChange={(e) => setGeneralConfig({ ...generalConfig, cycle_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Constituency Budget (KSh)</label>
              <input
                type="number"
                value={generalConfig.total_budget}
                onChange={(e) => setGeneralConfig({ ...generalConfig, total_budget: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-[#0B6B3A]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Qualifying Score Threshold (Points)</label>
              <input
                type="number"
                value={generalConfig.min_score_threshold}
                onChange={(e) => setGeneralConfig({ ...generalConfig, min_score_threshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">OCR Match Confidence Threshold (%)</label>
              <input
                type="number"
                value={generalConfig.ocr_confidence_threshold}
                onChange={(e) => setGeneralConfig({ ...generalConfig, ocr_confidence_threshold: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-3 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#D4A72C]" /> Save & Apply Engine Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
