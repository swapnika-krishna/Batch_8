import React, { useState, useRef } from 'react';
import { FileText, Upload, Building2, CheckCircle2, AlertCircle, Loader2, BarChart3, Sparkles, FileUp, X, ChevronRight, TrendingUp, Map, Target } from 'lucide-react';
import { analyzeResumePDF, generateCareerRoadmap } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import PlacementRoadmap from './PlacementRoadmap';

interface PlacementCoachProps {
  onUploadSuccess: (analysis: any) => void;
}

export default function PlacementCoach({ onUploadSuccess }: PlacementCoachProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<any[] | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        setError('Only PDF files are supported for resume analysis.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setRoadmap(null);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const analysis = await analyzeResumePDF(base64);
          if (analysis) {
            // Save to localStorage for mock persistence
            const resumeData = {
              isResumeUploaded: true,
              resumeAnalysis: analysis,
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('skillnova_mock_resume', JSON.stringify(resumeData));
            
            setResult(analysis);
            onUploadSuccess(analysis);
          } else {
            setError('Failed to analyze resume. Please try a different file.');
          }
        } catch (err) {
          setError('An error occurred during AI analysis. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      setError('Failed to read file. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!result || isGeneratingRoadmap) return;
    setIsGeneratingRoadmap(true);
    try {
      const roadmapText = await generateCareerRoadmap(result);
      setRoadmap(roadmapText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-full">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Placement Coach</h2>
            <p className="text-muted-foreground">AI-Powered ATS Analysis & Career Strategy</p>
          </div>
        </div>

        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
              file ? "border-primary bg-primary/5" : "border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02]"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-primary/10 rounded-full">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{file.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1.5 hover:bg-primary/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/5 rounded-full">
                  <FileUp className="w-10 h-10 text-primary/60" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Upload Your Resume</p>
                  <p className="text-sm text-muted-foreground">Drag and drop your PDF here or click to browse</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> PDF Support</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> ATS Scanning</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-primary" /> Skill Gap Analysis</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <TrendingUp className="w-6 h-6" />}
            {isLoading ? "Analyzing Your Profile..." : "Start AI Analysis"}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-card border rounded-2xl overflow-hidden shadow-md">
              <div className="p-8 border-b bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl">
                    {result.score}%
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">ATS Compatibility Score</h3>
                    <p className="text-sm text-muted-foreground">Based on industry standards for {result.experienceLevel} roles</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const event = new CustomEvent('changeTab', { detail: 'jobs' });
                      window.dispatchEvent(event);
                    }}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    Find Jobs
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Core Strengths
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.matchedSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary/80 font-bold uppercase tracking-wider text-xs">
                    <AlertCircle className="w-4 h-4" />
                    Growth Opportunities
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {result.missingSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/5 text-primary/70 text-xs font-medium rounded-lg border border-primary/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-primary/5 border-t">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Strategic Advice
                    </h4>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{result.suggestion}"
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={handleGenerateRoadmap}
                      disabled={isGeneratingRoadmap}
                      className="px-8 py-3 bg-background border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                    >
                      {isGeneratingRoadmap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
                      {roadmap ? "Roadmap Generated" : "Generate 12-Month Roadmap"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {roadmap && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Your 12-Month Success Map</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">A strategic, data-driven journey tailored to bridge your skill gaps and land your dream role.</p>
                </div>
                
                <PlacementRoadmap roadmap={roadmap} />
                
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">Ready to take the first step?</h4>
                    <p className="text-muted-foreground">Follow this roadmap consistently to see a significant improvement in your placement readiness Score.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('changeTab', { detail: 'study' });
                      window.dispatchEvent(event);
                    }}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    Start Q1 Prep
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
