import React, { useState, useEffect } from 'react';
import {
  Shield, ArrowRight, Search, FileText, CheckCircle,
  GraduationCap, Building2, BookOpen, Award, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2, Clock, DollarSign, MapPin, Phone, Mail, User, Layers
} from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export default function PublicWebsite({
  onOpenAuth,
  onOpenAuthModal,
  onOpenStatusModal,
  statistics = {},
  wards = [],
}) {
  const { currentConstituency, setIsSwitcherOpen, availableConstituencies } = useTenant();
  const triggerAuth = onOpenAuthModal || onOpenAuth || (() => {});
  const [activeCategoryTab, setActiveCategoryTab] = useState('secondary');
  const [searchRef, setSearchRef] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // Application Window Countdown Timer (Closing 30th Sept 2026)
  const [timeLeft, setTimeLeft] = useState({
    days: 38,
    hours: 14,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const deadline = new Date('2026-09-30T23:59:59').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeWards = currentConstituency?.wards?.length ? currentConstituency.wards : wards;

  const categories = {
    secondary: {
      badge: 'Secondary School Sponsorship',
      title: 'Secondary School Sponsorship',
      desc: `Dedicated bursary support for students in Public & Boarding Secondary Schools across ${currentConstituency?.name || 'the constituency'}.`,
      cap: 'KSh 15,000',
    },
    tvet: {
      badge: 'TVET & Vocational Sponsorship',
      title: 'TVET & Technical Colleges',
      desc: 'Financial grants for students enrolled in accredited polytechnics and technical training institutes.',
      cap: 'KSh 20,000',
    },
    undergraduate: {
      badge: 'Undergraduate Degree Sponsorship',
      title: 'University & Higher Learning',
      desc: 'Tuition support for undergraduate and diploma students in recognized Kenyan public and private universities.',
      cap: 'KSh 30,000',
    },
    special: {
      badge: 'Affirmative Action Support',
      title: 'Special Needs & Vulnerable (PWD)',
      desc: 'Special affirmative funding for learners with disabilities, total orphans, and severe medical vulnerability.',
      cap: 'KSh 35,000',
    },
  };

  const currentCat = categories[activeCategoryTab];

  const steps = [
    {
      num: 1,
      title: 'Create Account',
      desc: 'Register using your National ID or Student Admission credentials.',
      color: 'bg-emerald-700 text-white',
    },
    {
      num: 2,
      title: 'Fill Application',
      desc: 'Provide institution info, course, fee balance, and family status details.',
      color: 'bg-emerald-700 text-white',
    },
    {
      num: 3,
      title: 'Upload Documents',
      desc: 'Upload clear files of your ID, official Fee Structure, and Calling letter.',
      color: 'bg-emerald-700 text-white',
    },
    {
      num: 4,
      title: 'Disbursement',
      desc: 'Committee calculates score, approves award, and exports bank manifest.',
      color: 'bg-[#D4A72C] text-[#0F172A]',
    },
  ];

  const faqs = [
    {
      q: `Who is eligible to apply for ${currentConstituency?.name || 'Constituency'} NG-CDF Bursary?`,
      a: `Any resident or registered voter of ${currentConstituency?.name || 'the constituency'} enrolled in an accredited Secondary School, TVET, College, or University with demonstrable fee balance.`,
    },
    {
      q: 'What documents are mandatory for online submission?',
      a: 'A copy of your National ID / Birth Certificate, official stamped Fee Structure, and Admission Letter or Student ID card.',
    },
    {
      q: 'How long does the verification and disbursement process take?',
      a: 'Applications undergo automatic document checking, officer verification, and committee approval. Successful awards are disbursed in batch EFT payments directly to institution bank accounts.',
    },
    {
      q: 'How can I check if my bursary award letter is ready?',
      a: 'Enter your Application Reference Number or National ID into the "Track Application Progress" search box on this page to view your live status and download your QR award certificate.',
    },
  ];

  const handleStatusSearch = (e) => {
    e.preventDefault();
    if (onOpenStatusModal) {
      onOpenStatusModal(searchRef);
    }
  };

  return (
    <div className="space-y-16 pb-20 bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="bg-[#0B6B3A] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-black/20 text-emerald-200 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                OFFICIAL NG-CDF EDUCATION PORTAL
              </div>

              {/* Constituency Switcher Pill */}
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#D4A72C] text-[#0F172A] hover:bg-amber-400 text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md transition-all cursor-pointer"
                title="Click to switch constituency"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentConstituency?.name || 'Kibwezi West'} ({currentConstituency?.county || 'Kenya'})</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Empowering{' '}
              <span className="text-[#D4A72C] underline decoration-[#D4A72C] decoration-4 underline-offset-4">
                {currentConstituency?.name || 'Kibwezi West'}
              </span>{' '}
              Students
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
              National Government Constituencies Development Fund (NG-CDF) Bursary Application & Disbursement Portal for <strong>{currentConstituency?.name}</strong>, {currentConstituency?.county}. Digital, transparent, and direct education funding.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => triggerAuth('register')}
                className="px-6 py-3.5 bg-[#D4A72C] hover:bg-[#b88c1b] text-[#0F172A] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Start Application Wizard <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenStatusModal}
                className="px-5 py-3.5 bg-black/20 hover:bg-black/30 text-white font-bold text-xs rounded-xl border border-emerald-300/40 inline-flex items-center gap-2 transition-all"
              >
                <Search className="w-4 h-4 text-emerald-300" /> Track Application Status
              </button>
            </div>

            {/* Bottom 3 Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-600/50 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#D4A72C]">
                  {activeWards.length || 6}
                </p>
                <p className="text-[11px] text-emerald-200">Active Wards</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
                <p className="text-[11px] text-emerald-200">Digital Merit Model</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#D4A72C]">EFT</p>
                <p className="text-[11px] text-emerald-200">Direct Bank Manifests</p>
              </div>
            </div>
          </div>

          {/* Hero Right Card with Float Animation */}
          <div className="lg:col-span-5 animate-float">
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border-4 border-[#D4A72C] space-y-4 hover-card-lift transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B6B3A] flex items-center justify-center font-black text-base border border-emerald-200 shadow-sm">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A]">FY 2026/2027 Bursary</h3>
                    <p className="text-[11px] text-slate-400 font-bold">{currentConstituency?.name} Constituency</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-beacon"></span> ACTIVE WINDOW
                </span>
              </div>

              {/* Live Application Window Countdown Timer */}
              <div className="p-3.5 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-2xl border border-slate-700 shadow space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#D4A72C] font-black uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> APPLICATION DEADLINE
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">CLOSING 30TH SEP 2026</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-black/40 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-base font-black font-mono text-white block">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase">Days</span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-base font-black font-mono text-[#D4A72C] block">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-base font-black font-mono text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded-xl border border-slate-700">
                    <span className="text-base font-black font-mono text-emerald-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Patron / MP</span>
                  <span className="font-bold text-[#0F172A]">{currentConstituency?.mp_name || 'Hon. MP'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Office Location</span>
                  <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[200px]">
                    {currentConstituency?.office_location || 'NG-CDF Office'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Postal Address</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded">
                    {currentConstituency?.office_postal_address || 'P.O. Box Accredited'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-400 pt-1">
                Official Republic of Kenya NG-CDF Bursary Scheme ({currentConstituency?.name})
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PATRON'S MESSAGE / MP BANNER */}
      {currentConstituency?.mp_name && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-[#D4A72C] flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-md">
              {currentConstituency.mp_photo_url ? (
                <img
                  src={currentConstituency.mp_photo_url}
                  alt={currentConstituency.mp_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>🏛️</span>
              )}
            </div>

            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4A72C] uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <span>Patron's Welcome Message</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {currentConstituency.mp_name}
              </h3>
              <p className="text-xs text-emerald-100/80 leading-relaxed italic">
                "{currentConstituency.mp_message || `Committed to transparent, merit-based and equitable bursary distribution to empower every deserving student in ${currentConstituency.name}.`}"
              </p>
            </div>

            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 shrink-0 transition-colors"
            >
              Switch Constituency →
            </button>
          </div>
        </section>
      )}

      {/* 3. TRACK APPLICATION PROGRESS SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-800 shadow-2xl space-y-4 text-center">
          <div className="inline-block bg-slate-800 text-[#D4A72C] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-slate-700">
            PUBLIC SEARCH ENGINE
          </div>

          <h3 className="text-2xl font-black text-white">Track Application Progress</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Enter your official Reference Number (e.g. CDF/BURS/2026/000245) or National ID to check your bursary status in {currentConstituency?.name}.
          </p>

          <form onSubmit={handleStatusSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter Reference Number or National ID..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="flex-grow px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:ring-2 focus:ring-[#0B6B3A] outline-none"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" /> Check Status
            </button>
          </form>
        </div>
      </section>

      {/* 4. ELECTORAL WARDS BREAKDOWN */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B6B3A]">
            LOCAL REPRESENTATION
          </span>
          <h3 className="text-3xl font-black text-[#0F172A]">
            {currentConstituency?.name} Electoral Wards
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Bursary allocations are distributed equitably across all registered wards in {currentConstituency?.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeWards.map((w, idx) => (
            <div
              key={w.id || idx}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0B6B3A]/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {w.code || `W-0${idx + 1}`}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  KSh {Number(w.budget_allocation || 5000000).toLocaleString()} Cap
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{w.name}</h4>
              {w.representative_name && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{w.representative_name}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. BURSARY SPONSORSHIP CATEGORIES SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B6B3A]">
            FUND ALLOCATIONS
          </span>
          <h3 className="text-3xl font-black text-[#0F172A]">Bursary Sponsorship Categories</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Sponsorship programs tailored to diverse student education levels across {currentConstituency?.name}.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveCategoryTab('secondary')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeCategoryTab === 'secondary'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🎓 Secondary Category
          </button>

          <button
            onClick={() => setActiveCategoryTab('tvet')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeCategoryTab === 'tvet'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🏢 TVET Category
          </button>

          <button
            onClick={() => setActiveCategoryTab('undergraduate')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeCategoryTab === 'undergraduate'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            📖 Undergraduate Category
          </button>

          <button
            onClick={() => setActiveCategoryTab('special')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center gap-2 ${
              activeCategoryTab === 'special'
                ? 'bg-[#0B6B3A] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🎗️ Special Category
          </button>
        </div>

        {/* Selected Category Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] font-bold text-[#0B6B3A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
              {currentCat.badge}
            </span>
            <h4 className="text-2xl font-black text-[#0F172A]">{currentCat.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{currentCat.desc}</p>
            <button
              onClick={() => triggerAuth('register')}
              className="px-6 py-2.5 bg-[#0B6B3A] hover:bg-[#084e2a] text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              Apply Under This Category <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              MAXIMUM ALLOCATION CAP
            </span>
            <p className="text-3xl font-black text-[#0B6B3A]">{currentCat.cap}</p>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-block">
              Direct Institution Disbursement
            </span>
          </div>
        </div>
      </section>

      {/* 6. HOW TO SUBMIT YOUR BURSARY APPLICATION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B6B3A]">
            FAST PROCESS
          </span>
          <h3 className="text-3xl font-black text-[#0F172A]">How To Submit Your Bursary Application</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Four transparent steps from registration to award disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover-card-lift transition-all group"
            >
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shadow-md transition-transform group-hover:scale-110 ${step.color}`}>
                {step.num}
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B6B3A] transition-colors">{step.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-[#0B6B3A]">
            HELP & ANSWERS
          </span>
          <h3 className="text-3xl font-black text-[#0F172A]">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">
            Everything you need to know about the {currentConstituency?.name} Bursary System.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-slate-800 hover:text-[#0B6B3A]"
                >
                  <span>{f.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. OFFICIAL CONSTITUENCY CONTACTS FOOTER BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OFFICIAL NG-CDF OFFICE</span>
              <h4 className="text-base font-bold text-slate-900">{currentConstituency?.name} Constituency Headquarters</h4>
            </div>
            <span className="text-xs font-bold text-[#0B6B3A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {currentConstituency?.county || 'Kenya'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Physical Location</span>
                <span>{currentConstituency?.office_location || 'NG-CDF Office Building'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Official Postal Address</span>
                <span className="font-mono text-[11px]">{currentConstituency?.office_postal_address || 'P.O. Box Accredited'}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Support Contacts</span>
                <span>{currentConstituency?.office_phone || '+254 700 000 000'}</span>
                {currentConstituency?.office_email && (
                  <span className="block text-slate-400 text-[11px]">{currentConstituency.office_email}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
