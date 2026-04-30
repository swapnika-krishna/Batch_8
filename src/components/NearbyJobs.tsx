import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, Search, Briefcase, MapPinOff, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getNearbyJobs } from '../services/geminiService';

interface NearbyJobsProps {
  resumeAnalysis: any;
}

interface JobOpportunity {
  title: string;
  company: string;
  description: string;
  matchDifficulty: string;
  locationSnippet: string;
}

export default function NearbyJobs({ resumeAnalysis }: NearbyJobsProps) {
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async (loc: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getNearbyJobs(loc, resumeAnalysis);
      setJobs(result);
    } catch (err) {
      setError('Failed to fetch jobs for this location.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, I'd use reverse geocoding here. 
        // For this demo, I'll pass coordinates to Gemini which can handle "latitude X, longitude Y" descriptions
        const locString = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
        setLocation(locString);
        await fetchJobs(locString);
      },
      (err) => {
        setError('Location access denied or unavailable.');
        setIsLoading(false);
        console.error(err);
      }
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchJobs(location);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Nearby Opportunities</h2>
            <p className="text-muted-foreground">Find tech roles in your vicinity or any custom location.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Option 1: Auto-Detect</h3>
            <button
              onClick={handleDetectLocation}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 border-2 border-transparent hover:border-secondary-foreground/10"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              Use My Current Location
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Option 2: Manual Location</h3>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter city or region"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !location.trim()}
                className="bg-primary text-primary-foreground p-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-center gap-3"
          >
            <MapPinOff className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-4"
          >
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Scanning regional markets for {location}...</p>
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div
            key="results"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {jobs.map((job, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest",
                      job.matchDifficulty === 'Beginner' ? "bg-green-500/10 text-green-500" :
                      job.matchDifficulty === 'Intermediate' ? "bg-amber-500/10 text-amber-500" :
                      "bg-primary/10 text-primary"
                    )}>
                      {job.matchDifficulty}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                    <p className="text-sm font-semibold text-muted-foreground">{job.company}</p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary" />
                      {job.locationSnippet}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : !isLoading && location && (
           <div className="text-center py-24 text-muted-foreground bg-muted/20 border-2 border-dashed border-border/50 rounded-[3rem]">
             <p className="text-lg font-medium">No regional jobs found for this query.</p>
             <p className="text-sm">Try searching for a larger city or broader region.</p>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
