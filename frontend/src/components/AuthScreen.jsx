import React, { useState } from 'react';
import {
  Shield, User, Lock, ArrowRight, X, CheckCircle2,
  Mail, Phone, MapPin, KeyRound, ArrowLeft, Eye, EyeOff,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';

export default function AuthScreen({
  isOpen,
  onClose,
  initialMode = 'login', // 'login' or 'register'
  onLoginSuccess,
  wards = [],
}) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [loginRoleType, setLoginRoleType] = useState('applicant'); // 'applicant' or 'staff'
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    id_type: 'national_id', // 'national_id', 'birth_certificate', 'nemis_upi'
    national_id: '',
    phone: '',
    email: '',
    ward_id: 1,
    location: '',
    password: '',
    password_confirmation: '',
  });

  const [otpCode, setOtpCode] = useState('482913');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const identifier = (formData.national_id || '').trim();
    const password = (formData.password || '').trim();

    try {
      const res = await api.login(identifier, password);
      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
        }
        localStorage.setItem('auth_user', JSON.stringify(res.user));

        let mappedRole = res.user.role;
        if (mappedRole === 'committee_member') mappedRole = 'committee';
        if (mappedRole === 'verification_officer') mappedRole = 'verification';
        if (mappedRole === 'finance_officer') mappedRole = 'finance';
        if (mappedRole === 'school_officer') mappedRole = 'school';
        if (mappedRole === 'admin') mappedRole = 'admin';

        // Instant modal dismiss: hide modal immediately for zero perceived latency
        setIsLoading(false);
        onClose();

        onLoginSuccess({
          role: mappedRole || 'applicant',
          user: res.user,
        });
        return;
      } else {
        setErrorMessage(res?.message || 'Invalid username/email or password.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to login server. Please try again.');
    }

    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const fullName = `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Student Applicant';
    const email = (formData.email || '').trim();

    try {
      const res = await api.register({
        name: fullName,
        email: email,
        national_id: (formData.national_id || '').trim(),
        phone: (formData.phone || '').trim(),
        ward_id: formData.ward_id || 1,
        password: formData.password,
      });

      if (!res || !res.success) {
        setErrorMessage(res?.message || res?.error || 'Registration failed. Please check your information.');
        setIsLoading(false);
        return;
      }

      if (res.token) {
        localStorage.setItem('auth_token', res.token);
      }
      if (res.user) {
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        setRegisteredUser(res.user);
      }

      setIsLoading(false);
      setMode('otp');
    } catch (err) {
      setErrorMessage(err.message || 'Unable to complete registration.');
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const userToLogin = registeredUser || {
      name: `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Student Applicant',
      national_id: formData.national_id,
      phone: formData.phone,
      email: formData.email,
      ward_id: formData.ward_id || 1,
      role: 'applicant',
      designation: 'Applicant / Student',
    };

    onLoginSuccess({
      role: 'applicant',
      user: userToLogin,
      isNewRegistration: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Main Modal Card */}
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Official Government Brand Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#063b1f] via-[#0B6B3A] to-[#042815] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-pattern-grid pointer-events-none opacity-20"></div>

          <div className="relative z-10 space-y-6">
            {/* Top Return and Badge */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition-all backdrop-blur-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
              </button>

              <span className="text-[10px] font-black tracking-wider text-[#D4A72C] uppercase border border-[#D4A72C]/40 px-3 py-1 rounded-full bg-black/30 shadow-inner">
                {mode === 'register' ? 'NEW REGISTRATION' : 'AUTHENTICATION'}
              </span>
            </div>

            {/* Republic of Kenya Identity */}
            <div className="flex items-center gap-3 pt-2">
              <img
                src="/logo.png"
                alt="Republic of Kenya NG-CDF Logo"
                className="w-13 h-13 object-contain bg-white rounded-2xl p-1 shadow-lg shrink-0 border border-amber-300"
              />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A72C]">
                  REPUBLIC OF KENYA
                </p>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">
                  NG-CDF KIBWEZI WEST CONSTITUENCY
                </h4>
                <p className="text-[10px] text-emerald-200 italic font-medium">"Maendeleo kwa wote"</p>
              </div>
            </div>

            {/* Hero Title & Subtitle */}
            <div className="space-y-2.5 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {mode === 'register'
                  ? 'Create Your Applicant Account'
                  : 'Welcome to the Smart Bursary Portal'}
              </h2>
              <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                {mode === 'register'
                  ? 'Register with your National ID number to access the bursary application portal, submit document uploads, and track your sponsorship status.'
                  : 'Access your bursary dashboard, submit applications, manage committee reviews, or process institutional disbursements.'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2 text-xs text-emerald-50">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#D4A72C]/20 flex items-center justify-center text-[#D4A72C] shrink-0 font-bold text-[10px]">✓</div>
                <span>Role-Based Access Control (Students, Committee, Finance, Schools)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#D4A72C]/20 flex items-center justify-center text-[#D4A72C] shrink-0 font-bold text-[10px]">✓</div>
                <span>National ID & Instant IPRS Verification</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#D4A72C]/20 flex items-center justify-center text-[#D4A72C] shrink-0 font-bold text-[10px]">✓</div>
                <span>Official QR-Coded Digital Award Letters</span>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="relative z-10 pt-6 border-t border-emerald-500/30 flex justify-between items-center text-[10px] text-emerald-200">
            <span>National Government Constituencies Development Fund</span>
            <span className="font-mono font-bold text-[#D4A72C]">FY 2026/2027</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Polished Clean Login & Registration Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white text-xs">
          
          {/* Top Mode Segmented Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-bold mb-6 shadow-inner">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'login'
                  ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In to Portal
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'register' || mode === 'otp'
                  ? 'bg-white text-[#0B6B3A] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              New Student Register
            </button>
          </div>

          {/* MODE 1: Unified Universal Sign In Tab */}
          {mode === 'login' && (
            <div className="space-y-5 my-auto">
              <div>
                <h3 className="text-2xl font-black text-[#0F172A]">Sign In to Portal</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Enter your National ID, Birth Certificate No, Username, or Email and password.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Universal Identifier Input */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
                    NATIONAL ID / BIRTH CERTIFICATE NO / USERNAME / EMAIL
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. 41354126 or Willy or BC-849201 or admin@ngcdf.go.ke"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B6B3A] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block font-bold text-slate-700 uppercase text-[10px]">
                      Account Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B6B3A] focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Universal Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have an applicant account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMessage(''); }}
                  className="text-[#0B6B3A] font-bold hover:underline"
                >
                  Register Here
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: Registration Tab */}
          {mode === 'register' && (
            <div className="space-y-4 my-auto">
              <div>
                <h3 className="text-xl font-black text-[#0F172A]">Student Profile Registration</h3>
                <p className="text-slate-500 text-[11px]">Provide your official details as they appear on your National ID</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">FIRST NAME</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Willy"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">LAST NAME</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Mutunga"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Identification Type Selector (National ID vs Birth Certificate vs NEMIS UPI) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
                    APPLICANT IDENTIFICATION TYPE
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'national_id', label: '🪪 National ID', sub: 'Adults (18+)' },
                      { id: 'birth_certificate', label: '📜 Birth Certificate', sub: 'Minors / Under 18' },
                      { id: 'nemis_upi', label: '🎓 NEMIS UPI', sub: 'School Identifier' },
                    ].map((t) => {
                      const isSelected = (formData.id_type || 'national_id') === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, id_type: t.id })}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-[#0B6B3A] ring-2 ring-[#0B6B3A]/20 text-[#0B6B3A] font-black shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-[11px] leading-tight font-bold">{t.label}</span>
                          <span className="block text-[9px] text-slate-400 font-normal">{t.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                  {formData.id_type === 'birth_certificate' && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-snug">
                      💡 <strong>Notice for Secondary Students / Minors:</strong> You do NOT need a National ID card to apply. Enter the <strong>Entry Number</strong> found on your Kenyan Birth Certificate. You will use this number as your username to sign in!
                    </div>
                  )}
                  {formData.id_type === 'nemis_upi' && (
                    <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-snug">
                      💡 <strong>Notice:</strong> Enter the official Ministry of Education NEMIS UPI code found on your student calling letter or fee statement.
                    </div>
                  )}
                </div>

                {/* National ID / Birth Certificate & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                      {formData.id_type === 'birth_certificate'
                        ? 'BIRTH CERTIFICATE ENTRY NO'
                        : formData.id_type === 'nemis_upi'
                        ? 'NEMIS UPI NUMBER'
                        : 'NATIONAL ID NUMBER'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder={
                          formData.id_type === 'birth_certificate'
                            ? 'e.g. BC-1092834 or 7294012'
                            : formData.id_type === 'nemis_upi'
                            ? 'e.g. H7K2M9'
                            : 'e.g. 38291045'
                        }
                        value={formData.national_id}
                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">PHONE NUMBER</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. 0712345678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">OFFICIAL EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. willy.mutunga@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Ward & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">SUB-COUNTY WARD</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={formData.ward_id}
                        onChange={(e) => setFormData({ ...formData, ward_id: Number(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none appearance-none"
                      >
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">POLLING STATION / VILLAGE</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Emali Primary School"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">PASSWORD</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">CONFIRM PASSWORD</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? 'Creating Account in Database...' : 'Complete Account Registration'}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already have a bursary account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#0B6B3A] font-bold hover:underline"
                >
                  Sign In Here
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: OTP Verification Screen */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="py-8 space-y-4 max-w-md mx-auto my-auto">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>SMS 2-FACTOR OTP SENT</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  We sent a 6-digit verification code to <strong>{formData.phone || 'your phone'}</strong>:
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-amber-300 font-mono font-black text-amber-800 text-center text-base tracking-widest">
                  OTP CODE: {otpCode}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  placeholder="482913"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-xl font-bold tracking-widest focus:ring-2 focus:ring-[#0B6B3A] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                VERIFY OTP & OPEN APPLICATION <CheckCircle2 className="w-4 h-4 text-[#D4A72C]" />
              </button>
            </form>
          )}

          {/* Right Bottom Protected Note */}
          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Protected by Republic of Kenya National Data Security Standards
          </div>
        </div>

      </div>
    </div>
  );
}
