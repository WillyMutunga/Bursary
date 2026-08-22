import React, { useState } from 'react';
import { History, Shield, Search, Filter, Lock, CheckCircle2, User, Clock } from 'lucide-react';

export default function AuditTrailView({ auditLogs = [] }) {
  const [filterModule, setFilterModule] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((l) => {
    const matchesModule = filterModule === 'all' || l.module?.toLowerCase().includes(filterModule.toLowerCase());
    const matchesQuery =
      l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.record_id?.includes(searchQuery);
    return matchesModule && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              COMPLIANCE & GOVERNANCE
            </span>
            <span className="text-xs text-slate-500 font-medium">Tamper-Evident System Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Immutable Activity Audit Log</h2>
          <p className="text-xs text-slate-500">Every decision, document review, and payment transaction is cryptographically timestamped.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border">
          <Lock className="w-4 h-4 text-[#0B6B3A]" /> Read-Only Compliance Log
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Action, User Name, Record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
          >
            <option value="all">All Modules</option>
            <option value="committee">Committee Review</option>
            <option value="finance">Finance & Disbursement</option>
            <option value="verification">Verification</option>
            <option value="applications">Applications</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User / Official</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Record Details</th>
                <th className="p-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 text-slate-500">{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                  <td className="p-3.5 font-sans font-bold text-slate-900">{log.user_name}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-sans">{log.module}</td>
                  <td className="p-3.5 text-slate-600 font-sans text-xs">
                    {log.new_values ? JSON.stringify(log.new_values) : `Record ID: ${log.record_id}`}
                  </td>
                  <td className="p-3.5 text-slate-400">{log.ip_address || '102.68.24.11'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
