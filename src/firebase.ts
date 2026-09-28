import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reload,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  ActionCodeSettings,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyAzAE5y2khqS67uFV9DRU8ve-HprpfrfBM",
  authDomain: "aquaalert-ai-224ae.firebaseapp.com",
  projectId: "aquaalert-ai-224ae",
  storageBucket: "aquaalert-ai-224ae.firebasestorage.app",
  messagingSenderId: "862296561329",
  appId: "1:862296561329:web:d121b21c2e79f33010f490",
  measurementId: "G-XWBF790YT9"
};

// Initialize Firebase App singleton safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics Initialization
export const initAnalytics = async () => {
  try {
    if (typeof window !== 'undefined' && await isSupported()) {
      return getAnalytics(app);
    }
  } catch (err) {
    console.warn('Analytics initialization skipped:', err);
  }
  return null;
};
initAnalytics();

export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  role?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

// User-friendly error message parser for Firebase Authentication
export function parseAuthErrorMessage(error: any): { message: string; code: string; isConfigIssue: boolean } {
  const code = error?.code || 'auth/unknown';
  let message = 'An unexpected error occurred. Please try again.';
  let isConfigIssue = false;

  switch (code) {
    case 'auth/operation-not-allowed':
      message = 'Email/Password sign-in provider is not enabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method, click "Email/Password" and toggle Enable.';
      isConfigIssue = true;
      break;
    case 'auth/email-already-in-use':
      message = 'An account with this email address already exists. Please sign in instead.';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address format.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use at least 6 characters including letters, numbers, and symbols.';
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      message = 'Invalid email or password. Please verify your credentials and try again.';
      break;
    case 'auth/user-disabled':
      message = 'This user account has been disabled by an administrator.';
      break;
    case 'auth/too-many-requests':
      message = 'Access has been temporarily blocked due to multiple failed login attempts. Please reset your password or try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'The Google sign-in popup was closed before completing authentication.';
      break;
    case 'auth/unauthorized-domain':
      message = `This domain is not authorized in Firebase. Add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
      isConfigIssue = true;
      break;
    case 'auth/requires-recent-login':
      message = 'This action requires recent authentication for security. Please log out and sign back in to proceed.';
      break;
    case 'auth/missing-email':
      message = 'Please provide an email address.';
      break;
    case 'auth/missing-password':
      message = 'Please provide a password.';
      break;
    default:
      if (error?.message) {
        message = error.message.replace(/^Firebase:\s*/, '');
      }
      break;
  }

  return { message, code, isConfigIssue };
}

// Send verification email with custom action code settings fallback
export async function sendEmailVerificationToUser(user: User): Promise<void> {
  const actionCodeSettings: ActionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  try {
    await sendEmailVerification(user, actionCodeSettings);
  } catch (err: any) {
    // Fallback without actionCodeSettings if domain verification is strict
    try {
      await sendEmailVerification(user);
    } catch (fallbackErr) {
      throw fallbackErr;
    }
  }
}

// Sync or fetch profile in Firestore safely
export async function syncUserProfile(user: User, additionalData?: Partial<UserProfileData>): Promise<UserProfileData> {
  const defaultProfile: UserProfileData = {
    userId: user.uid,
    email: user.email || '',
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
    emailVerified: user.emailVerified,
    role: 'user',
    bio: '',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...additionalData
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const existing = snap.data() as UserProfileData;
      // Update emailVerified flag and updatedAt
      const updated = {
        ...existing,
        emailVerified: user.emailVerified,
        updatedAt: new Date().toISOString(),
        ...(additionalData || {})
      };
      await setDoc(userDocRef, updated, { merge: true });
      return updated;
    } else {
      await setDoc(userDocRef, defaultProfile);
      return defaultProfile;
    }
  } catch (err) {
    console.warn('Firestore profile sync fallback (using Auth state):', err);
    return defaultProfile;
  }
}
