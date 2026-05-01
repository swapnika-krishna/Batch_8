import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LogIn, Loader2, Sparkles, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UnifiedBackground, CursorTrail } from './AnimatedBackground';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setMousePos({ x: moveX, y: moveY });
  };

  const syncUserToFirestore = async (user: any, name?: string) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: name || user.displayName || 'User',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          createdAt: serverTimestamp(),
          isResumeUploaded: false
        });
      }
    } catch (err) {
      console.error('Firestore sync error:', err);
      // We don't throw here to avoid blocking login if firestore is down but auth worked
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToFirestore(result.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-after-delay') {
        return;
      }
      console.error('Google Login error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    const emailToUse = email.trim();
    const passwordToUse = password;

    try {
      if (isSignUp) {
        if (!displayName.trim()) throw new Error('Please enter your name');
        if (passwordToUse.length < 6) throw new Error('Password must be at least 6 characters');
        
        const result = await createUserWithEmailAndPassword(auth, emailToUse, passwordToUse);
        await updateProfile(result.user, { displayName: displayName.trim() });
        await syncUserToFirestore(result.user, displayName.trim());
      } else {
        const result = await signInWithEmailAndPassword(auth, emailToUse, passwordToUse);
        await syncUserToFirestore(result.user);
      }
    } catch (err: any) {
      console.error('Email Auth error:', err);
      let message = 'An error occurred during authentication.';
      
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Email sign-in is not enabled. Please go to your Firebase Console > Authentication > Sign-in method and enable "Email/Password".';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection or Firebase configuration.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked. Please allow popups for this site and try again.';
      } else if (err.message && err.message.includes('permission-denied')) {
        message = 'Firebase Permission Denied. This usually means Firestore rules are blocking the user profile creation.';
      } else if (err.message) {
        message = `Firebase Error: ${err.message}`;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
    >
      <UnifiedBackground mousePos={mousePos} />
      <CursorTrail mousePos={mousePos} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 mx-auto"
      >
        <div className="bg-card/40 border-[1.5px] border-primary/10 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-300">
          {/* Logo & Header */}
          <div className="text-center space-y-4 mb-8">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-primary/5"
            >
              <GraduationCap className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">SkillNova</h1>
              <p className="text-sm text-muted-foreground font-medium max-w-[250px] mx-auto leading-tight">Your AI-Powered BTech Career Copilot</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
<div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@college.edu"
                    className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground font-bold">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-background/50 border-2 border-primary/10 text-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-muted transition-all shadow-lg shadow-black/5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
              Sign in with Google
            </button>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-primary font-bold">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="text-primary font-bold">Sign Up</span></>
              )}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-muted-foreground opacity-50 px-8 leading-relaxed uppercase font-bold tracking-tighter">
          By signing in, you agree to our terms of service and academic integrity policies. Secured by Firebase.
        </p>
      </motion.div>
    </div>
  );
}

