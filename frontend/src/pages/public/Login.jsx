import API_BASE_URL from '../../config';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, LogIn, Shield, CheckCircle2, ArrowLeft, Award, FileCheck, Building } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      try {
        response = await fetch(API_BASE_URL + '/api/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (err) {
        response = null;
      }

      if (!response || !response.ok) {
        response = await fetch(API_BASE_URL + '/v1/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error('Invalid National ID or password');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Fetch user role
      let userRes;
      try {
        userRes = await fetch(API_BASE_URL + '/api/v1/auth/me/', {
            headers: { 'Authorization': `Bearer ${data.access}` }
        });
      } catch (e) {
        userRes = await fetch(API_BASE_URL + '/v1/auth/me/', {
            headers: { 'Authorization': `Bearer ${data.access}` }
        });
      }
      if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.role === 'ADMINISTRATOR' || userData.role === 'SUPER_ADMINISTRATOR' || userData.role === 'ADMIN') {
              navigate('/admin');
          } else if (userData.role === 'COMMITTEE') {
              navigate('/committee');
          } else if (userData.role === 'FINANCE') {
              navigate('/finance');
          } else {
              navigate('/applicant');
          }
      } else {
          navigate('/applicant');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white font-sans">
      
      {/* 1. Top Kenya Flag Accent Bar */}
      <div className="h-2 w-full flex sticky top-0 z-50">
        <div className="h-full w-1/3 bg-[#121820]"></div>
        <div className="h-full w-1/3 bg-[#C8102E]"></div>
        <div className="h-full w-1/3 bg-[#0F6B38]"></div>
      </div>

      {/* 2. Full-Bleed Edge-to-Edge Split Hero & Portal Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Side: Edge-to-Edge Government Hero Background */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#092B19] via-[#0F4A2C] to-[#041A0E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Graphic Watermark Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#DAA520]/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Bar inside Left Panel */}
          <div className="relative z-10 flex justify-between items-center">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full border border-white/15 backdrop-blur-md">
              <ArrowLeft size={15} /> Return to Home
            </Link>
            <span className="px-3 py-1 bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              Official Government Portal
            </span>
          </div>

          {/* Main Left Hero Copy */}
          <div className="relative z-10 space-y-8 my-auto py-10">
            
            {/* Logo Emblem & Header */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-2xl border-2 border-[#DAA520] flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="NG-CDF Kibwezi West Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase leading-tight">REPUBLIC OF KENYA</h1>
                <h2 className="text-lg font-extrabold text-[#DAA520] uppercase tracking-wide mt-0.5">NG-CDF Kibwezi West Constituency</h2>
                <p className="text-xs text-emerald-400 font-semibold italic mt-0.5">"Maendeleo kwa wote"</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                National Bursary Management & Sponsorship System
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium max-w-xl">
                The official digital portal for secondary school, college, and university bursary application processing, direct bank disbursements, and verifiable award letters.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1">
                <Shield className="text-[#DAA520]" size={20} />
                <span className="text-xs font-bold text-white block">Automatic Score Breakdown</span>
                <span className="text-[10px] text-slate-300 block">Transparent 100-point criteria</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1">
                <Building className="text-emerald-400" size={20} />
                <span className="text-xs font-bold text-white block">Bank EFT Manifests</span>
                <span className="text-[10px] text-slate-300 block">Direct institution payments</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-1">
                <FileCheck className="text-[#DAA520]" size={20} />
                <span className="text-xs font-bold text-white block">Award Commitment Letters</span>
                <span className="text-[10px] text-slate-300 block">Printable official certificate</span>
              </div>
            </div>

          </div>

          {/* Left Footer Info */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex justify-between items-center text-xs text-slate-300">
            <span>National Government Constituencies Development Fund</span>
            <span className="text-[#DAA520] font-bold">FY 2026/2027</span>
          </div>

        </div>

        {/* Right Side: Clean Full-Height Login Portal */}
        <div className="lg:col-span-5 bg-slate-50 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-l border-slate-200">
          
          <div className="space-y-8 my-auto max-w-md mx-auto w-full">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F6B38]/10 text-[#0F6B38] rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                <Lock size={13} /> Authentication Gateway
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#121820]">Sign In To Your Account</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Access your Applicant, Committee, Finance or Admin Portal
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-[#C8102E] p-4 rounded-xl text-xs font-bold text-[#9B0B21]">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  National ID / Username
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 border border-slate-300 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B38] font-bold text-[#121820] shadow-sm transition-all"
                    placeholder="Enter National ID Number"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-12 pr-4 py-4 border border-slate-300 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F6B38] font-bold text-[#121820] shadow-sm transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 text-sm font-black rounded-2xl text-white bg-[#0F6B38] hover:bg-[#094724] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F6B38] shadow-xl shadow-emerald-950/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-98"
              >
                <LogIn className="h-5 w-5 text-emerald-200" />
                <span>{isLoading ? 'Authenticating...' : 'Sign In To Portal'}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                <span className="text-slate-600 font-medium">New Student Applicant?</span>
                <Link to="/register" className="font-extrabold text-[#0F6B38] hover:text-[#094724] hover:underline">
                  Register Account Here
                </Link>
              </div>
            </div>

          </div>

          <div className="text-center text-[11px] text-slate-400 font-semibold pt-6">
            Protected by Republic of Kenya National Data Security Standards
          </div>

        </div>

      </div>

      {/* 3. Official Government Footer Bar */}
      <footer className="bg-[#121820] text-slate-400 text-center py-4 text-xs font-medium border-t-2 border-[#DAA520]">
        <p>© 2026 National Government Constituencies Development Fund (NG-CDF) — Kibwezi West Constituency</p>
      </footer>

    </div>
  );
}
