import API_BASE_URL from '../config';
import React, { useState, useEffect } from 'react';
import { Building2, Users } from 'lucide-react';

export default function AnalyticsCharts() {
  const [data, setData] = useState({
    total_applications: 0,
    active_institutions_count: 0,
    institution_data: [],
    vulnerability_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(API_BASE_URL + '/api/v1/applications/analytics/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Database Analytics Engine</span>
          <h3 className="text-xl font-extrabold mt-0.5">Bursary Fund Distribution Analytics</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">Submitted Applications</span>
            <span className="text-base font-bold text-emerald-400">{data.total_applications} Applicants</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <span className="text-slate-400 block">Active Institutions</span>
            <span className="text-base font-bold text-amber-400">{data.active_institutions_count} Schools</span>
          </div>
        </div>
      </div>

      {/* Grid: Bar Chart & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Institution Distribution Bar Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-purple-600" />
              <h4 className="font-bold text-navy">Top Fund Allocation by Institution</h4>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {data.institution_data.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-navy font-bold">{item.name}</span>
                  <span className="text-slate-500">KSh {parseFloat(item.amount || 0).toLocaleString()} ({item.count} students)</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {data.institution_data.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No institution distribution data found in database.</p>
            )}
          </div>
        </div>

        {/* Vulnerability Demographics Pie/Donut Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-emerald-600" />
              <h4 className="font-bold text-navy">Applicant Vulnerability Demographics</h4>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            {data.vulnerability_data.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                    <span className="text-slate-800 font-semibold">{item.category}</span>
                  </div>
                  <span className="font-bold text-navy">{item.count} Cases ({item.percent}%)</span>
                </div>
                {/* Visual Progress Segment */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, item.percent * 2)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {data.vulnerability_data.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No vulnerability demographics data found in database.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
