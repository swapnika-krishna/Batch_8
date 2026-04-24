import React, { useState } from 'react';
import { Search, Briefcase, Loader2, MapPin, Building2, ChevronRight } from 'lucide-react';
import { recommendJobs } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface JobAnalyzerProps {
  resumeAnalysis?: {
    matchedSkills: string[];
    missingSkills: string[];
    score: number;
    suggestion: string;
  } | null;
}

export default function JobAnalyzer({ resumeAnalysis }: JobAnalyzerProps) {
  const [skills, setSkills] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill skills from resume analysis and auto-trigger if first time
  React.useEffect(() => {
    if (resumeAnalysis?.matchedSkills && resumeAnalysis.matchedSkills.length > 0) {
      const skillsList = resumeAnalysis.matchedSkills.join(', ');
      setSkills(skillsList);
      
      // Auto-trigger if we don't have jobs yet
      if (jobs.length === 0 && !isLoading) {
        const triggerGenerate = async () => {
          setIsLoading(true);
          try {
            const result = await recommendJobs(skillsList, resumeAnalysis);
            setJobs(result);
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        };
        triggerGenerate();
      }
    }
  }, [resumeAnalysis]);

  const handleRefreshFromResume = () => {
    if (resumeAnalysis?.matchedSkills) {
      setSkills(resumeAnalysis.matchedSkills.join(', '));
    }
  };

  const handleGenerate = async () => {
    if (!skills.trim()) return;
    setIsLoading(true);
    try {
      const result = await recommendJobs(skills, resumeAnalysis);
      setJobs(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Job Match Analyzer</h2>
            <p className="text-muted-foreground">Finding roles that match your verified resume skills</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-primary uppercase mr-1">Strict Matching:</span> 
                Our AI will prioritize job roles that align perfectly with the skills extracted from your resume. 
                This ensures the highest probability of passing ATS filters.
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-sm font-medium">Verified Resume Skills</label>
              {resumeAnalysis?.matchedSkills && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-emerald-500/20">
                    ATS Verified
                  </span>
                  <button 
                    onClick={handleRefreshFromResume}
                    className="text-[10px] text-primary hover:underline font-medium"
                  >
                    Sync with Resume
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, Python, AWS, UI Design..."
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground font-mono">
                {skills.split(',').filter(s => s.trim()).length} Skills Detected
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!skills.trim() || isLoading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
            Analyze Career Opportunities
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm animate-pulse">Analyzing market trends for your skills...</p>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border rounded-xl p-6 hover:border-primary/50 transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                    {job.matchDetails && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10 inline-block">
                        <span className="font-bold uppercase mr-1">Why it matches:</span> {job.matchDetails}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <div className="text-2xl font-bold text-primary">{job.matchPercentage}%</div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Resume Match</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    Top Hiring Companies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.companies.map((company: string, j: number) => (
                      <span key={j} className="px-3 py-1 bg-muted rounded-full text-xs border hover:bg-primary/5 hover:border-primary/30 transition-colors">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : skills && !isLoading ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
              <p>Click generate to see job recommendations for your skills</p>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
