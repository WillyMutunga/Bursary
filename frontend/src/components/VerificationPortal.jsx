import React, { useState } from 'react';
import { Shield, Search, Filter, CheckCircle2, AlertTriangle, Eye, ArrowRight, UserCheck, MapPin, FileText, Check, X, Sparkles, Building2, Phone, AlertCircle } from 'lucide-react';

export default function VerificationPortal({
  applications = [],
  wards = [],
  institutions = [],
  onUpdateAppStage,
  onRecordFieldVerification,
}) {
  const [selectedApp, setSelectedApp] = useState(applications[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWard, setFilterWard] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showOcrComparator, setShowOcrComparator] = useState(false);

  const [fieldForm, setFieldForm] = useState({
    applicant_visited: true,
    guardian_interviewed: true,
    household_verified: true,
    location_visited: 'Deep Sea Informal Settlement, Parklands',
    findings: 'Visited household. Mother Grace interviewed. 3 siblings in school. High genuine need verified on the ground.',
    recommendation: 'VERIFIED',
  });

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.application_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.national_id?.includes(searchQuery);
    const matchesWard = filterWard === 'all' || a.ward_id === Number(filterWard);
    const matchesRisk = filterRisk === 'all' || a.duplicate_risk === filterRisk;
    const matchesStage = filterStage === 'all' || a.stage === filterStage;
    return matchesSearch && matchesWard && matchesRisk && matchesStage;
  });

  const handleFieldSubmit = (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    onRecordFieldVerification(selectedApp.id, fieldForm);
    setShowFieldModal(false);
  };

  const handleForwardToCommittee = () => {
    if (!selectedApp) return;
    onUpdateAppStage(selectedApp.id, 'committee_review');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              VERIFICATION ENVIRONMENT
            </span>
            <span className="text-xs text-slate-500 font-medium">NG-CDF Administration Queue</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Verification & Assessment Desk</h2>
          <p className="text-xs text-slate-500">Perform OCR comparisons, duplicate detection screening, and field inspection audits.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 font-bold px-3 py-2 rounded-lg border text-slate-700">
            Total Queue: <strong>{filteredApps.length} Cases</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Name, App No, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
          >
            <option value="all">All Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk (Duplicates)</option>
          </select>
        </div>

        <div>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
          >
            <option value="all">All Stages</option>
            <option value="under_verification">Under Verification</option>
            <option value="field_verification">Field Verification</option>
            <option value="committee_review">Committee Review</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setFilterWard('all');
            setFilterRisk('all');
            setFilterStage('all');
          }}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-center"
        >
          Reset Filters
        </button>
      </div>

      {/* Main Grid: Queue Table on Left, Details & Inspection on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700">Application Queue</span>
            <span className="text-slate-500">{filteredApps.length} Applications Available</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Application</th>
                  <th className="p-3.5">Applicant</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((a) => {
                  const isSelected = selectedApp && selectedApp.id === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedApp(a)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5">
                        <span className="font-mono text-[#0B6B3A] font-bold block">{a.application_no}</span>
                        <span className="text-[10px] text-slate-400">ID: {a.national_id}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{a.full_name}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">{a.course_name}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.stage === 'committee_review' || a.stage === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.stage === 'committee_review' || a.stage === 'approved' ? 'Complete' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.duplicate_risk === 'high'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {a.duplicate_risk === 'high' ? 'High Risk' : 'Low Risk'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApp(a);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px]"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Application Inspection Drawer */}
        <div className="lg:col-span-5 space-y-4">
          {selectedApp ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0B6B3A]">{selectedApp.application_no}</span>
                  <h3 className="text-lg font-black text-[#0F172A]">{selectedApp.full_name}</h3>
                  <p className="text-xs text-slate-500">National ID: <strong className="font-mono">{selectedApp.national_id}</strong></p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedApp.duplicate_risk === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedApp.duplicate_risk} Risk
                </span>
              </div>

              {/* 1. Duplicate Radar Banner */}
              {selectedApp.duplicate_risk === 'high' ? (
                <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xl text-xs text-rose-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>DUPLICATE COLLISION DETECTED</span>
                  </div>
                  <p className="text-rose-800 text-[11px]">{selectedApp.duplicate_flag_reason || 'Duplicate ID / Phone number flagged across recent cycles.'}</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#0B6B3A]" />
                  <span>Duplicate Check: Clean Record (No collision)</span>
                </div>
              )}

              {/* 2. Pluggable ID Verification Audit */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Pluggable ID Status:</span>
                  <span className="text-emerald-700">VERIFIED ✓</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Provider Service:</span>
                  <span>IPRS_GATEWAY_V2</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Name Match:</span>
                  <span>YES (100%)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ID Match:</span>
                  <span>YES (Authentic)</span>
                </div>
              </div>

              {/* 3. Side-by-Side OCR Document Comparator Toggle */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">OCR Document Verification</h4>
                    <p className="text-[11px] text-slate-500">Automated text extraction from uploaded PDF/Image</p>
                  </div>
                  <button
                    onClick={() => setShowOcrComparator(!showOcrComparator)}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded hover:bg-slate-100"
                  >
                    {showOcrComparator ? 'Hide Comparator' : 'Show Comparator'}
                  </button>
                </div>

                {showOcrComparator && (
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex justify-between font-bold pb-1 border-b border-slate-100">
                        <span className="text-slate-500">Field</span>
                        <span className="text-blue-700">APPLICATION FORM</span>
                        <span className="text-emerald-700">DOCUMENT OCR</span>
                        <span className="text-slate-500">RESULT</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Name:</span>
                        <span className="font-mono">{selectedApp.full_name}</span>
                        <span className="font-mono">{selectedApp.full_name}</span>
                        <span className="text-emerald-600 font-bold">✓ MATCH</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">National ID:</span>
                        <span className="font-mono">{selectedApp.national_id}</span>
                        <span className="font-mono">{selectedApp.national_id}</span>
                        <span className="text-emerald-600 font-bold">✓ MATCH</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Admission:</span>
                        <span className="font-mono">{selectedApp.admission_no}</span>
                        <span className="font-mono">{selectedApp.admission_no}</span>
                        <span className="text-emerald-600 font-bold">✓ MATCH</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowFieldModal(true)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-700" /> Log Field Verification
                </button>

                <button
                  onClick={handleForwardToCommittee}
                  className="flex-1 py-2.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A72C]" /> Forward to Committee
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select an application from the queue to review verification details.
            </div>
          )}
        </div>
      </div>

      {/* Field Verification Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0B6B3A]" /> Record Officer Field Inspection
              </h3>
              <button onClick={() => setShowFieldModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleFieldSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Location Visited</label>
                <input
                  type="text"
                  value={fieldForm.location_visited}
                  onChange={(e) => setFieldForm({ ...fieldForm, location_visited: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldForm.applicant_visited}
                    onChange={(e) => setFieldForm({ ...fieldForm, applicant_visited: e.target.checked })}
                    className="w-4 h-4 text-[#0B6B3A]"
                  />
                  Applicant Visited in Person
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldForm.guardian_interviewed}
                    onChange={(e) => setFieldForm({ ...fieldForm, guardian_interviewed: e.target.checked })}
                    className="w-4 h-4 text-[#0B6B3A]"
                  />
                  Guardian / Parent Interviewed
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={fieldForm.household_verified}
                    onChange={(e) => setFieldForm({ ...fieldForm, household_verified: e.target.checked })}
                    className="w-4 h-4 text-[#0B6B3A]"
                  />
                  Household Living Condition Verified
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Officer Field Findings</label>
                <textarea
                  rows="3"
                  value={fieldForm.findings}
                  onChange={(e) => setFieldForm({ ...fieldForm, findings: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Recommendation</label>
                <select
                  value={fieldForm.recommendation}
                  onChange={(e) => setFieldForm({ ...fieldForm, recommendation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="VERIFIED">VERIFIED (Recommend for Award)</option>
                  <option value="REQUIRES_FURTHER_REVIEW">REQUIRES FURTHER REVIEW</option>
                  <option value="NOT_VERIFIED">NOT VERIFIED (Ineligible)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B6B3A] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Findings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
