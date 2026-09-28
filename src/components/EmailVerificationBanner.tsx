import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle, RefreshCw, Send, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseAuthErrorMessage } from '../firebase';

export const EmailVerificationBanner: React.FC = () => {
  const { user, sendVerificationEmail, checkVerificationStatus } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setStatusMessage(null);
    try {
      await sendVerificationEmail();
      setStatusMessage({
        type: 'success',
        text: `Verification link dispatched to ${user.email}! Please check your inbox and spam folder.`,
      });
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusMessage({
        type: 'error',
        text: parsed.message,
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        setStatusMessage({
          type: 'success',
          text: 'Congratulations! Your email address has been successfully verified.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Email is still unverified. Please make sure you clicked the link in your email, then click this button again.',
        });
      }
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusMessage({
        type: 'error',
        text: parsed.message,
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-300/40 dark:border-amber-600/30 px-4 py-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Email Verification Required
              </h4>
              <span className="text-[11px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                Unverified
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              A verification link was sent to{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-medium">
                {user.email}
              </strong>
              . Verify your email to secure your account and unlock all features.
            </p>

            {statusMessage && (
              <div
                className={`mt-2 text-xs flex items-center gap-1.5 font-medium ${
                  statusMessage.type === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : "I've Verified (Check Status)"}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {resending
              ? 'Sending...'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
