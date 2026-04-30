import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Lightbulb, Briefcase, Menu, X, Moon, Sun, Search, ChevronRight, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import StudyBuddy from './components/StudyBuddy';
import IdeaGenerator from './components/IdeaGenerator';
import PlacementCoach from './components/PlacementCoach';
import JobAnalyzer from './components/JobAnalyzer';
import NearbyJobs from './components/NearbyJobs';
import Login from './components/Login';
import { cn } from './lib/utils';
import { auth, onAuthStateChanged, signOut, User, db, UserProfile, handleFirestoreError } from './lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

function MovingBackground() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        style={{ y: y1 }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] dark:bg-primary/10"
      />
      <motion.div
        style={{ y: y2 }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] dark:bg-secondary/10"
      />
      <motion.div
        style={{ y: y3 }}
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
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

function InteractiveGradients({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none opacity-40">
      <motion.div 
        animate={{ 
          x: mousePos.x * 20, 
          y: mousePos.y * 20,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-[120px]"
      />
      <motion.div 
        animate={{ 
          x: -mousePos.x * 30, 
          y: -mousePos.y * 30,
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-[70%_30%_50%_50%/30%_30%_70%_70%] blur-[150px]"
      />
      <motion.div 
        animate={{ 
          x: mousePos.x * -15, 
          y: mousePos.y * 40,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"
      />
    </div>
  );
}

function CursorTrail({ mousePos }: { mousePos: { x: number; y: number } }) {
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);
  
  useEffect(() => {
    const newPoint = { x: mousePos.x, y: mousePos.y, id: Date.now() };
    setTrail(prev => [...prev.slice(-20), newPoint]);
  }, [mousePos]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {trail.map((point, i) => (
        <motion.div
          key={point.id}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-primary/40 rounded-full blur-[1px]"
          style={{
            left: `calc(50% + ${point.x * 50}px)`,
            top: `calc(50% + ${point.y * 50}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

function Magnetic({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    if (Math.abs(distanceX) < 100 && Math.abs(distanceY) < 100) {
      setPosition({ x: distanceX * 0.2, y: distanceY * 0.2 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const { x, y } = position;
  return (
    <motion.div
      ref={ref}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

function RisingLines({ mousePos }: { mousePos: { x: number; y: number } }) {
  const lines = Array.from({ length: 15 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-20">
      {lines.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: "110%",
            height: Math.random() * 80 + 20,
            width: "1px"
          }}
          animate={{
            y: ["110%", "-20%"],
          }}
          style={{
            translateX: mousePos.x * (i % 5 + 5),
          }}
          transition={{
            duration: 10 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute bg-primary"
        />
      ))}
    </div>
  );
}

function FloatingParticles({ mousePos }: { mousePos: { x: number; y: number } }) {
  const particles = Array.from({ length: 25 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 1;
        return (
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
              ],
              y: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
              opacity: [0, 0.4, 0],
              scale: [0, size, 0]
            }}
            style={{
              translateX: mousePos.x * (i % 10 + 2),
              translateY: mousePos.y * (i % 10 + 2),
              width: size,
              height: size,
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bg-primary rounded-full"
          />
        );
      })}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent)]" />
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, rotateX: -15, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    rotateX: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      staggerChildren: 0.1
    }
  }
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
};

type Tab = 'home' | 'study' | 'ideas' | 'placement' | 'jobs' | 'nearby';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
      style={{ scaleX }}
    />
  );
}

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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setMousePos({ x: moveX, y: moveY });
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'study', label: 'Study Buddy', icon: BookOpen, protected: true },
    { id: 'ideas', label: 'Innovation', icon: Lightbulb, protected: true },
    { id: 'placement', label: 'Placement', icon: Briefcase },
    { id: 'jobs', label: 'Analyze Jobs', icon: Search, protected: true },
    { id: 'nearby', label: 'Nearby', icon: Search, protected: true },
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
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative selection:bg-primary/30"
    >
      <ScrollProgress />
      <MovingBackground />
      <InteractiveGradients mousePos={mousePos} />
      <RisingLines mousePos={mousePos} />
      <FloatingParticles mousePos={mousePos} />
      <CursorTrail mousePos={mousePos} />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Magnetic>
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setActiveTab('home')}
              >
                <div className="p-1.5 bg-primary rounded-lg text-primary-foreground group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xl font-display font-bold tracking-tight">SkillNova</span>
              </div>
            </Magnetic>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-muted/30 rounded-full backdrop-blur-sm border border-border/50">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative",
                    activeTab === item.id 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.protected && !isResumeUploaded && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background z-20" />
                  )}
                </button>
              ))}
              <div className="ml-2 pl-2 border-l border-border/50 flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-muted transition-colors relative group"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-100 transition-transform" />
                </button>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-all group"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden border-t bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center justify-between transition-all",
                      activeTab === item.id 
                        ? "bg-primary text-primary-foreground scale-[1.02]" 
                        : "hover:bg-muted text-muted-foreground"
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
                  </motion.button>
                ))}
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-all font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </motion.button>
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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <motion.div 
                animate={{ 
                  rotateX: -mousePos.y, 
                  rotateY: mousePos.x 
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative max-w-4xl mx-auto mb-24 perspective-1000"
              >
                <div className="absolute inset-0 bg-primary/5 -rotate-2 rounded-[2rem] translate-x-2 translate-y-2" />
                <motion.div 
                  variants={itemVariants}
                  className="relative bg-card/50 backdrop-blur-xl border-2 border-primary/10 rounded-[2rem] p-10 md:p-24 shadow-2xl overflow-hidden shadow-primary/10"
                >
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 text-center space-y-6">
                    <motion.h1 
                      variants={containerVariants}
                      className="text-4xl md:text-7xl font-display font-bold tracking-tight leading-tight"
                    >
                      {"Empowering BTech Students with AI".split(" ").map((word, i) => (
                        <motion.span
                          key={i}
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 }
                          }}
                          className="inline-block mr-3"
                        >
                          {word === "BTech" || word === "Students" ? (
                            <span className="text-primary bg-primary/5 px-3 rounded-2xl border border-primary/10">{word}</span>
                          ) : word}
                        </motion.span>
                      ))}
                    </motion.h1>
                    <motion.p 
                      variants={itemVariants}
                      className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                      A unified ecosystem designed to accelerate your learning, spark innovation, and boost your career prospects.
                    </motion.p>
                    <motion.div variants={itemVariants} className="pt-4 flex justify-center">
                      <Magnetic>
                        <button 
                          onClick={() => setActiveTab('study')}
                          className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                        >
                          Get Started
                        </button>
                      </Magnetic>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12"
              >
                {[
                  {
                    id: 'study',
                    title: 'AI Study Buddy',
                    desc: 'Get instant academic help and subject-specific tutoring 24/7.',
                    icon: BookOpen,
                  },
                  {
                    id: 'ideas',
                    title: 'Innovation Hub',
                    desc: 'Generate cutting-edge project ideas across 12+ technical domains.',
                    icon: Lightbulb,
                  },
                  {
                    id: 'placement',
                    title: 'Placement Coach',
                    desc: 'Analyze your resume against top companies and bridge skill gaps.',
                    icon: Briefcase,
                  },
                  {
                    id: 'jobs',
                    title: 'Analyze Jobs',
                    desc: 'Find the best career paths based on your current skills.',
                    icon: Search,
                  },
                ].map((feature, i) => (
                  <motion.button
                    key={feature.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -15, 
                      rotate: i % 2 === 0 ? 0.5 : -0.5,
                      boxShadow: "0 25px 50px -12px rgba(var(--primary), 0.15)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={floatingAnimation}
                    onClick={() => setActiveTab(feature.id as Tab)}
                    className="group p-8 bg-card/40 backdrop-blur-lg border-2 border-transparent hover:border-primary/20 rounded-[2.5rem] text-left hover:shadow-2xl transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="relative w-16 h-16 flex items-center justify-center mb-8">
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl group-hover:rounded-3xl transition-all duration-500" />
                      <feature.icon className="w-8 h-8 text-primary relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                      Explore Feature <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>

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

          {activeTab === 'nearby' && (
            <motion.div
              key="nearby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {isResumeUploaded ? <NearbyJobs resumeAnalysis={resumeAnalysis} /> : renderLockedState('Nearby Jobs')}
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
