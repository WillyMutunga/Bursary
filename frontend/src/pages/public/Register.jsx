import API_BASE_URL from '../../config';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowLeft, Shield, CheckCircle2, UserPlus, KeyRound } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    email: '',
    password: '',
    ward: '',
    location: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const safeFetchJson = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
      return { ok: res.ok && data !== null, status: res.status, data, rawText: text };
    } catch (e) {
      return { ok: false, status: 0, data: null, error: e.message };
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        username: formData.idNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        national_id: formData.idNumber,
        email: formData.email || `${formData.idNumber}@student.go.ke`,
        phone_number: formData.phone,
        password: formData.password,
        role: 'APPLICANT'
      };

      let result = await safeFetchJson(API_BASE_URL + '/api/v1/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!result.ok && (result.status === 404 || result.status === 0)) {
        result = await safeFetchJson('/v1/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!result.ok) {
        const errData = result.data || {};
        if (errData.username || errData.national_id) {
          throw new Error(`National ID ${formData.idNumber} is already registered. Please click 'Existing Applicant? Sign In' to log in.`);
        } else if (errData.phone_number) {
          throw new Error(`Phone number ${formData.phone} is already registered. Please sign in or use another phone number.`);
        } else if (errData.email) {
          throw new Error(`Email address ${formData.email} is already registered. Please use another email address or sign in.`);
        } else if (errData.password) {
          throw new Error(`Password error: ${Array.isArray(errData.password) ? errData.password.join(' ') : errData.password}`);
        } else if (errData.error) {
          throw new Error(errData.error);
        } else if (errData.detail) {
          throw new Error(errData.detail);
        } else {
          const detailStr = typeof errData === 'object' && Object.keys(errData).length > 0
            ? Object.entries(errData).map(([k, v]) => `${k.replace('_', ' ')}: ${Array.isArray(v) ? v.join(' ') : v}`).join(' | ')
            : 'Registration issue encountered. Please verify your details or sign in if already registered.';
          throw new Error(detailStr);
        }
      }

      // Request OTP
      try {
        await safeFetchJson(API_BASE_URL + '/api/v1/auth/otp/request/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: formData.phone, email: formData.email })
        });
      } catch (e) {
        // Optional OTP failure ignored
      }

      setShowOtp(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let res = await safeFetchJson(API_BASE_URL + '/api/v1/auth/otp/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: formData.phone, otp: otp })
      });

      if (!res.ok && (res.status === 404 || res.status === 0)) {
        res = await safeFetchJson('/v1/auth/otp/verify/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone_number: formData.phone, otp: otp })
        });
      }

      if (!res.ok) {
        throw new Error('Invalid OTP code. Please enter 482913 or check the code sent to your email.');
      }

      // Proceed to login
      navigate('/login');
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

      {/* 2. Full-Bleed Edge-to-Edge Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Side: Edge-to-Edge Government Hero Background */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#092B19] via-[#0F4A2C] to-[#041A0E] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#DAA520]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-center">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-full border border-white/15 backdrop-blur-md">
              <ArrowLeft size={15} /> Return to Home
            </Link>
            <span className="px-3 py-1 bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              Applicant Registration
            </span>
          </div>

          <div className="relative z-10 space-y-8 my-auto py-10">
            
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
                Create Your Applicant Account
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium max-w-xl">
                Register with your National ID number to access the bursary application portal, submit document uploads, and track your sponsorship status.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-[#DAA520] shrink-0" />
                <span>Instant 2-factor OTP Verification</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-[#DAA520] shrink-0" />
                <span>Single Account for All Secondary & Tertiary Applications</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-[#DAA520] shrink-0" />
                <span>Direct Status Alerts & In-App Notifications</span>
              </div>
            </div>

          </div>

          <div className="relative z-10 pt-6 border-t border-white/15 flex justify-between items-center text-xs text-slate-300">
            <span>National Government Constituencies Development Fund</span>
            <span className="text-[#DAA520] font-bold">FY 2026/2027</span>
          </div>

        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-6 bg-slate-50 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-l border-slate-200">
          
          <div className="space-y-6 my-auto max-w-xl mx-auto w-full">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0F6B38]/10 text-[#0F6B38] rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <UserPlus size={13} /> New Student Registration
              </div>
              <h3 className="text-2xl font-black text-[#121820]">
                {showOtp ? 'Phone OTP Verification' : 'Student Profile Registration'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {showOtp ? 'Enter the 6-digit OTP code sent to your phone (Dev Mock: 482913)' : 'Provide your official details as they appear on your National ID'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-[#C8102E] p-4 rounded-xl text-xs font-bold text-[#9B0B21] leading-relaxed">
                {error}
              </div>
            )}

            {!showOtp ? (
              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User size={16} /></div>
                      <input type="text" required placeholder="Willy" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User size={16} /></div>
                      <input type="text" required placeholder="Mutunga" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">National ID Number</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock size={16} /></div>
                      <input type="text" required placeholder="e.g. 41354126" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Phone size={16} /></div>
                      <input type="tel" required placeholder="0712345678" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Official Email Address</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail size={16} /></div>
                    <input type="email" required placeholder="student@gmail.com" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Sub-County Ward</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><MapPin size={16} /></div>
                      <select 
                        required 
                        value={formData.ward}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none"
                        onChange={e => setFormData({...formData, ward: e.target.value})}
                      >
                        <option value="">-- Select Ward --</option>
                        <option value="Emali/Mulala">Emali/Mulala</option>
                        <option value="Makindu">Makindu</option>
                        <option value="Nguu/Masumba">Nguu/Masumba</option>
                        <option value="Nguumo">Nguumo</option>
                        <option value="Kikumbulyu North">Kikumbulyu North</option>
                        <option value="Kikumbulyu South">Kikumbulyu South</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Polling Station</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><MapPin size={16} /></div>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Emali Primary School" 
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" 
                        onChange={e => setFormData({...formData, pollingStation: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Lock size={16} /></div>
                    <input type="password" required placeholder="••••••••" className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl text-xs bg-white font-bold text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 text-sm font-black rounded-2xl text-white bg-[#0F6B38] hover:bg-[#094724] focus:outline-none focus:ring-2 focus:ring-[#0F6B38] shadow-xl transition-all"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Account Registration'}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Enter 6-Digit OTP Code</label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><KeyRound size={20} /></div>
                    <input type="text" required placeholder="482913" className="block w-full pl-12 pr-4 py-4 border border-slate-300 rounded-2xl text-lg font-mono font-black text-center text-[#121820] focus:ring-2 focus:ring-[#0F6B38] focus:outline-none tracking-widest" value={otp} onChange={e => setOtp(e.target.value)} />
                  </div>
                  <p className="text-[11px] text-[#0F6B38] font-bold mt-2 text-center">Development Mock OTP: 482913</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-4 text-sm font-black rounded-2xl text-white bg-[#0F6B38] hover:bg-[#094724] shadow-xl transition-all"
                >
                  {isLoading ? 'Verifying Code...' : 'Verify OTP & Proceed to Login'}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-200">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Already have a bursary account?</span>
                <Link to="/login" className="font-black text-[#0F6B38] hover:underline">
                  Sign In Here
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
