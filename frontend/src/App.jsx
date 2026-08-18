import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicationWizard from './pages/applicant/ApplicationWizard';
import CommitteeDashboard from './pages/committee/CommitteeDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import DocumentViewPage from './pages/public/DocumentViewPage';
import WafRedirectHandler from './components/WafRedirectHandler';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  return (
    <Router>
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/applicant/apply" element={<ApplicationWizard />} />
        <Route path="/committee" element={<CommitteeDashboard />} />
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/documents/view" element={<DocumentViewPage />} />
        <Route path="*" element={<WafRedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
