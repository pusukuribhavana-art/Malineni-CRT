import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  reload,
} from 'firebase/auth';
import {
  auth,
  sendEmailVerificationToUser,
  syncUserProfile,
  UserProfileData,
  parseAuthErrorMessage,
} from '../firebase';

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  loading: boolean;
  register: (name: string, email: string, pass: string) => Promise<User>;
  login: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  updateNameAndPhoto: (displayName: string, photoURL?: string, bio?: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProf = await syncUserProfile(currentUser);
          setProfile(userProf);
        } catch (e) {
          console.error('Failed to sync profile', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with Email & Password and send verification email automatically
  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const newUser = credential.user;

    // Update Firebase Auth profile display name
    await updateProfile(newUser, {
      displayName: name.trim(),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.uid}`,
    });

    // Send verification email right away
    try {
      await sendEmailVerificationToUser(newUser);
    } catch (verifErr) {
      console.warn('Could not automatically send verification email during signup:', verifErr);
    }

    // Sync with Firestore profile
    const prof = await syncUserProfile(newUser, {
      displayName: name.trim(),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUser.uid}`,
      emailVerified: newUser.emailVerified,
    });
    setProfile(prof);
    setUser(newUser);

    return newUser;
  };

  // Sign In with Email & Password
  const login = async (email: string, pass: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const loggedUser = credential.user;
    
    // Refresh user state
    await reload(loggedUser);
    const prof = await syncUserProfile(loggedUser);
    setUser(loggedUser);
    setProfile(prof);
    return loggedUser;
  };

  // Sign In with Google Provider
  const loginWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const loggedUser = credential.user;
    
    const prof = await syncUserProfile(loggedUser);
    setUser(loggedUser);
    setProfile(prof);
    return loggedUser;
  };

  // Sign Out
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  // Send Verification Email to current user
  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    await sendEmailVerificationToUser(auth.currentUser);
  };

  // Send Password Reset Email
  const sendResetPasswordEmail = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Update Display Name, Avatar, and Bio
  const updateNameAndPhoto = async (displayName: string, photoURL?: string, bio?: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user signed in');
    
    await updateProfile(auth.currentUser, {
      displayName: displayName.trim(),
      photoURL: photoURL || auth.currentUser.photoURL,
    });

    const updatedProf = await syncUserProfile(auth.currentUser, {
      displayName: displayName.trim(),
      ...(photoURL ? { photoURL } : {}),
      ...(bio !== undefined ? { bio } : {}),
    });

    setUser({ ...auth.currentUser } as User);
    setProfile(updatedProf);
  };

  // Change Password
  const changePassword = async (newPass: string): Promise<void> => {
    if (!auth.currentUser) throw new Error('No user signed in');
    await updatePassword(auth.currentUser, newPass);
  };

  // Check verification status by reloading user from Firebase servers
  const checkVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    const reloadedUser = auth.currentUser;
    setUser({ ...reloadedUser } as User);
    
    if (profile) {
      setProfile({
        ...profile,
        emailVerified: reloadedUser.emailVerified,
      });
    }
    return reloadedUser.emailVerified;
  };

  // Refresh entire user data
  const refreshUserData = async (): Promise<void> => {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    const prof = await syncUserProfile(auth.currentUser);
    setUser({ ...auth.currentUser } as User);
    setProfile(prof);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        sendVerificationEmail,
        sendResetPasswordEmail,
        updateNameAndPhoto,
        changePassword,
        checkVerificationStatus,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
