import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function WafRedirectHandler() {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pdata = searchParams.get('pdata');
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('access_token', token);
      window.location.href = '/applicant';
      return;
    }

    if (pdata) {
      try {
        let decoded = pdata;
        // Recursively decode double/triple URL-encoded strings from WAF
        for (let i = 0; i < 5; i++) {
          if (!decoded.includes('%')) break;
          const prev = decoded;
          decoded = decodeURIComponent(decoded);
          if (decoded === prev) break;
        }

        if (decoded.includes('://')) {
          const urlObj = new URL(decoded);
          window.location.href = urlObj.pathname + urlObj.search;
          return;
        } else if (decoded.startsWith('/')) {
          window.location.href = decoded;
          return;
        }
      } catch (e) {
        console.error("WAF URL decode error:", e);
      }
    }

    // Default fallback: Redirect to saved token dashboard or login
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      window.location.href = '/applicant';
    } else {
      window.location.href = '/login';
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
      <div className="flex items-center gap-3 bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-300">Completing Security Verification...</span>
      </div>
    </div>
  );
}
