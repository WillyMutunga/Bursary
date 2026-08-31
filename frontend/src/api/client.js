const BASE_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://127.0.0.1:8000/api'
  : '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? { 'Accept': 'application/json' }
    : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (!isFormData && config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || data.error || (data.errors ? Object.values(data.errors).flat().join(' ') : `HTTP ${res.status}: Request failed`);
        return {
          success: false,
          status: res.status,
          message: errorMsg,
          ...data,
        };
      }
      return data;
    }
    const text = await res.text();
    if (!res.ok) {
      if (text.includes('Imunify360') || text.includes('bot-protection')) {
        return {
          success: false,
          isImunifyChallenge: true,
          message: 'Server security challenge: Open https://bursary.skysoftsystems.co.ke/api/public/statistics in a new tab once to complete 1-time browser verification.',
        };
      }
      return { success: false, message: `HTTP ${res.status}: ${res.statusText || 'Request failed'}` };
    }
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, data: text };
    }
  } catch (error) {
    console.warn(`API call to ${endpoint} failed:`, error.message);
    return { success: false, error: error.message, message: error.message };
  }
}

export const api = {
  // Public Portal
  getStatistics: () => request('/public/statistics'),
  getLookupData: () => request('/public/lookup-data'),
  lookupStatus: (query) => request('/public/lookup-status', { method: 'POST', body: { query } }),
  verifyAwardHash: (hash) => request(`/verify/award/${hash}`),

  // Auth
  login: (identifierOrObj, maybePassword) => {
    const payload = typeof identifierOrObj === 'object'
      ? identifierOrObj
      : { email: identifierOrObj, password: maybePassword };
    return request('/auth/login', { method: 'POST', body: payload });
  },
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  getDemoUsers: () => request('/auth/demo-users'),

  // Applicant
  getMyApplications: (userId, nationalId) =>
    request(`/applicant/my-applications?user_id=${userId || ''}&national_id=${encodeURIComponent(nationalId || '')}`),
  getApplicationDetails: (id) => request(`/applicant/applications/${id}`),
  verifyNationalId: (nationalId, fullName) =>
    request('/applicant/verify-id', { method: 'POST', body: { national_id: nationalId, full_name: fullName } }),
  submitWizard: (formData) => request('/applicant/submit-wizard', { method: 'POST', body: formData }),
  getNotifications: (userId) => request(`/applicant/notifications?user_id=${userId || 1}`),

  // Verification Officer
  getVerificationQueue: () => request('/verification/queue'),
  getVerificationDetails: (id) => request(`/verification/applications/${id}`),
  recordFieldVerification: (id, fieldData) =>
    request(`/verification/applications/${id}/field-verification`, { method: 'POST', body: fieldData }),
  forwardToCommittee: (id, data) =>
    request(`/verification/applications/${id}/forward-committee`, { method: 'POST', body: data }),

  // Committee
  getCommitteeApplications: () => request('/committee/applications'),
  recordCommitteeDecision: (id, decisionData) =>
    request(`/committee/applications/${id}/decision`, { method: 'POST', body: decisionData }),

  // Finance
  getFinanceDashboard: () => request('/finance/dashboard'),
  createPaymentBatch: (batchData) => request('/finance/batches', { method: 'POST', body: batchData }),

  // School
  getSchoolStudents: (query) => request(`/school/students?query=${encodeURIComponent(query || '')}`),
  confirmSchoolStudent: (id, data) => request(`/school/students/${id}/confirm`, { method: 'POST', body: data }),

  // Analytics & Settings
  getAnalyticsDashboard: () => request('/analytics/dashboard'),
  getSettings: () => request('/settings'),
  getAuditLogs: () => request('/settings/audit-logs'),
  updateScoringWeights: (weights) => request('/settings/scoring-weights', { method: 'POST', body: { weights } }),

  // Super Admin Governance & Live Sync
  getAdminDashboard: () => request('/admin/dashboard'),
  toggleCycleWindow: (isActive, endDate) =>
    request('/admin/cycle/toggle-window', { method: 'POST', body: { is_active: isActive, end_date: endDate } }),
  updateWardBudget: (wardId, budgetAllocation) =>
    request(`/admin/wards/${wardId}/budget`, { method: 'POST', body: { budget_allocation: budgetAllocation } }),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: userData }),
  deleteAdminUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),
  resetAdminUserPassword: (userId, password) =>
    request(`/admin/users/${userId}/reset-password`, { method: 'POST', body: { password } }),
};
