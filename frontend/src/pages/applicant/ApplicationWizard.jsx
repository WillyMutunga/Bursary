import API_BASE_URL from '../../config';
import { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, FileText, User, GraduationCap, Users, Home, Wallet, ShieldAlert, History } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const checkExistingQuota = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
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
        console.error("Quota check error:", err);
      }
    };
    checkExistingQuota();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      // 1. Get real active session token
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("Session expired. Please log in again.");
        return window.location.href = '/login';
      }

      // 2. Create Draft Application using FormData for file uploads
      const submitData = new FormData();
      submitData.append('ward', formData.ward || 'Emali/Mulala');
      submitData.append('polling_station', formData.pollingStation || 'Main Primary School');
      submitData.append('institution_name', formData.institutionName || 'N/A');
      submitData.append('institution_type', formData.institutionType || 'Boarding Secondary');
      submitData.append('admission_number', formData.admissionNumber || 'N/A');
      submitData.append('course', formData.course || 'N/A');
      submitData.append('year_of_study', formData.yearOfStudy || 'N/A');
      submitData.append('amount_applied', formData.amountApplied || 0);
      submitData.append('fee_balance', formData.feeBalance || 0);
      submitData.append('vulnerability_status', formData.vulnerabilityStatus || 'None');
      submitData.append('income_category', formData.incomeCategory || 'None');
      submitData.append('status', 'DRAFT');

      if (formData.idDocument) submitData.append('id_document', formData.idDocument);
      if (formData.feeStructure) submitData.append('fee_structure', formData.feeStructure);
      if (formData.admissionLetter) submitData.append('admission_letter', formData.admissionLetter);

      const createRes = await fetch(API_BASE_URL + '/api/v1/applications/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      const appData = await createRes.json();

      if (appData.id) {
          // 3. Submit and Trigger Engine
          const submitRes = await fetch(`${API_BASE_URL}/api/v1/applications/${appData.id}/submit/`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          const finalData = await submitRes.json();
          setSubmissionResult(finalData);
          handleNext();
      } else {
          alert('Failed to save draft application');
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Personal Information</h3>
              <p className="text-sm text-gray-500 mt-1">Provide your basic personal details as they appear on your ID.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Kamau" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sub-County Ward</label>
                <select name="ward" value={formData.ward || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all font-bold">
                  <option value="">Select Kibwezi West Ward</option>
                  <option value="Emali/Mulala">Emali/Mulala</option>
                  <option value="Makindu">Makindu</option>
                  <option value="Nguu/Masumba">Nguu/Masumba</option>
                  <option value="Nguumo">Nguumo</option>
                  <option value="Kikumbulyu North">Kikumbulyu North</option>
                  <option value="Kikumbulyu South">Kikumbulyu South</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Polling Station</label>
                <input type="text" name="pollingStation" value={formData.pollingStation || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="e.g. Emali Primary School" />
              </div>
            </div>
          </div>
        );
      case 1:
        const isSecondary = formData.educationLevel === 'SECONDARY';

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-black text-[#121820]">Education Information</h3>
              <p className="text-sm text-slate-500 mt-1">Select your education level to customize your application requirements.</p>
            </div>

            {/* Education Level Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div 
                onClick={() => setFormData(prev => ({ ...prev, educationLevel: 'SECONDARY', course: 'Secondary Education' }))}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSecondary ? 'border-[#0F6B38] bg-emerald-50/60 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isSecondary ? 'bg-[#0F6B38] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  🏫
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#121820]">Secondary School</h4>
                  <p className="text-xs text-slate-500 font-medium">High School (Form 1 to Form 4)</p>
                </div>
              </div>

              <div 
                onClick={() => setFormData(prev => ({ ...prev, educationLevel: 'TERTIARY' }))}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${!isSecondary ? 'border-[#0F6B38] bg-emerald-50/60 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${!isSecondary ? 'bg-[#0F6B38] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  🎓
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#121820]">University / TVET / College</h4>
                  <p className="text-xs text-slate-500 font-medium">Degree, Diploma, Certificate, KMTC</p>
                </div>
              </div>
            </div>

            {/* Dynamic Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-extrabold uppercase text-slate-700">
                  {isSecondary ? 'Secondary School Name' : 'University / College Institution Name'}
                </label>
                <input 
                  type="text" 
                  name="institutionName" 
                  value={formData.institutionName || ''} 
                  onChange={handleChange} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]" 
                  placeholder={isSecondary ? "e.g. Makindu Boys Secondary School" : "e.g. University of Nairobi"} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase text-slate-700">
                  {isSecondary ? 'Admission / NEMIS UPI Number' : 'Student Registration / Admission No.'}
                </label>
                <input 
                  type="text" 
                  name="admissionNumber" 
                  value={formData.admissionNumber || ''} 
                  onChange={handleChange} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]" 
                  placeholder={isSecondary ? "e.g. 4512 / NEMIS UPI" : "e.g. C01/001/2023"} 
                />
              </div>

              {isSecondary ? (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-700">Current Form / Class</label>
                  <select 
                    name="yearOfStudy" 
                    value={formData.yearOfStudy || ''} 
                    onChange={handleChange} 
                    className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]"
                  >
                    <option value="">Select Form</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-700">Course / Degree / Diploma Program</label>
                  <input 
                    type="text" 
                    name="course" 
                    value={formData.course || ''} 
                    onChange={handleChange} 
                    className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]" 
                    placeholder="e.g. Bachelor of Science in Computer Science" 
                  />
                </div>
              )}

              {!isSecondary && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase text-slate-700">Year of Study</label>
                  <select 
                    name="yearOfStudy" 
                    value={formData.yearOfStudy || ''} 
                    onChange={handleChange} 
                    className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]"
                  >
                    <option value="">Select Academic Year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="Year 5+">Year 5+</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase text-slate-700">
                  {isSecondary ? 'School Category' : 'Institution Category'}
                </label>
                <select 
                  name="institutionType" 
                  value={formData.institutionType || ''} 
                  onChange={handleChange} 
                  className="w-full border-slate-300 rounded-xl shadow-sm focus:border-[#0F6B38] focus:ring-[#0F6B38] p-3.5 bg-white border text-xs font-bold text-[#121820]"
                >
                  <option value="">Select Category</option>
                  {isSecondary ? (
                    <>
                      <option value="Boarding Secondary">Boarding Secondary School</option>
                      <option value="Day Secondary">Day Secondary School</option>
                      <option value="Special Needs Secondary">Special Needs Secondary School</option>
                    </>
                  ) : (
                    <>
                      <option value="Public University">Public University</option>
                      <option value="Private University">Private University</option>
                      <option value="TVET / Polytechnic">TVET / National Polytechnic</option>
                      <option value="KMTC Medical College">Kenya Medical Training College (KMTC)</option>
                      <option value="Teacher Training College">Teacher Training College (TTC)</option>
                    </>
                  )}
                </select>
              </div>

            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Parent/Guardian Information</h3>
              <p className="text-sm text-gray-500 mt-1">Provide details of your primary parent or guardian.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="e.g. Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <select name="guardianRelationship" value={formData.guardianRelationship || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all">
                  <option value="">Select Relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" name="guardianPhone" value={formData.guardianPhone || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Occupation</label>
                <input type="text" name="guardianOccupation" value={formData.guardianOccupation || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="e.g. Farmer, Teacher" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Household Information</h3>
              <p className="text-sm text-gray-500 mt-1">Provide your residential and administrative details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">County</label>
                <input type="text" name="county" value={formData.county || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="County" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Constituency</label>
                <input type="text" name="constituency" value={formData.constituency || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Constituency" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ward</label>
                <input type="text" name="ward" value={formData.ward || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Ward" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Location" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sub-Location</label>
                <input type="text" name="subLocation" value={formData.subLocation || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Sub-Location" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Village/Estate</label>
                <input type="text" name="village" value={formData.village || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Village" />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Financial Information</h3>
              <p className="text-sm text-gray-500 mt-1">Provide accurate details regarding your fees.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Fee Balance (KSh)</label>
                <input type="number" name="feeBalance" value={formData.feeBalance || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="e.g. 50000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount Applied For (KSh)</label>
                <input type="number" name="amountApplied" value={formData.amountApplied || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="e.g. 20000" />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Vulnerability Information</h3>
              <p className="text-sm text-gray-500 mt-1">This information helps the committee assess your eligibility score.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Family Income Category</label>
                <select name="incomeCategory" value={formData.incomeCategory || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all">
                  <option value="">Select Category</option>
                  <option value="Less than 10,000">Less than 10,000</option>
                  <option value="10,000 - 30,000">10,000 - 30,000</option>
                  <option value="30,001 - 50,000">30,001 - 50,000</option>
                  <option value="Above 50,000">Above 50,000</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Vulnerability Status</label>
                <select name="vulnerabilityStatus" value={formData.vulnerabilityStatus || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all">
                  <option value="">Select Status</option>
                  <option value="Total Orphan">Total Orphan</option>
                  <option value="Partial Orphan">Partial Orphan</option>
                  <option value="Single Parent">Single Parent</option>
                  <option value="Both Parents Alive">Both Parents Alive</option>
                  <option value="Living with Disability">Living with Disability</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Previous Support</h3>
              <p className="text-sm text-gray-500 mt-1">Have you received NG-CDF bursary support before?</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Did you receive a bursary last year?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="prevSupport" value="Yes" checked={formData.prevSupport === 'Yes'} onChange={handleChange} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="prevSupport" value="No" checked={formData.prevSupport === 'No'} onChange={handleChange} className="text-primary focus:ring-primary h-4 w-4" />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
              {formData.prevSupport === 'Yes' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <label className="text-sm font-medium text-gray-700">If Yes, how much? (KSh)</label>
                  <input type="number" name="prevSupportAmount" value={formData.prevSupportAmount || ''} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary p-3 bg-gray-50/50 border transition-all" placeholder="Amount" />
                </div>
              )}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Supporting Documents</h3>
              <p className="text-sm text-gray-500 mt-1">Upload clear, legible copies of the required documents.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-green-50/30 transition-colors group relative overflow-hidden text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-navy">{formData.idDocument ? formData.idDocument.name : 'Upload National ID Card'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                <input type="file" name="idDocument" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-green-50/30 transition-colors group relative overflow-hidden text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-navy">{formData.admissionLetter ? formData.admissionLetter.name : 'Upload Admission Letter'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                <input type="file" name="admissionLetter" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary hover:bg-green-50/30 transition-colors group relative overflow-hidden text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 text-primary rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-navy">{formData.feeStructure ? formData.feeStructure.name : 'Upload Fee Structure'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
                <input type="file" name="feeStructure" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">Review Application</h3>
              <p className="text-sm text-gray-500 mt-1">Please verify all information before final submission.</p>
            </div>
            <div className="bg-amber-50 border-l-4 border-warning p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ShieldAlert className="h-5 w-5 text-warning" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800 font-medium">
                    Declaration of Truth
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    By submitting this application, you declare that all information provided is true and accurate. Any fraudulent information will result in automatic disqualification.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Simple summary mock */}
            <div className="border rounded-xl overflow-hidden mt-6">
              <div className="bg-gray-50 px-4 py-3 border-b font-medium text-sm text-navy">Summary</div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 text-sm">Applicant</span><span className="font-medium text-sm">{formData.firstName || 'First'} {formData.lastName || 'Last'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 text-sm">Institution</span><span className="font-medium text-sm">{formData.institutionName || 'Not Provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 text-sm">Amount Applied</span><span className="font-medium text-sm text-gold">KSh {formData.amountApplied || '0'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 text-sm">Documents Attached</span><span className="font-medium text-sm text-success">2 Files (Mock)</span></div>
              </div>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 text-center py-16 animate-in zoom-in-95 duration-500">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="text-3xl font-bold text-navy">Application Submitted!</h3>
            <p className="text-gray-600 max-w-md mx-auto mt-4">
              Your application has been received successfully and is now pending verification.
            </p>
            {submissionResult && (
                <div className="mt-8 inline-block bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Your Tracking Reference Number</p>
                        <p className="text-2xl font-mono font-bold tracking-wider text-primary">{submissionResult.reference_number || 'PENDING'}</p>
                    </div>
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 mb-1">Eligibility Score</p>
                        <p className="text-xl font-bold text-gold">{submissionResult.score || 0} / 100</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">{submissionResult.status}</span>
                    </div>
                </div>
            )}
          </div>
        );
      default: {
        const Icon = steps[currentStep].icon;
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-2xl font-semibold text-navy">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-500 mt-1">Please provide the necessary details below.</p>
            </div>
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Icon className="h-5 w-5" /> 
                Fields for {steps[currentStep].title} will appear here.
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#0B6B3A] rounded-md flex items-center justify-center shadow-sm">
                 <span className="text-white font-bold text-sm">NG</span>
             </div>
             <h1 className="text-lg font-bold text-navy hidden sm:block">Smart NG-CDF Bursary System</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
             <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden md:inline-block">Draft Application</span>
             <button onClick={() => window.location.href='/applicant'} className="text-primary hover:text-white border border-primary hover:bg-primary px-3 py-1.5 rounded-md transition-colors">
                 Save & Exit
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="md:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 hidden md:block">
                <h2 className="text-lg font-bold text-navy mb-6">Application Steps</h2>
                <nav className="space-y-2 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>
                    
                    {steps.map((step, idx) => {
                        const isActive = currentStep === idx;
                        const isCompleted = currentStep > idx;
                        
                        return (
                            <div key={idx} className="relative z-10 flex items-start gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 bg-white
                                    ${isActive ? 'border-primary text-primary' : 
                                      isCompleted ? 'border-success text-success bg-green-50' : 
                                      'border-gray-200 text-gray-400'}`}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-semibold">{step.id}</span>}
                                </div>
                                <div className="mt-1">
                                    <p className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-primary' : isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                                        {step.title}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </div>
            
            {/* Mobile Progress Bar */}
            <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Step {currentStep + 1} of {steps.length}</span>
                    <span className="text-xs font-semibold text-primary">{steps[currentStep].title}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 ease-out" 
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3 bg-white">
                    <div className="p-2 bg-green-50 rounded-lg text-primary">
                        {(() => { const Icon = steps[currentStep].icon; return <Icon size={20} />; })()}
                    </div>
                    <h2 className="text-xl font-bold text-navy">
                        {steps[currentStep].title}
                    </h2>
                </div>

                {/* Form Content */}
                <div className="p-8 flex-1 bg-white/50">
                    {renderStepContent()}
                </div>

                {/* Footer Navigation */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center mt-auto">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0 || currentStep === steps.length - 1}
                        className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${currentStep === 0 || currentStep === steps.length - 1 
                                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 shadow-sm'}`}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </button>
                    
                    {currentStep < steps.length - 2 ? (
                        <button
                        onClick={handleNext}
                        className="flex items-center px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0B6B3A] hover:bg-[#15803D] shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                        >
                        Save & Continue <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                    ) : currentStep === steps.length - 2 ? (
                        <button
                        onClick={handleSubmitApplication}
                        disabled={isSubmitting}
                        className={`flex items-center px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-95
                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-success hover:bg-green-700 shadow-green-200 hover:shadow-lg hover:shadow-green-300'}`}
                        >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    ) : (
                        <button
                        onClick={() => window.location.href='/applicant'}
                        className="flex items-center px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-navy hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                        >
                        Back to Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
