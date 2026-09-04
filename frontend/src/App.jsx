import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen';
import RoleSwitcherDrawer from './components/RoleSwitcherDrawer';
import PublicWebsite from './components/PublicWebsite';
import ApplicantPortal from './components/ApplicantPortal';
import VerificationPortal from './components/VerificationPortal';
import CommitteePortal from './components/CommitteePortal';
import FinancePortal from './components/FinancePortal';
import SchoolPortal from './components/SchoolPortal';
import ExecutiveAnalytics from './components/ExecutiveAnalytics';
import SuperAdminPortal from './components/SuperAdminPortal';
import AuditTrailView from './components/AuditTrailView';
import SystemSettingsView from './components/SystemSettingsView';
import AwardLetterModal from './components/AwardLetterModal';
import StatusTrackerModal from './components/StatusTrackerModal';
import ApplicationDossierModal from './components/ApplicationDossierModal';
import InstitutionalAwardLetterModal from './components/InstitutionalAwardLetterModal';

import { api } from './api/client';
import {
  initialApplications,
  initialWards,
  initialInstitutions,
  initialAuditLogs,
  initialStatistics,
} from './mockData';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Portal Rendering Error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-xl font-black">
            ⚠
          </div>
          <h2 className="text-xl font-black text-slate-900">Desk Display Refresh</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            An issue occurred while loading this administrative view: <br />
            <code className="font-mono text-[11px] bg-slate-100 p-1.5 rounded text-rose-700 inline-block mt-1 max-w-full overflow-x-auto">
              {this.state.error?.message || 'Component display error'}
            </code>
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#0B6B3A] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#084e2a]"
            >
              Reload Portal
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-700"
            >
              Sign Out & Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // authSession: null when on public landing page, or { role, user } when authenticated
  const [authSession, setAuthSession] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const [applications, setApplications] = useState(initialApplications || []);
  const [wards, setWards] = useState(initialWards || []);
  const [institutions, setInstitutions] = useState(initialInstitutions || []);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs || []);
  const [statistics, setStatistics] = useState(initialStatistics || {});

  const [applicantViewMode, setApplicantViewMode] = useState('dashboard');
  const [selectedAwardApp, setSelectedAwardApp] = useState(null);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // HELB-Style Dossier & Institutional Combined Award Modals
  const [selectedDossierApp, setSelectedDossierApp] = useState(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const [selectedInstLetter, setSelectedInstLetter] = useState({
    institution: { name: 'Kenyatta University (KU)', code: 'KU-002' },
    beneficiaries: [],
  });
  const [isInstLetterModalOpen, setIsInstLetterModalOpen] = useState(false);

  // Active sub-tab state for role-specific sidebar navigation
  const [activeRoleTab, setActiveRoleTab] = useState({
    admin: 'overview',
    analytics: 'overview',
    committee: 'queue',
    verification: 'queue',
    finance: 'ready',
    school: 'enrolled',
    applicant: 'status',
    audit: 'logs',
  });

  // Fetch real lookup data, applications, audit logs and statistics on mount from Laravel backend (PostgreSQL)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [lookupRes, statsRes, queueRes, auditRes] = await Promise.all([
          api.getLookupData(),
          api.getStatistics(),
          api.getVerificationQueue(),
          api.getAuditLogs(),
        ]);
        if (lookupRes && lookupRes.success) {
          if (lookupRes.wards?.length > 0) setWards(lookupRes.wards);
          if (lookupRes.institutions?.length > 0) setInstitutions(lookupRes.institutions);
        }
        if (statsRes && statsRes.success && statsRes.data) {
          setStatistics(statsRes.data);
        }
        if (queueRes && queueRes.success && queueRes.data?.length > 0) {
          setApplications(queueRes.data);
        }
        if (auditRes && auditRes.success && auditRes.data?.length > 0) {
          setAuditLogs(auditRes.data);
        }
      } catch (err) {
        console.warn('Backend data loaded with fallback defaults', err);
      }
    }
    loadInitialData();
  }, []);

  // System audit logger
  const logAudit = (action, module, recordId, payload) => {
    const newLog = {
      id: auditLogs.length + 1,
      user_name: authSession?.user?.name || 'Public User',
      action,
      module,
      record_id: String(recordId || 'N/A'),
      old_values: null,
      new_values: payload,
      created_at: new Date().toISOString(),
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleLoginSuccess = ({ role, user, isNewRegistration }) => {
    setAuthSession({ role, user });
    logAudit('USER_LOGIN', 'authentication', role, { name: user.name, role });
    if (isNewRegistration) {
      setApplicantViewMode('wizard');
    } else {
      setApplicantViewMode('dashboard');
    }
  };

  const handleLogout = () => {
    logAudit('USER_LOGOUT', 'authentication', authSession?.role, { name: authSession?.user?.name });
    setAuthSession(null);
  };

  const handleSelectRole = (role) => {
    if (role === 'public') {
      setAuthSession(null);
    } else {
      setAuthSession({
        role,
        user: {
          name:
            role === 'applicant'
              ? 'Willy Mutunga'
              : role === 'verification'
              ? 'Peter Mwangi'
              : role === 'committee'
              ? 'Willy'
              : role === 'finance'
              ? 'David Ochieng'
              : role === 'school'
              ? 'Dr. Mary Mutiso'
              : 'Willy (Super Admin)',
          role,
          designation:
            role === 'applicant'
              ? 'Applicant / Student'
              : role === 'verification'
              ? 'Senior Verification Officer'
              : role === 'committee'
              ? 'Bursary Committee Member'
              : role === 'finance'
              ? 'Finance & Disbursement Officer'
              : role === 'school'
              ? 'Academic Registrar (UoN)'
              : 'Constituency Fund Manager / Super Admin',
        },
      });
    }
  };

  const handleSelectSidebarTab = (tabId) => {
    const currentRole = authSession?.role || 'applicant';
    setActiveRoleTab((prev) => ({ ...prev, [currentRole]: tabId }));

    // Interactive Action triggers from sidebar
    if (currentRole === 'applicant') {
      if (tabId === 'dossier') {
        const studentApp = applications.find(
          (a) =>
            a.national_id === authSession?.user?.national_id ||
            a.user_id === authSession?.user?.id ||
            a.full_name?.toLowerCase() === authSession?.user?.name?.toLowerCase()
        ) || applications[0];
        handleOpenDossierModal(studentApp);
      } else if (tabId === 'award') {
        const studentApp = applications.find(
          (a) =>
            a.national_id === authSession?.user?.national_id ||
            a.user_id === authSession?.user?.id
        ) || applications[0];
        handleOpenAwardModal(studentApp);
      } else if (tabId === 'status') {
        setApplicantViewMode('dashboard');
      }
    } else if (currentRole === 'committee') {
      if (tabId === 'schedule') {
        handleOpenInstitutionalLetterModal();
      } else if (tabId === 'dossier') {
        handleOpenDossierModal(applications[0]);
      }
    } else if (currentRole === 'finance') {
      if (tabId === 'institutions') {
        handleOpenInstitutionalLetterModal();
      }
    }
  };

  // 1. Applicant submits new application
  const handleSubmitNewApplication = async (submittedData) => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        api.getVerificationQueue(),
        api.getStatistics(),
      ]);
      if (queueRes && queueRes.success && queueRes.data) {
        setApplications(queueRes.data);
      } else if (submittedData) {
        setApplications((prev) => [submittedData, ...prev]);
      }
      if (statsRes && statsRes.success && statsRes.data) {
        setStatistics(statsRes.data);
      }
    } catch (e) {
      if (submittedData) {
        setApplications((prev) => [submittedData, ...prev]);
      }
    }
    logAudit('SUBMIT_APPLICATION', 'applications', submittedData?.application_no || 'NEW', { name: submittedData?.full_name });
  };

  // 2. Verification Officer updates application stage
  const handleUpdateAppStage = (appId, nextStage) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: nextStage } : a))
    );
    logAudit('STAGE_TRANSITION', 'verification', appId, { new_stage: nextStage });
  };

  // 3. Officer records field inspection
  const handleRecordFieldVerification = (appId, fieldData) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              field_verified: true,
              field_recommendation: fieldData.recommendation,
              stage: fieldData.recommendation === 'VERIFIED' ? 'committee_review' : a.stage,
            }
          : a
      )
    );
    logAudit('FIELD_VERIFICATION_LOGGED', 'verification', appId, fieldData);
  };

  // 4. Committee records decision
  const handleRecordDecision = (appId, decisionData) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              stage: decisionData.decision === 'APPROVE' ? 'approved' : 'rejected',
              approved_amount: decisionData.approved_amount || a.recommended_amount,
              decision_reason: decisionData.notes,
            }
          : a
      )
    );
    logAudit('COMMITTEE_DECISION', 'committee', appId, decisionData);
  };

  // 5. Finance officer creates EFT payment batch
  const handleCreatePaymentBatch = (batchData) => {
    setApplications((prev) =>
      prev.map((a) =>
        batchData.application_ids.includes(a.id)
          ? { ...a, stage: 'paid', payment_batch_id: 'BATCH-2026-X79' }
          : a
      )
    );
    logAudit('PAYMENT_BATCH_DISBURSED', 'finance', 'BATCH-2026-X79', batchData);
  };

  // 6. School registrar confirms student particulars
  const handleConfirmStudent = (appId, confirmData) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              school_confirmed: true,
              confirmed_admission_no: confirmData.confirmed_admission_no,
              confirmed_fee_balance: confirmData.confirmed_fee_balance,
            }
          : a
      )
    );
    logAudit('SCHOOL_CONFIRMATION_LOGGED', 'institution', appId, confirmData);
  };

  const handleOpenAwardModal = (application) => {
    setSelectedAwardApp(application);
    setIsAwardModalOpen(true);
  };

  const handleOpenDossierModal = (application) => {
    setSelectedDossierApp(application);
    setIsDossierModalOpen(true);
  };

  const handleOpenInstitutionalLetterModal = (institution, beneficiaries) => {
    let targetBeneficiaries = beneficiaries;

    // Resolve target institution name and ID
    const instName = institution?.name || (targetBeneficiaries && targetBeneficiaries[0]?.institution?.name) || targetBeneficiaries?.[0]?.institution_name;
    const instId = institution?.id || (targetBeneficiaries && targetBeneficiaries[0]?.institution_id);

    // If only 1 applicant was passed or no beneficiaries, pull ALL matching applicants from applications list
    if (!targetBeneficiaries || targetBeneficiaries.length <= 1) {
      if (instName || instId) {
        const matchingApps = (applications || []).filter((a) => {
          if (instId && (a.institution_id === instId || a.institution?.id === instId)) return true;
          if (instName && (a.institution?.name === instName || a.institution_name === instName)) return true;
          return false;
        });
        if (matchingApps.length > 0) {
          targetBeneficiaries = matchingApps;
        }
      }
    }

    if (!targetBeneficiaries || targetBeneficiaries.length === 0) {
      targetBeneficiaries = (applications || []).filter(a => a.stage === 'approved' || a.stage === 'paid' || a.stage === 'awarded' || a.stage === 'committee_review');
      if (targetBeneficiaries.length === 0) {
        targetBeneficiaries = applications || [];
      }
    }

    const autoInst = institution
      || targetBeneficiaries[0]?.institution
      || (institutions && institutions.find(i => i.id === targetBeneficiaries[0]?.institution_id))
      || { name: targetBeneficiaries[0]?.institution_name || 'Kenyatta University (KU)', code: 'KU-002' };

    setSelectedInstLetter({
      institution: autoInst,
      beneficiaries: targetBeneficiaries,
    });
    setIsInstLetterModalOpen(true);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(true);

  const handleToggleWindow = async (forcedState) => {
    const nextState = typeof forcedState === 'boolean' ? forcedState : !isWindowOpen;
    try {
      await api.toggleCycleWindow(nextState);
    } catch (e) {
      console.warn('Window toggle sync', e);
    }
    setIsWindowOpen(nextState);
  };

  const currentRole = authSession?.role || 'public';
  const currentTab = activeRoleTab[currentRole] || 'overview';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#0B6B3A] selection:text-white">
      {/* Official Government Top Header & Navigation */}
      <Navbar
        authSession={authSession}
        onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode })}
        onLogout={handleLogout}
        onSelectRole={handleSelectRole}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* Main Dynamic Workspace Area */}
      <main className="flex-1 flex">
        {!authSession ? (
          /* 1. Public Citizen Landing Page */
          <div className="w-full">
            <PublicWebsite
              onOpenAuthModal={(mode) => setAuthModal({ isOpen: true, mode })}
              onOpenStatusModal={() => setIsStatusModalOpen(true)}
              applications={applications}
            />
          </div>
        ) : (
          /* 2. Authenticated Desks with Persistent Left Sidebar Dedicated to THIS Interface */
          <div className="flex flex-1 w-full min-h-[calc(100vh-80px)]">
            
            {/* Role-Specific Feature Navigation Sidebar */}
            <Sidebar
              authSession={authSession}
              activeRole={currentRole}
              activeTab={currentTab}
              onSelectTab={handleSelectSidebarTab}
              onLogout={handleLogout}
              onOpenPublic={() => setAuthSession(null)}
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              isWindowOpen={isWindowOpen}
              onToggleWindow={handleToggleWindow}
            />

            {/* Right Main Content Area */}
            <div className="flex-1 bg-[#F8FAFC] overflow-y-auto min-w-0 p-2 sm:p-4">
              <ErrorBoundary>
                <div className="animate-in fade-in duration-150">
                  {authSession.role === 'applicant' && (
                    <ApplicantPortal
                      applications={applications}
                      currentUser={authSession.user}
                      onOpenAwardModal={handleOpenAwardModal}
                      onOpenDossierModal={handleOpenDossierModal}
                      onSubmitNewApplication={handleSubmitNewApplication}
                      wards={wards}
                      institutions={institutions}
                      viewMode={applicantViewMode}
                      setViewMode={setApplicantViewMode}
                    />
                  )}

                  {authSession.role === 'verification' && (
                    <VerificationPortal
                      applications={applications}
                      wards={wards}
                      institutions={institutions}
                      onUpdateAppStage={handleUpdateAppStage}
                      onRecordFieldVerification={handleRecordFieldVerification}
                      onOpenDossierModal={handleOpenDossierModal}
                    />
                  )}

                  {authSession.role === 'committee' && (
                    <CommitteePortal
                      applications={applications}
                      wards={wards}
                      onRecordDecision={handleRecordDecision}
                      onOpenDossierModal={handleOpenDossierModal}
                      onOpenInstitutionalLetterModal={handleOpenInstitutionalLetterModal}
                    />
                  )}

                  {authSession.role === 'finance' && (
                    <FinancePortal
                      applications={applications}
                      onCreatePaymentBatch={handleCreatePaymentBatch}
                      onOpenInstitutionalLetterModal={handleOpenInstitutionalLetterModal}
                    />
                  )}

                  {authSession.role === 'school' && (
                    <SchoolPortal
                      applications={applications}
                      onConfirmStudent={handleConfirmStudent}
                    />
                  )}

                  {(authSession.role === 'admin' || authSession.role === 'super_admin' || authSession.role === 'analytics') && (
                    <SuperAdminPortal
                      applications={applications}
                      wards={wards}
                      institutions={institutions}
                      auditLogs={auditLogs}
                      activeSubTab={currentTab}
                      onSelectSubTab={(tab) =>
                        setActiveRoleTab((prev) => ({ ...prev, [authSession.role]: tab, admin: tab, analytics: tab }))
                      }
                      onOpenDossierModal={handleOpenDossierModal}
                      currentUser={authSession.user}
                    />
                  )}

                  {authSession.role === 'audit' && (
                    <AuditTrailView
                      auditLogs={auditLogs}
                    />
                  )}

                  {authSession.role === 'settings' && (
                    <SystemSettingsView
                      onSaveSettings={(config) => {
                        logAudit('SETTINGS_UPDATED', 'settings', 'CONFIG', config);
                      }}
                    />
                  )}
                </div>
              </ErrorBoundary>
            </div>

          </div>
        )}
      </main>

      {/* Official Government Footer */}
      {!authSession && (
        <Footer
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
          onSelectRole={handleSelectRole}
        />
      )}

      {/* Authentication & Role Access Modal */}
      <AuthScreen
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onLoginSuccess={handleLoginSuccess}
        wards={wards}
      />

      {/* Digital QR Individual Award Letter Modal */}
      <AwardLetterModal
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        application={selectedAwardApp || applications[0]}
      />

      {/* HELB-Style Full Application Dossier Modal */}
      <ApplicationDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        application={selectedDossierApp || applications[0]}
      />

      {/* Institutional Combined Beneficiary Transmittal Letter Modal */}
      <InstitutionalAwardLetterModal
        isOpen={isInstLetterModalOpen}
        onClose={() => setIsInstLetterModalOpen(false)}
        institution={selectedInstLetter.institution}
        beneficiaries={selectedInstLetter.beneficiaries}
        allApplications={applications}
        institutions={institutions}
      />

      {/* Fast Application Status Tracker Modal */}
      <StatusTrackerModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        applications={applications}
        onOpenAwardModal={handleOpenAwardModal}
      />
    </div>
  );
}
