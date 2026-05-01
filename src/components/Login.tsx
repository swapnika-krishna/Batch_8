import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LogIn, Loader2, Sparkles, AlertCircle, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock login data
      const mockUser = {
        uid: 'mock_google_' + Math.random().toString(36).substr(2, 9),
        email: 'student@google.com',
        displayName: 'Google Student',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
      };
      localStorage.setItem('skillnova_mock_user', JSON.stringify(mockUser));
      window.location.reload(); // Refresh to trigger App state update
    } catch (err: any) {
      console.error('Google Login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simple mock validation
      if (email.length < 5 || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters');
      }

      // Mock user data
      const mockUser = {
        uid: 'mock_email_' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: displayName || email.split('@')[0],
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };

      localStorage.setItem('skillnova_mock_user', JSON.stringify(mockUser));
      window.location.reload(); // Refresh to trigger App state update
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
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
          By signing in, you agree to our terms of service and academic integrity policies.
        </p>
      </motion.div>
    </div>
  );
}

