import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // Check if user dismissed prompt recently (7 days)
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isAppleIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(isAppleIOS);

    if (isAppleIOS) {
      setShowPrompt(true);
    }

    // Capture standard install prompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (installed || !showPrompt) return null;

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-short">
        <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 backdrop-blur-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-400/30 flex-shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white leading-tight">Install Bursary App</h4>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Official PWA
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 leading-tight">
                {isIOS ? 'Add to Home Screen for fast mobile access' : 'Fast, offline-ready government portal app'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition text-emerald-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-500/20"
            >
              <Download size={14} />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-emerald-300/70 hover:text-white rounded-lg hover:bg-emerald-800/50 transition"
              aria-label="Close prompt"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Modal Installation Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="text-emerald-700" size={20} />
                <h3 className="font-bold text-slate-900">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <p className="text-slate-600">
                  Tap the <strong className="text-slate-900 inline-flex items-center gap-1">Share button <Share size={14} className="text-blue-600 inline" /></strong> in Safari's bottom toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <p className="text-slate-600">
                  Scroll down the menu options and tap <strong className="text-slate-900">Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <p className="text-slate-600">
                  Tap <strong className="text-slate-900">Add</strong> in the top right corner. Enjoy your app!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-2 py-2.5 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
