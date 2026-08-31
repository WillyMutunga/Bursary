export const INITIAL_DATA = {
  activeCycle: {
    id: 1,
    title: "2026/2027 Financial Year (Cycle 1)",
    academic_year: "2026/2027",
    total_budget: 30000000.0,
    allocated_amount: 0.0,
    disbursed_amount: 0.0,
    start_date: "2026-06-01",
    end_date: "2026-09-30",
    status: "committee_review",
  },
  wards: [
    { id: 1, name: "Emali / Mulala Ward", code: "KBW-01", population: 45000, budget_allocation: 5500000.0, representative_name: "Hon. Francis Musyoka" },
    { id: 2, name: "Nguu / Masumba Ward", code: "KBW-02", population: 38000, budget_allocation: 5000000.0, representative_name: "Hon. Daniel Kimanzi" },
    { id: 3, name: "Nguumo Ward", code: "KBW-03", population: 42000, budget_allocation: 5200000.0, representative_name: "Hon. Geoffrey Musyoki" },
    { id: 4, name: "Makindu Ward", code: "KBW-04", population: 52000, budget_allocation: 6000000.0, representative_name: "Hon. Jackson Muthama" },
    { id: 5, name: "Kikumbulyu North Ward", code: "KBW-05", population: 36000, budget_allocation: 4800000.0, representative_name: "Hon. Onesmus Mutinda" },
    { id: 6, name: "Kikumbulyu South Ward", code: "KBW-06", population: 39000, budget_allocation: 5000000.0, representative_name: "Hon. Peter Mwololo" },
  ],
  institutions: [
    { id: 1, name: "University of Nairobi (UoN)", code: "UON-001", type: "university", county: "Nairobi", bank_name: "KCB Bank", bank_account_no: "1100234567" },
    { id: 2, name: "Kenyatta University (KU)", code: "KU-002", type: "university", county: "Nairobi", bank_name: "National Bank", bank_account_no: "0100345678" },
    { id: 3, name: "Kabete National Polytechnic", code: "KABETE-003", type: "tvet", county: "Nairobi", bank_name: "Equity Bank", bank_account_no: "0550123456" },
    { id: 4, name: "Nairobi Technical Training Institute", code: "NTTI-004", type: "tvet", county: "Nairobi", bank_name: "Co-operative Bank", bank_account_no: "0112987654" },
    { id: 5, name: "Dagoretti High School", code: "DAG-005", type: "secondary", county: "Nairobi", bank_name: "KCB Bank", bank_account_no: "1122334455" },
    { id: 6, name: "Kenya Medical Training College (KMTC)", code: "KMTC-006", type: "tvet", county: "Nairobi", bank_name: "National Bank", bank_account_no: "0100998877" },
    { id: 7, name: "Strathmore University", code: "STRATH-007", type: "university", county: "Nairobi", bank_name: "Standard Chartered", bank_account_no: "0102030405" },
    { id: 8, name: "St. Francis Special Needs School", code: "STF-008", type: "special_needs", county: "Nairobi", bank_name: "Co-operative Bank", bank_account_no: "0110332211" },
  ],
  demoUsers: [
    { id: 1, name: "Willy", role: "admin", designation: "Constituency Fund Manager / Super Admin", email: "admin@ngcdf.go.ke", national_id: "41354126" },
  ],
  applications: [],
  auditLogs: [],
  statistics: {
    total_applications: 0,
    verified_applications: 0,
    committee_recommended: 0,
    approved_beneficiaries: 0,
    total_budget: 30000000.0,
    allocated_amount: 0.0,
    disbursed_amount: 0.0,
  }
};

export const initialApplications = INITIAL_DATA.applications;
export const initialWards = INITIAL_DATA.wards;
export const initialInstitutions = INITIAL_DATA.institutions;
export const initialAuditLogs = INITIAL_DATA.auditLogs;
export const initialStatistics = INITIAL_DATA.statistics;
export const initialUsers = INITIAL_DATA.demoUsers;
