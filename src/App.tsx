import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Lightbulb, Briefcase, Menu, X, Moon, Sun, Search, ChevronRight, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudyBuddy from './components/StudyBuddy';
import IdeaGenerator from './components/IdeaGenerator';
import PlacementCoach from './components/PlacementCoach';
import JobAnalyzer from './components/JobAnalyzer';
import Login from './components/Login';
import { cn } from './lib/utils';
import { auth, onAuthStateChanged, signOut, User, db, UserProfile, handleFirestoreError } from './lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

type Tab = 'home' | 'study' | 'ideas' | 'placement' | 'jobs';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Auth & Profile Listener
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        setIsProfileLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setIsResumeUploaded(data.isResumeUploaded || false);
            setResumeAnalysis(data.resumeAnalysis || null);
          }
          setIsProfileLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          setIsProfileLoading(false);
        });
      } else {
        setIsResumeUploaded(false);
        setResumeAnalysis(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Initialize dark mode and handle custom tab change events
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const handleTabChange = (e: any) => {
      if (e.detail) setActiveTab(e.detail as Tab);
    };
    
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'study', label: 'Study Buddy', icon: BookOpen, protected: true },
    { id: 'ideas', label: 'Innovation', icon: Lightbulb, protected: true },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'jobs', label: 'Analyze Jobs', icon: Search, protected: true },
  ];

  const renderLockedState = (title: string) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center py-20 px-8 bg-card border-2 border-primary/10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="w-24 h-24 bg-primary/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] flex items-center justify-center mx-auto relative z-10">
        <Briefcase className="w-12 h-12 text-primary" />
      </div>
      <div className="space-y-4 relative z-10">
        <h2 className="text-3xl font-bold tracking-tight">{title} Locked</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          To unlock this feature and get personalized AI assistance, please upload your resume in the Placement Coach section first.
        </p>
      </div>
      <button
        onClick={() => setActiveTab('placement')}
        className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 relative z-10"
      >
        Go to Placement Coach
      </button>
    </motion.div>
  );

  if (!isAuthReady || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-medium animate-pulse">Syncing SkillNova...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="p-1.5 bg-primary rounded-lg text-primary-foreground group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">SkillNova</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground shadow-sm scale-110 z-10" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground scale-95"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.protected && !isResumeUploaded && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                  )}
                </button>
              ))}
              <div className="ml-4 pl-4 border-l flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-background"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center justify-between transition-all",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground scale-[1.05] z-10" 
                        : "hover:bg-muted text-muted-foreground scale-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {item.protected && !isResumeUploaded && (
                      <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-accent-foreground/10">
                        Locked
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-all font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="relative max-w-4xl mx-auto mb-24">
                <div className="absolute inset-0 bg-primary/5 -rotate-2 rounded-[2rem] translate-x-2 translate-y-2" />
                <div className="relative bg-card border-2 border-primary/10 rounded-[2rem] p-10 md:p-24 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 text-center space-y-6">
                    <h1 className="text-4xl md:text-7xl font-display font-bold tracking-tight leading-tight">
                      Empowering <span className="text-primary">BTech Students</span> with AI
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                      A unified ecosystem designed to accelerate your learning, spark innovation, and boost your career prospects.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
                {[
                  {
                    id: 'study',
                    title: 'AI Study Buddy',
                    desc: 'Get instant academic help and subject-specific tutoring 24/7.',
                    icon: BookOpen,
                    color: 'bg-primary/10 text-primary',
                  },
                  {
                    id: 'ideas',
                    title: 'Innovation Hub',
                    desc: 'Generate cutting-edge project ideas across 12+ technical domains.',
                    icon: Lightbulb,
                    color: 'bg-primary/20 text-primary',
                  },
                  {
                    id: 'placement',
                    title: 'Placement Coach',
                    desc: 'Analyze your resume against top companies and bridge skill gaps.',
                    icon: Briefcase,
                    color: 'bg-primary/15 text-primary',
                  },
                  {
                    id: 'jobs',
                    title: 'Analyze Jobs',
                    desc: 'Find the best career paths based on your current skills.',
                    icon: Search,
                    color: 'bg-primary/25 text-primary',
                  },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id as Tab)}
                    className="group p-8 bg-card border-2 border-transparent hover:border-primary/20 rounded-[2.5rem] text-left hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative w-16 h-16 flex items-center justify-center mb-8">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl group-hover:rounded-3xl transition-all duration-500" />
                      <feature.icon className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore Feature <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 -ml-12 -mt-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 -mr-12 -mb-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="flex-1 space-y-6 relative z-10">
                  <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">Ready to excel in your engineering journey?</h2>
                  <button 
                    onClick={() => setActiveTab('study')}
                    className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                  >
                    Get Started Now
                  </button>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6 relative z-10">
                   <div className="p-6 bg-card border-2 border-primary/5 rounded-3xl text-center space-y-2 shadow-sm">
                     <div className="text-3xl font-bold text-primary">24/7</div>
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Availability</div>
                   </div>
                   <div className="p-6 bg-card border-2 border-primary/5 rounded-3xl text-center space-y-2 shadow-sm">
                     <div className="text-3xl font-bold text-primary">12+</div>
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Domains</div>
                   </div>
                   <div className="p-6 bg-card border-2 border-primary/5 rounded-3xl text-center space-y-2 shadow-sm">
                     <div className="text-3xl font-bold text-primary">100%</div>
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">AI Powered</div>
                   </div>
                   <div className="p-6 bg-card border-2 border-primary/5 rounded-3xl text-center space-y-2 shadow-sm">
                     <div className="text-3xl font-bold text-primary">Free</div>
                     <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">For Students</div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isResumeUploaded ? <StudyBuddy resumeAnalysis={resumeAnalysis} /> : renderLockedState('Study Buddy')}
            </motion.div>
          )}

          {activeTab === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isResumeUploaded ? <IdeaGenerator resumeAnalysis={resumeAnalysis} /> : renderLockedState('Innovation Hub')}
            </motion.div>
          )}

          {activeTab === 'placement' && (
            <motion.div
              key="placement"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <PlacementCoach onUploadSuccess={(analysis) => {
                setIsResumeUploaded(true);
                setResumeAnalysis(analysis);
              }} />
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isResumeUploaded ? <JobAnalyzer resumeAnalysis={resumeAnalysis} /> : renderLockedState('Job Analyzer')}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-medium">SkillNova</p>
          <p className="text-xs text-muted-foreground">© 2026 BUILT BY Batch 8. Built for BTech Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
