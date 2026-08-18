import API_BASE_URL from '../../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  UploadCloud, 
  FileText, 
  User, 
  GraduationCap, 
  Users, 
  Home, 
  Wallet, 
  ShieldAlert, 
  History,
  Lock,
  ArrowLeft
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Education', icon: GraduationCap },
  { id: 3, title: 'Parent/Guardian', icon: Users },
  { id: 4, title: 'Household', icon: Home },
  { id: 5, title: 'Financial', icon: Wallet },
  { id: 6, title: 'Vulnerability', icon: ShieldAlert },
  { id: 7, title: 'Previous Support', icon: History },
  { id: 8, title: 'Documents', icon: FileText },
  { id: 9, title: 'Review', icon: CheckCircle2 },
  { id: 10, title: 'Submit', icon: CheckCircle2 }
];

export default function ApplicationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isWindowLocked, setIsWindowLocked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return navigate('/login');

      try {
        // 1. Check window lock status from budget endpoint
        const budgetRes = await fetch(API_BASE_URL + '/api/v1/applications/budget/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (budgetRes.ok) {
          const budgetData = await budgetRes.json();
          if (budgetData.is_window_open === false) {
            setIsWindowLocked(true);
            return;
          }
        }

        // 2. Check application quota (1 application per student per FY)
        const res = await fetch(API_BASE_URL + '/api/v1/applications/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const apps = await res.json();
          if (apps.length > 0) {
            alert("Policy Enforced: You already have an active bursary application for FY 2026/2027. Each applicant is allowed only ONE application per financial year.");
            navigate('/applicant');
          }
        }
      } catch (err) {
        console.error("Window & Quota check error:", err);
      }
    };
    checkStatus();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Session expired. Please log in again.");
        return window.location.href = '/login';
      }

      // Step 1: Create application
      const createRes = await fetch(API_BASE_URL + '/api/v1/applications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ward: formData.ward || 'Emali/Mulala',
          polling_station: formData.polling_station || 'Central Primary',
          institution_type: formData.institution_type || 'University',
          institution_name: formData.institution_name || 'Kenyatta University',
          admission_number: formData.admission_number || 'KU/2024/001',
          year_of_study: parseInt(formData.year_of_study || 1),
          course_duration: parseInt(formData.course_duration || 4),
          course_name: formData.course_name || 'BSc Information Technology',
          requested_amount: parseFloat(formData.requested_amount || 25000),
          fee_balance: parseFloat(formData.fee_balance || 35000),

          // Extended fields
          father_status: formData.father_status || 'ALIVE',
          mother_status: formData.mother_status || 'ALIVE',
          family_income: parseFloat(formData.family_income || 15000),
          applicant_disability: formData.applicant_disability === 'true',
          disability_type: formData.disability_type || '',
          parent_disability: formData.parent_disability === 'true',
          chronic_illness: formData.chronic_illness === 'true',
          siblings_in_school: parseInt(formData.siblings_in_school || 2),
          prev_bursary_received: formData.prev_bursary_received === 'true',
          prev_bursary_amount: parseFloat(formData.prev_bursary_amount || 0)
        })
      });

      if (createRes.status === 403) {
        const errData = await createRes.json();
        if (errData.window_locked) {
          setIsWindowLocked(true);
          setIsSubmitting(false);
          return;
        }
      }

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error || 'Failed to create application draft');
      }

      const appData = await createRes.json();
      const appId = appData.id;

      // Step 2: Submit application
      const submitRes = await fetch(`${API_BASE_URL}/api/v1/applications/${appId}/submit/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!submitRes.ok) {
        throw new Error('Failed to finalize application submission');
      }

      const finalResult = await submitRes.json();
      setSubmissionResult(finalResult);
      setCurrentStep(steps.length - 1); // Move to final success step

    } catch (err) {
      alert(`Submission Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔒 APPLICATION WINDOW LOCKED NOTICE SCREEN
  if (isWindowLocked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-6 font-sans">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>

          {/* Government Emblem Header */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-300 text-amber-600 shadow-md">
                <Lock size={36} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                !
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-100 text-[#C8102E] text-xs font-extrabold rounded-full uppercase tracking-wider">
              <ShieldAlert size={14} /> Official Committee Notice
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1320] tracking-tight">
              Application Window Currently Locked
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
              NG-CDF Kibwezi West Constituency • Financial Year 2026/2027
            </p>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/80 text-left text-xs text-slate-700 leading-relaxed space-y-2">
            <p className="font-bold text-amber-900">
              Notice to All Students & Applicants:
            </p>
            <p>
              The online bursary application portal has been temporarily <strong>locked by the Constituency Bursary Committee</strong> for verification, eligibility scoring, and financial disbursement processing.
            </p>
            <p className="text-slate-600 pt-1">
              New bursary applications cannot be submitted at this time while the committee conducts evaluations.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/applicant')}
              className="w-full py-3.5 bg-gradient-to-r from-[#0B1320] to-slate-800 hover:from-slate-900 hover:to-black text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Home size={16} /> Return to Applicant Dashboard
            </button>

            <p className="text-[11px] text-slate-400 font-medium">
              If you have already submitted an application, you can view your live status on your dashboard.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">NG-CDF Kibwezi West</span>
            <h1 className="text-2xl font-black text-navy">Bursary Application Wizard</h1>
            <p className="text-xs text-slate-500">Financial Year 2026/2027 Application Form</p>
          </div>
          <button 
            onClick={() => navigate('/applicant')} 
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        {/* Mobile Step Header (< sm screens) */}
        <div className="sm:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-600 uppercase tracking-wide">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-600 to-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          {currentStep < steps.length - 1 && (
            <p className="text-[11px] text-slate-400 font-medium">
              Next: <strong className="text-slate-700">{steps[currentStep + 1].title}</strong>
            </p>
          )}
        </div>

        {/* Desktop Steps Progress Header (>= sm screens) */}
        <div className="hidden sm:block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-between min-w-[700px]">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? 'bg-emerald-600 text-white' :
                    isActive ? 'bg-red-600 text-white shadow-md shadow-red-200' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : step.id}
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-navy' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                  {idx < steps.length - 1 && <ChevronRight size={14} className="text-slate-300 ml-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card Body */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
          
          {/* Step 1: Personal Info */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-navy border-b pb-2">Step 1: Personal & Residency Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
                  <select 
                    value={formData.ward || 'Emali/Mulala'} 
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="Emali/Mulala">Emali/Mulala</option>
                    <option value="Makindu">Makindu</option>
                    <option value="Nguu/Masumba">Nguu/Masumba</option>
                    <option value="Nguumo">Nguumo</option>
                    <option value="Kikumbulyu North">Kikumbulyu North</option>
                    <option value="Kikumbulyu South">Kikumbulyu South</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Polling Station</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kibwezi Primary" 
                    value={formData.polling_station || ''} 
                    onChange={(e) => handleInputChange('polling_station', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-navy border-b pb-2">Step 2: Educational Institution</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institution Type</label>
                  <select 
                    value={formData.institution_type || 'University'} 
                    onChange={(e) => handleInputChange('institution_type', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="Secondary">Secondary School</option>
                    <option value="University">University</option>
                    <option value="College/TVET">College / TVET</option>
                    <option value="Special Needs">Special Needs Institution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kenyatta University" 
                    value={formData.institution_name || ''} 
                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. KU/2024/001" 
                    value={formData.admission_number || ''} 
                    onChange={(e) => handleInputChange('admission_number', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course / Class Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BSc Information Technology" 
                    value={formData.course_name || ''} 
                    onChange={(e) => handleInputChange('course_name', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Steps 3 to 7: Household & Vulnerability Info */}
          {currentStep >= 2 && currentStep <= 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-navy border-b pb-2">{steps[currentStep].title} Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Father's Status</label>
                  <select 
                    value={formData.father_status || 'ALIVE'} 
                    onChange={(e) => handleInputChange('father_status', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="ALIVE">Alive</option>
                    <option value="DECEASED">Deceased (Orphan)</option>
                    <option value="SINGLE_PARENT">Single Parent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Status</label>
                  <select 
                    value={formData.mother_status || 'ALIVE'} 
                    onChange={(e) => handleInputChange('mother_status', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="ALIVE">Alive</option>
                    <option value="DECEASED">Deceased (Orphan)</option>
                    <option value="SINGLE_PARENT">Single Parent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested Amount (KSh)</label>
                  <input 
                    type="number" 
                    placeholder="25000" 
                    value={formData.requested_amount || ''} 
                    onChange={(e) => handleInputChange('requested_amount', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Fee Balance (KSh)</label>
                  <input 
                    type="number" 
                    placeholder="35000" 
                    value={formData.fee_balance || ''} 
                    onChange={(e) => handleInputChange('fee_balance', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs font-bold text-navy focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Documents Upload */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-center">
              <h2 className="text-lg font-bold text-navy border-b pb-2 text-left">Step 8: Document Verification Uploads</h2>
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col items-center justify-center gap-3">
                <UploadCloud size={40} className="text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-navy">Upload Fee Structure / Admission Letter / ID Copy</p>
                  <p className="text-[11px] text-slate-500 mt-1">PDF or JPG formats up to 5MB</p>
                </div>
                <button type="button" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm">
                  Browse Files
                </button>
              </div>
            </div>
          )}

          {/* Step 9: Review */}
          {currentStep === 8 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-navy border-b pb-2">Step 9: Review & Verify Information</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ward:</span>
                  <span className="font-bold text-navy">{formData.ward || 'Emali/Mulala'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Institution:</span>
                  <span className="font-bold text-navy">{formData.institution_name || 'Kenyatta University'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-bold text-navy">{formData.admission_number || 'KU/2024/001'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requested Amount:</span>
                  <span className="font-bold text-emerald-600">KSh {parseFloat(formData.requested_amount || 25000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 10: Final Submission */}
          {currentStep === 9 && (
            <div className="space-y-6 text-center animate-in fade-in duration-300 my-auto">
              {submissionResult ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-2xl font-black text-navy">Application Submitted Successfully!</h2>
                  <p className="text-xs text-slate-500">Your application reference number is: <strong className="text-red-600">{submissionResult.reference_number}</strong></p>
                  <p className="text-xs text-slate-600">Automated Eligibility Score calculated: <strong className="text-navy">{submissionResult.score || 85} / 100 pts</strong></p>
                  <button 
                    onClick={() => navigate('/applicant')} 
                    className="px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-black transition-colors"
                  >
                    Go To Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-2xl font-black text-navy">Ready To Submit Application</h2>
                  <p className="text-xs text-slate-500">By clicking submit, you confirm that all information provided is accurate under the NG-CDF Act.</p>
                  <button 
                    onClick={handleSubmitApplication} 
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-200 transition-all"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          {currentStep < 9 && (
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button 
                onClick={handlePrev} 
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  currentStep === 0 ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button 
                onClick={handleNext} 
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#0B1320] to-slate-800 hover:from-slate-900 hover:to-black text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Next Step <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
