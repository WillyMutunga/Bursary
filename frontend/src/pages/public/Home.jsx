import API_BASE_URL from '../../config';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Users, 
  BookOpen, 
  Clock, 
  HelpCircle,
  LogIn,
  UserPlus,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  FileCheck,
  Building
} from 'lucide-react';

export default function Home() {
  const [trackRef, setTrackRef] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('secondary');
  const [openFaq, setOpenFaq] = useState(null);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackRef) return;
    setIsSearching(true);
    setTrackResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/applications/?search=${trackRef}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setTrackResult(data[0]);
        } else {
          setTrackResult({ notFound: true });
        }
      }
    } catch (err) {
      console.error(err);
      setTrackResult({ notFound: true });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const categoryDetails = {
    secondary: {
      title: 'Secondary School Sponsorship',
      desc: 'Dedicated bursary support for students in Public & Boarding Secondary Schools across Kibwezi West.',
      maxAmount: 'KSh 15,000',
      icon: GraduationCap,
      color: 'bg-emerald-500'
    },
    tvet: {
      title: 'TVET & Vocational Training Institutes',
      desc: 'Skills development funding for technical training institutes, polytechnics, and vocational colleges.',
      maxAmount: 'KSh 20,000',
      icon: Building,
      color: 'bg-amber-500'
    },
    university: {
      title: 'Undergraduate & Higher Education',
      desc: 'Financial assistance for degree applicants in accredited Public & Private Universities in Kenya.',
      maxAmount: 'KSh 35,000',
      icon: BookOpen,
      color: 'bg-indigo-500'
    },
    special: {
      title: 'Special Needs & Vulnerable Groups',
      desc: 'Priority funding allocations for total orphans, partial orphans, and students living with disabilities.',
      maxAmount: 'Full Fee Consideration',
      icon: Sparkles,
      color: 'bg-purple-500'
    }
  };

  const faqs = [
    {
      q: 'Who is eligible to apply for Kibwezi West NG-CDF Bursary?',
      a: 'Any resident student of Kibwezi West Constituency enrolled in an accredited Secondary School, TVET College, or University with a valid Admission Number and Fee Structure.'
    },
    {
      q: 'What documents are mandatory for online submission?',
      a: 'You must upload a scanned copy of your National ID / Student ID, official current Fee Structure from your institution, and your Admission / Calling Letter.'
    },
    {
      q: 'How long does the verification and disbursement process take?',
      a: 'Applications undergo automatic score verification immediately. Committee reviews occur within 7 days, after which direct bank EFT manifests are generated for institutions.'
    },
    {
      q: 'How can I check if my bursary award letter is ready?',
      a: 'You can track your application status using your Reference Number on this home page, or log into your Applicant Dashboard to download your official printable Bursary Award Letter.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Top Kenya Flag Accent Bar */}
      <div className="h-2 w-full flex sticky top-0 z-50">
        <div className="h-full w-1/3 bg-[#121820]"></div>
        <div className="h-full w-1/3 bg-[#C8102E]"></div>
        <div className="h-full w-1/3 bg-[#0F6B38]"></div>
      </div>

      {/* 2. Official Sticky Header Navigation Bar */}
      <header className="bg-[#121820] text-white border-b-2 border-[#DAA520] sticky top-2 z-40 shadow-xl backdrop-blur-md bg-[#121820]/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Constituency Identity */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img src="/logo.png" alt="NG-CDF Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1 border-2 border-[#DAA520] shadow-md group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#121820] rounded-full animate-ping"></span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#121820] rounded-full"></span>
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wide text-white leading-tight uppercase">REPUBLIC OF KENYA</h1>
              <p className="text-xs font-extrabold text-[#DAA520] uppercase tracking-wider">NG-CDF Kibwezi West Constituency</p>
              <p className="text-[10px] text-emerald-400 font-semibold italic">"Maendeleo kwa wote"</p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <RouterLink 
              to="/login" 
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all border border-slate-700 hover:border-slate-500 shadow-sm"
            >
              <LogIn size={15} />
              <span>Portal Login</span>
            </RouterLink>
            <RouterLink 
              to="/register" 
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-black text-white bg-[#0F6B38] hover:bg-[#094724] rounded-xl shadow-lg shadow-emerald-950/40 transition-all border border-emerald-600 hover:scale-105 active:scale-95"
            >
              <UserPlus size={15} />
              <span>Apply for Bursary</span>
            </RouterLink>
          </div>

        </div>
      </header>

      {/* 3. Hero Section with Animated Background Patterns & Micro-Animations */}
      <section className="relative bg-[#0F6B38] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#DAA520]/20 rounded-full blur-3xl animate-pulse pointer-events-none delay-700"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content with Fade-In Animation */}
          <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 rounded-full text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#DAA520] animate-ping"></span>
              Official Government Education Portal
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-md">
              Empowering <span className="text-[#DAA520] underline decoration-[#DAA520]/40">Kibwezi West</span> Students
            </h1>

            <p className="text-slate-100 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              National Government Constituencies Development Fund (NG-CDF) Bursary Application & Disbursement Portal. Digital, transparent, and direct education funding.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <RouterLink 
                to="/register" 
                className="group flex items-center gap-3 px-7 py-4 bg-[#DAA520] hover:bg-[#b88a18] text-[#121820] font-black text-sm rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
              >
                <span>Start Application Wizard</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </RouterLink>

              <a 
                href="#track-section" 
                className="flex items-center gap-2.5 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all backdrop-blur-md hover:-translate-y-1"
              >
                <Search size={18} />
                <span>Track Application Status</span>
              </a>
            </div>

            {/* Micro Stats Counter Cards */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#DAA520]">20M+</span>
                <span className="text-[11px] text-emerald-200 block font-semibold">Total Fund Ceiling</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-white">100%</span>
                <span className="text-[11px] text-emerald-200 block font-semibold">Digital Verification</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xl sm:text-2xl font-black text-[#DAA520]">EFT</span>
                <span className="text-[11px] text-emerald-200 block font-semibold">Direct Bank Manifests</span>
              </div>
            </div>

          </div>

          {/* Right Floating Glassmorphism Executive Card */}
          <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            
            <div className="bg-white/95 backdrop-blur-xl text-[#121820] p-8 rounded-3xl shadow-2xl border-4 border-[#DAA520] space-y-6 relative z-10 transform hover:scale-[1.01] transition-transform duration-300">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0F6B38]/10 text-[#0F6B38] rounded-2xl flex items-center justify-center font-extrabold shadow-inner">
                    <Award size={26} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#121820]">FY 2026/2027 Bursary</h3>
                    <p className="text-xs text-slate-500 font-bold">Kibwezi West Constituency</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-[#0F6B38] text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                  Active Window
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0F6B38] transition-colors">
                  <span className="text-xs font-bold text-slate-600">Allocation Cap</span>
                  <span className="text-base font-black text-[#0F6B38]">KSh 20,000,000</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0F6B38] transition-colors">
                  <span className="text-xs font-bold text-slate-600">Verification Engine</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">Instant Math Breakdown</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#0F6B38] transition-colors">
                  <span className="text-xs font-bold text-slate-600">Direct Disbursement</span>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-lg">Bank EFT CSV Export</span>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500 font-semibold border-t border-slate-100">
                Official Kenya National Government Portal
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Live Interactive Reference Tracking Section */}
      <section id="track-section" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="bg-gradient-to-br from-[#121820] via-[#1A2332] to-[#0D131D] text-white p-8 sm:p-10 rounded-3xl shadow-2xl border-2 border-[#DAA520] space-y-6 relative overflow-hidden">
            
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-[#DAA520]/20 text-[#DAA520] rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-[#DAA520]/30">
                Public Search Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">Track Application Progress</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Enter your official Reference Number (e.g. CDF/BURS/2026/OFFICIAL) to check your bursary status.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  required
                  placeholder="Enter Reference Number..."
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6B38] font-mono font-bold"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSearching}
                className="px-8 py-4 bg-[#0F6B38] hover:bg-[#094724] text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 hover:scale-105 active:scale-95"
              >
                <Search size={18} />
                <span>{isSearching ? 'Verifying...' : 'Check Status'}</span>
              </button>
            </form>

            {trackResult && (
              <div className="mt-4 p-5 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs space-y-3 animate-in fade-in duration-300">
                {trackResult.notFound ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-amber-300 font-bold">
                    No application found matching reference "{trackRef}". Please check the ID and try again.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Reference Number:</span>
                      <span className="font-mono text-white font-bold text-sm">{trackResult.reference_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Institution:</span>
                      <span className="text-white font-semibold">{trackResult.institution_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Application Status:</span>
                      <span className={`font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                        trackResult.status === 'APPROVED' || trackResult.status === 'PAID' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : trackResult.status === 'REJECTED' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {trackResult.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 5. Interactive Category Sponsorship Tabs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#0F6B38] uppercase tracking-wider">Fund Allocations</span>
          <h2 className="text-3xl font-black text-[#121820]">Bursary Sponsorship Categories</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">Sponsorship programs tailored to diverse student education levels across the constituency.</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.keys(categoryDetails).map((key) => {
            const cat = categoryDetails[key];
            const IconComponent = cat.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-extrabold text-xs transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#0F6B38] text-white shadow-xl shadow-emerald-950/20 scale-105' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <IconComponent size={16} />
                <span>{cat.title.split(' ')[0]} Category</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Category Card */}
        {(() => {
          const current = categoryDetails[activeTab];
          const CurrentIcon = current.icon;
          return (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                  <CurrentIcon size={16} className="text-[#0F6B38]" />
                  <span>{current.title}</span>
                </div>
                <h3 className="text-2xl font-black text-[#121820]">{current.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{current.desc}</p>
                <div className="pt-2">
                  <RouterLink 
                    to="/register" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F6B38] hover:bg-[#094724] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    <span>Apply Under This Category</span>
                    <ArrowRight size={14} />
                  </RouterLink>
                </div>
              </div>

              <div className="md:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase block">Maximum Allocation Cap</span>
                <span className="text-2xl font-black text-[#0F6B38] block">{current.maxAmount}</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold inline-block">Direct Institution Disbursement</span>
              </div>
            </div>
          );
        })()}

      </section>

      {/* 6. Step-by-Step Interactive Workflow */}
      <section className="py-16 bg-white border-t border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-[#0F6B38] uppercase tracking-wider">Fast Process</span>
            <h2 className="text-3xl font-black text-[#121820]">How To Submit Your Bursary Application</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">Four transparent steps from registration to award disbursement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-[#F4F7F5] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-[#0F6B38] group">
              <div className="w-12 h-12 bg-[#0F6B38] text-white font-black rounded-2xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-extrabold text-base text-[#121820]">Create Account</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Register using your National ID or Student Admission credentials.</p>
            </div>

            <div className="bg-[#F4F7F5] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-[#0F6B38] group">
              <div className="w-12 h-12 bg-[#0F6B38] text-white font-black rounded-2xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-extrabold text-base text-[#121820]">Fill Application</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Provide institution info, course, fee balance, and family status details.</p>
            </div>

            <div className="bg-[#F4F7F5] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-[#0F6B38] group">
              <div className="w-12 h-12 bg-[#0F6B38] text-white font-black rounded-2xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-extrabold text-base text-[#121820]">Upload Documents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Upload clear files of your ID, official Fee Structure, and Calling letter.</p>
            </div>

            <div className="bg-[#F4F7F5] p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:border-[#DAA520] group">
              <div className="w-12 h-12 bg-[#DAA520] text-[#121820] font-black rounded-2xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="font-extrabold text-base text-[#121820]">Disbursement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">Committee calculates score, approves award, and exports bank manifest.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Animated Accordion FAQs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold text-[#0F6B38] uppercase tracking-wider">Help & Answers</span>
          <h2 className="text-3xl font-black text-[#121820]">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm">Everything you need to know about the Kibwezi West Bursary System.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-extrabold text-sm text-[#121820]">{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  className={`text-[#0F6B38] transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} 
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Official Government Footer */}
      <footer className="bg-[#121820] text-slate-400 text-xs font-medium border-t-4 border-[#DAA520]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NG-CDF Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1" />
            <div>
              <p className="text-white font-extrabold text-sm">NG-CDF Kibwezi West Constituency</p>
              <p className="text-slate-400 text-xs">Republic of Kenya - National Government</p>
              <p className="text-emerald-400 text-[11px] font-semibold italic">"Maendeleo kwa wote"</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p>© 2026 NG-CDF Kibwezi West Constituency. All Rights Reserved.</p>
            <p className="text-[11px] text-slate-500">Official National Education Bursary Portal</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
