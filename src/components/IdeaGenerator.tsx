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
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!domain) return;
    setIsLoading(true);
    try {
      const result = await generateInnovationIdeas(domain, resumeAnalysis);
      setIdeas(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Innovation Marketplace</h2>
            <p className="text-muted-foreground">Discover your next big project idea</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Select Technical Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-primary/5 border border-primary/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">-- Choose a domain --</option>
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.label}>{d.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!domain || isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/10"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Ideas
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm animate-pulse">Curating innovative concepts...</p>
            </div>
          ) : ideas.length > 0 ? (
            ideas.map((idea, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border rounded-lg p-4 flex items-start gap-3 hover:border-primary/50 transition-colors group"
              >
                <div className="mt-1 p-1 bg-muted rounded group-hover:bg-primary/10 transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-sm leading-relaxed">{idea}</p>
              </motion.div>
            ))
          ) : domain && !isLoading ? (
             <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
               <p>Click generate to see ideas for {domain}</p>
             </div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
