import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function WafRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pdata = searchParams.get('pdata');
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('access_token', token);
      navigate('/applicant', { replace: true });
      return;
    }

    if (pdata) {
      try {
        const decodedUrl = decodeURIComponent(pdata);
        const urlObj = new URL(decodedUrl);
        navigate(urlObj.pathname || '/login', { replace: true });
        return;
      } catch (e) {
        // parsing fallback
      }
    }

    // Default fallback to home or login
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      navigate('/applicant', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
      <div className="flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-300">Completing Security Verification...</span>
      </div>
    </div>
  );
}
