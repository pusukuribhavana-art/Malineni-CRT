import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { AuthCard } from './components/AuthCard';
import { Dashboard } from './components/Dashboard';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import {
  ShieldCheck,
  MailCheck,
  KeyRound,
  Lock,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [guideOpen, setGuideOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference or default
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 animate-pulse flex items-center justify-center text-white shadow-xl shadow-cyan-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-400">
          Initializing Secure Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar
        onOpenGuide={() => setGuideOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Email Verification Alert Banner for signed-in unverified accounts */}
      <EmailVerificationBanner />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {user ? (
          /* Authenticated Dashboard */
          <Dashboard onOpenGuide={() => setGuideOpen(true)} />
        ) : (
          /* Unauthenticated Landing & Auth Forms */
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Visual Product Intro & Features */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100/80 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold border border-cyan-200 dark:border-cyan-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AquaAlert Secure Identity System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Secure Authentication &{' '}
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Email Verification
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Production-grade user management powered by Firebase Auth. Register with email verification safeguards, real-time password strength diagnostics, automated password reset flows, and full session synchronicity.
              </p>

              {/* Security Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 shrink-0">
                    <MailCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Automated Email Verification
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Sends verification links automatically upon signup, protecting your platform from invalid addresses and bots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Strict Password Complexity & Recovery
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time strength auditing, one-click password reset dispatch, and direct password updates with reauth fallback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Zero-Trust Access & Firebase Architecture
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pre-wired with standard Firestore security rules, token verification, and user profile persistence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firebase Guide button trigger */}
              <div className="pt-2">
                <button
                  onClick={() => setGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition"
                >
                  <span>Need help configuring Firebase Console sign-in providers?</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Authentication Card */}
            <div className="lg:col-span-6 flex justify-center">
              <AuthCard onOpenGuide={() => setGuideOpen(true)} />
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>AquaAlert AI • Firebase Authentication & User Management</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setGuideOpen(true)}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            >
              Firebase Configuration Docs
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-400">Project: aquaalert-ai-224ae</span>
          </div>
        </div>
      </footer>

      {/* Firebase Setup Guide Modal */}
      <FirebaseGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
