// API service connecting to Laravel backend with graceful mock fallback
const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Server error' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API [${endpoint}] failed or offline, using client cache/simulation:`, error.message);
    return null;
  }
}

export const api = {
  // Public
  getStatistics: () => fetchJson('/public/statistics'),
  getLookupData: () => fetchJson('/public/lookup-data'),
  lookupStatus: (query) => fetchJson('/public/lookup-status', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
  verifyAwardQr: (hash) => fetchJson(`/verify/award/${hash}`),

  // Auth & Demo
  getDemoUsers: () => fetchJson('/auth/demo-users'),

  // Applicant
  getMyApplications: (userId) => fetchJson(`/applicant/my-applications?user_id=${userId || 1}`),
  getApplication: (id) => fetchJson(`/applicant/applications/${id}`),
  verifyNationalId: (national_id, full_name) => fetchJson('/applicant/verify-id', {
    method: 'POST',
    body: JSON.stringify({ national_id, full_name }),
  }),
  submitApplicationWizard: (data) => fetchJson('/applicant/submit-wizard', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getNotifications: (userId) => fetchJson(`/applicant/notifications?user_id=${userId || 1}`),

  // Verification Officer
  getVerificationQueue: (params = '') => fetchJson(`/verification/queue?${params}`),
  updateDocumentStatus: (docId, status, notes) => fetchJson(`/verification/documents/${docId}/status`, {
    method: 'POST',
    body: JSON.stringify({ verification_status: status, officer_notes: notes }),
  }),
  recordFieldVerification: (appId, data) => fetchJson(`/verification/applications/${appId}/field-verification`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  forwardToCommittee: (appId) => fetchJson(`/verification/applications/${appId}/forward-committee`, {
    method: 'POST',
  }),

  // Committee
  getCommitteeApplications: (params = '') => fetchJson(`/committee/applications?${params}`),
  recordCommitteeDecision: (appId, data) => fetchJson(`/committee/applications/${appId}/decision`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Finance
  getFinanceDashboard: () => fetchJson('/finance/dashboard'),
  createPaymentBatch: (data) => fetchJson('/finance/batches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // School
  getSchoolStudents: (schoolId) => fetchJson(`/school/students?school_id=${schoolId || 1}`),
  confirmSchoolStudent: (appId, data) => fetchJson(`/school/students/${appId}/confirm`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Analytics & Settings
  getAnalytics: () => fetchJson('/analytics/dashboard'),
  getSettings: () => fetchJson('/settings'),
  getAuditLogs: (params = '') => fetchJson(`/settings/audit-logs?${params}`),
  updateScoringWeights: (weights) => fetchJson('/settings/scoring-weights', {
    method: 'POST',
    body: JSON.stringify(weights),
  }),
};
