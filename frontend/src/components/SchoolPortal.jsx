import React, { useState } from 'react';
import { School, CheckCircle2, Shield, Search, Check, AlertCircle, Building2, User } from 'lucide-react';

export default function SchoolPortal({
  applications = [],
  onConfirmStudent,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmForm, setConfirmForm] = useState({
    is_enrolled: true,
    confirmed_admission_no: 'F16/14290/2023',
    confirmed_fee_balance: 50000,
    comments: 'Student is active in Year 3 Semester 1. Fee statement matches academic records.',
  });

  const students = applications.filter((a) =>
    a.institution_id === 1 ||
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.admission_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    onConfirmStudent(selectedStudent.id, confirmForm);
    setSelectedStudent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-700 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              INSTITUTION PORTAL
            </span>
            <span className="text-xs text-slate-500 font-medium">University of Nairobi (UoN) Registrar</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">School Verification & Confirmation Portal</h2>
          <p className="text-xs text-slate-500">Restricted portal for institutions to confirm student admission, active enrollment, and fee balance.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <School className="w-4 h-4 text-indigo-700" /> Authenticated School Account
          </span>
        </div>
      </div>

      {/* Privacy Notice Banner (from prompt Section 24) */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Restricted Privacy Boundary:</p>
          <p className="text-blue-800 mt-0.5">
            Educational institutions can only view and verify academic particulars (Student Name, Admission No, Course, Enrollment Status, and Fee Balance). Sensitive family and financial information is strictly sequestered.
          </p>
        </div>
      </div>

      {/* Student List & Verification Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Student Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">Enrolled Constituency Bursary Candidates</span>
            <span className="text-slate-500">{students.length} Candidates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Admission Number</th>
                  <th className="p-3.5">Programme / Course</th>
                  <th className="p-3.5">Declared Fee Balance</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const isSelected = selectedStudent && selectedStudent.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setConfirmForm({
                          is_enrolled: true,
                          confirmed_admission_no: s.admission_no || 'F16/14290/2023',
                          confirmed_fee_balance: s.fee_balance || 50000,
                          comments: `Student ${s.full_name} actively enrolled in official semester registers.`,
                        });
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{s.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.application_no}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{s.admission_no}</td>
                      <td className="p-3.5 text-slate-600">{s.course_name}</td>
                      <td className="p-3.5 font-bold text-rose-600">
                        KSh {Number(s.fee_balance || 50000).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(s);
                          }}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded text-[11px] border border-indigo-200"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal / Panel on Right */}
        <div className="lg:col-span-4 space-y-4">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded uppercase">
                  CONFIRMATION DESK
                </span>
                <h3 className="text-base font-black text-[#0F172A] mt-1">{selectedStudent.full_name}</h3>
                <p className="text-slate-500 font-mono">{selectedStudent.admission_no}</p>
              </div>

              <form onSubmit={handleConfirmSubmit} className="space-y-3.5">
                <div>
                  <label className="flex items-center gap-2 font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={confirmForm.is_enrolled}
                      onChange={(e) => setConfirmForm({ ...confirmForm, is_enrolled: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Confirm Student is Currently Enrolled & Active
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirmed Admission Number</label>
                  <input
                    type="text"
                    value={confirmForm.confirmed_admission_no}
                    onChange={(e) => setConfirmForm({ ...confirmForm, confirmed_admission_no: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Fee Balance (KSh)</label>
                  <input
                    type="number"
                    value={confirmForm.confirmed_fee_balance}
                    onChange={(e) => setConfirmForm({ ...confirmForm, confirmed_fee_balance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-rose-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">School Registrar Verification Comments</label>
                  <textarea
                    rows="3"
                    value={confirmForm.comments}
                    onChange={(e) => setConfirmForm({ ...confirmForm, comments: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm"
                  >
                    Submit Verification ✓
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select a student from the list to confirm admission and verify school fee balance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
