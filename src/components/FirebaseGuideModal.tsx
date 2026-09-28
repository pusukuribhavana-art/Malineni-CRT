import React from 'react';
import { X, CheckCircle, ExternalLink, ShieldCheck, Key, Globe, Mail, AlertCircle } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Firebase Project & Authentication Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected to project: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">{firebaseConfig.projectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Configuration details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-cyan-500" />
              Active Firebase Web Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Project ID</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{firebaseConfig.projectId}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Auth Domain</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{firebaseConfig.authDomain}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Storage Bucket</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{firebaseConfig.storageBucket}</span>
              </div>
            </div>
          </div>

          {/* Setup checklist for the user */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Required Firebase Console Settings for Full Functionality:
            </h4>

            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Enable "Email/Password" Sign-in Provider
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  In Firebase Console, navigate to <strong>Build &gt; Authentication &gt; Sign-in method</strong>. Click on <strong>Email/Password</strong> and toggle <strong>Enable</strong>. (Passwordless/Email link is optional).
                </p>
                <div className="pt-1">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 underline"
                  >
                    Open Firebase Sign-in Methods
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Email Verification & Action URL Settings
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Firebase automatically handles email verification links. When a user clicks the verification link in their email, Firebase verifies their account and directs them back to your web app. You can customize the email template in <strong>Authentication &gt; Templates &gt; Email address verification</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Authorized Domains (Optional for Google Sign-In)
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If using Google Sign-in popup or strict action links, ensure the current host domain (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">{typeof window !== 'undefined' ? window.location.hostname : 'current domain'}</code>) is added to <strong>Authentication &gt; Settings &gt; Authorized domains</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
