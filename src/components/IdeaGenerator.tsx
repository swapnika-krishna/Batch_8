import React, { useState } from 'react';
import { Lightbulb, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { generateInnovationIdeas } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

const DOMAINS = [
  { value: 'ai_ml', label: 'AI & Machine Learning' },
  { value: 'app_dev', label: 'App Development' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'cyber_security', label: 'Cyber Security' },
  { value: 'cloud_computing', label: 'Cloud Computing' },
  { value: 'iot', label: 'Internet of Things' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'ar_vr', label: 'AR / VR' },
  { value: 'uiux', label: 'UI / UX Design' },
];

interface IdeaGeneratorProps {
  resumeAnalysis?: any;
}

export default function IdeaGenerator({ resumeAnalysis }: IdeaGeneratorProps) {
  const [domain, setDomain] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!domain) return;
    setIsLoading(true);
    setSearchQuery('');
    try {
      const result = await generateInnovationIdeas(domain, resumeAnalysis);
      setIdeas(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIdeas = ideas.filter(idea => 
    idea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Innovation Hub</h2>
              <p className="text-muted-foreground text-sm">Generating 30+ unique concepts for your next project</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:w-auto">
            <div className="relative min-w-[240px]">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="" className="bg-background text-foreground">Select Domain</option>
                {DOMAINS.map((d) => (
                  <option key={d.value} value={d.label} className="bg-background text-foreground">
                    {d.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!domain || isLoading}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Hub
            </button>
          </div>
        </div>

        {ideas.length > 0 && !isLoading && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search through ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Curating 30+ Tech Frontiers</p>
                <p className="text-sm">Synthesizing innovative concepts for {domain}...</p>
              </div>
            </div>
          ) : filteredIdeas.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredIdeas.map((idea, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 30) * 0.03 }}
                  className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col justify-between hover:border-primary/30 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-3xl translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">Idea #{i + 1}</span>
                      <div className="w-1 h-1 rounded-full bg-primary/30" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">{idea}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : ideas.length > 0 ? (
             <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl">
               <p className="text-lg font-medium">No ideas match your search</p>
               <button onClick={() => setSearchQuery('')} className="text-primary font-bold mt-2 hover:underline">Clear search</button>
             </div>
          ) : domain && !isLoading ? (
             <div className="text-center py-24 text-muted-foreground border-2 border-dashed border-border/50 rounded-[3rem] bg-muted/20">
               <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-border/50">
                 <Sparkles className="w-8 h-8 text-primary/40" />
               </div>
               <h3 className="text-xl font-bold text-foreground mb-2">Ready to Innovate?</h3>
               <p className="text-sm max-w-xs mx-auto">Click generate to unveil an exhaustive list of concepts tailored for {domain}.</p>
             </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
