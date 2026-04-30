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

function MovingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] dark:bg-primary/10"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] dark:bg-secondary/10"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[120px] dark:bg-accent/10"
      />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 6 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{
            x: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%"
            ],
            y: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%"
            ],
            rotate: [0, 180, 360],
            opacity: [0, 0.1, 0]
          }}
          transition={{
            duration: 15 + Math.random() * 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-32 h-32 bg-primary/10 rounded-full blur-3xl"
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const syncUserToFirestore = async (user: any, name?: string) => {
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
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!displayName.trim()) throw new Error('Please enter your name');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await syncUserToFirestore(result.user, displayName);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(result.user);
      }
    } catch (err: any) {
      console.error('Email Auth error:', err);
      let message = 'An error occurred during authentication.';
      if (err.code === 'auth/user-not-found') message = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') message = 'Incorrect password.';
      else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead of creating a new account.';
        setIsSignUp(false); // Automatically switch to Sign In mode for convenience
      }
      else if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      else if (err.code === 'auth/operation-not-allowed') message = 'Email/Password sign-in is not enabled in Firebase Console. Please enable it in the Authentication tab.';
      else message = err.message;
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <MovingBackground />
      <FloatingParticles />
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://picsum.photos/seed/nebula/1920/1080')] opacity-[0.03] mix-blend-overlay grayscale" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/40 border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-8">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-primary/5"
            >
              <GraduationCap className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">SkillNova</h1>
              <p className="text-sm text-muted-foreground">Your AI-Powered BTech Career Copilot</p>
            </div>
          </div>

          <div className="space-y-6">
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
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@college.edu"
                    className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl py-3 pl-12 pr-4 outline-none transition-all placeholder:text-muted-foreground/50"
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
              className="w-full bg-background border-2 border-primary/10 text-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-muted transition-all shadow-lg shadow-black/5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
                  Sign in with Google
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm border border-destructive/20 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

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
        
        <p className="mt-8 text-center text-[10px] text-muted-foreground opacity-50 px-8 leading-relaxed">
          BY SIGNING IN, YOU AGREE TO OUR TERMS OF SERVICE AND ACADEMIC INTEGRITY POLICIES.
          SECURED BY FIREBASE AUTHENTICATION.
        </p>
      </motion.div>
    </div>
  );
}
