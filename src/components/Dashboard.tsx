import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Key,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Send,
  Calendar,
  Clock,
  Edit3,
  Save,
  Lock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Code,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseAuthErrorMessage, firebaseConfig } from '../firebase';

interface Props {
  onOpenGuide: () => void;
}

export const Dashboard: React.FC<Props> = ({ onOpenGuide }) => {
  const {
    user,
    profile,
    logout,
    sendVerificationEmail,
    checkVerificationStatus,
    updateNameAndPhoto,
    changePassword,
    sendResetPasswordEmail,
    refreshUserData,
  } = useAuth();

  // Edit profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid}`
  );

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Action status feedbacks
  const [copiedUid, setCopiedUid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Avatar presets
  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || '1'}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Aqua`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=Security`,
  ];

  if (!user) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleVerificationCheck = async () => {
    setVerifying(true);
    setStatusNotification(null);
    try {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        setStatusNotification({
          type: 'success',
          text: 'Email verified successfully! Your account is now fully confirmed.',
        });
      } else {
        setStatusNotification({
          type: 'error',
          text: 'Email is not yet verified. Please verify using the email link sent to you.',
        });
      }
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusNotification({ type: 'error', text: parsed.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setStatusNotification(null);
    try {
      await sendVerificationEmail();
      setStatusNotification({
        type: 'success',
        text: `Verification link sent to ${user.email}! Please check inbox and spam.`,
      });
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusNotification({ type: 'error', text: parsed.message });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusNotification(null);
    try {
      await updateNameAndPhoto(displayName, selectedAvatar, bio);
      setIsEditingProfile(false);
      setStatusNotification({
        type: 'success',
        text: 'Profile details updated successfully.',
      });
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusNotification({ type: 'error', text: parsed.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusNotification({
        type: 'error',
        text: 'New password must contain at least 6 characters.',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatusNotification({
        type: 'error',
        text: 'Password confirmation does not match.',
      });
      return;
    }

    setPasswordUpdating(true);
    setStatusNotification(null);
    try {
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
      setStatusNotification({
        type: 'success',
        text: 'Password changed successfully! Keep your new credentials safe.',
      });
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusNotification({ type: 'error', text: parsed.message });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user.email) return;
    setStatusNotification(null);
    try {
      await sendResetPasswordEmail(user.email);
      setStatusNotification({
        type: 'success',
        text: `Password reset email dispatched to ${user.email}. Follow the instructions in the email.`,
      });
    } catch (err: any) {
      const parsed = parseAuthErrorMessage(err);
      setStatusNotification({ type: 'error', text: parsed.message });
    }
  };

  const creationDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  const lastLoginDate = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  const providerId = user.providerData?.[0]?.providerId || 'password';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      {statusNotification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 duration-300 ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            {statusNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{statusNotification.text}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt="Profile Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border-2 border-cyan-500/30 p-1 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                  user.emailVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
                title={user.emailVerified ? 'Email Verified' : 'Email Unverified'}
              >
                {user.emailVerified ? <Check className="w-3 h-3" /> : '!'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.displayName || user.displayName || 'Authorized User'}
                </h2>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Verification Pending
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-cyan-500" />
                {user.email}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                  <span>UID: {user.uid.slice(0, 10)}...</span>
                  <button
                    onClick={() => copyToClipboard(user.uid)}
                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                    title="Copy full UID"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>

                <span className="text-[11px] bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-md font-medium border border-cyan-200 dark:border-cyan-800">
                  Provider: {providerId}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingProfile ? 'Close Editor' : 'Edit Profile'}
            </button>

            <button
              onClick={refreshUserData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 transition border border-cyan-200/60 dark:border-cyan-800/60"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Session
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 transition border border-rose-200/60 dark:border-rose-800/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Editor Collapse */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bio / Status
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Software Engineer, AquaAlert User..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Choose Avatar
              </label>
              <div className="flex flex-wrap gap-2.5">
                {avatarPresets.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-12 h-12 rounded-xl p-1 border-2 transition ${
                      selectedAvatar === avatar
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/60'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <img src={avatar} alt="Avatar option" className="w-full h-full rounded-lg" />
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Grid: Email Verification Card + Security / Password Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Email Verification & Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2.5 rounded-xl ${
                    user.emailVerified
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Email Verification Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time status synced with Firebase Auth
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  user.emailVerified
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {user.emailVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Registered Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Verification Flag:</span>
                <span
                  className={`font-semibold ${
                    user.emailVerified ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {user.emailVerified ? 'true (Active)' : 'false (Awaiting confirmation)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Last Checked:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">Just now</span>
              </div>
            </div>

            {user.emailVerified ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <p className="leading-relaxed">
                  Your email address is verified! You can reset passwords, receive notifications, and access all protected features safely.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <p className="leading-relaxed">
                  We sent an email verification link to <strong>{user.email}</strong>. Open the link in your email and then click <strong>"Check Verification Status"</strong> below.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 flex flex-wrap gap-2.5">
            <button
              onClick={handleVerificationCheck}
              disabled={verifying}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Verifying with Firebase...' : 'Check Verification Status'}
            </button>

            {!user.emailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {resendingEmail ? 'Sending...' : 'Resend Email'}
              </button>
            )}
          </div>
        </div>

        {/* Security & Password Management Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Security & Credentials
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update password or trigger recovery
                  </p>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordUpdating || !newPassword}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                {passwordUpdating ? 'Updating Password...' : 'Update Password Directly'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Prefer Email Password Reset?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Firebase sends an official password reset link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition"
                >
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>If prompted for re-authentication, sign out and sign back in.</span>
          </div>
        </div>

      </div>

      {/* Account Metadata & Firebase Diagnostics */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Firebase Account Diagnostics & Timestamps
            </h3>
          </div>
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 underline"
          >
            Firebase Console Documentation
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Account Created
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{creationDate}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Last Sign In
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{lastLoginDate}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Project ID</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{firebaseConfig.projectId}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px] mb-1">Auth Domain</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{firebaseConfig.authDomain}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
