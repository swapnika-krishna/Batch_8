import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { askStudyBuddy, generateStudyPlan } from '../services/geminiService';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface StudyBuddyProps {
  resumeAnalysis?: any;
}

export default function StudyBuddy({ resumeAnalysis }: StudyBuddyProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resumeAnalysis && messages.length === 0) {
      setMessages([
        {
          role: 'ai',
          content: `Hello! I've analyzed your resume. You have strong skills in **${resumeAnalysis.matchedSkills?.slice(0, 3).join(', ')}**. I can help you bridge the gap in **${resumeAnalysis.missingSkills?.slice(0, 3).join(', ')}**. What would you like to study today?`
        }
      ]);
    }
  }, [resumeAnalysis]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const answer = await askStudyBuddy(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: answer || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error: Failed to connect to the tutor." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!resumeAnalysis || isGeneratingPlan) return;
    
    setIsGeneratingPlan(true);
    setMessages(prev => [...prev, { role: 'user', content: "Generate a personalized 4-week study plan for me." }]);
    
    try {
      const plan = await generateStudyPlan(resumeAnalysis);
      setMessages(prev => [...prev, { role: 'ai', content: plan || "Failed to generate plan." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error: Failed to generate study plan." }]);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto bg-card border border-primary/20 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-full">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Study Buddy</h2>
            <p className="text-xs text-muted-foreground">Personalized Academic Tutor</p>
          </div>
        </div>
        {resumeAnalysis && (
          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="text-[11px] bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {isGeneratingPlan ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            Generate 4-Week Plan
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary/[0.02]">
        {messages.length === 0 && !resumeAnalysis && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Ask me anything about your BTech subjects!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted border"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-muted border rounded-tl-none"
            )}>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {(isLoading || isGeneratingPlan) && (
          <div className="flex gap-3 mr-auto max-w-[90%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-muted border rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a technical question or for study tips..."
            className="flex-1 bg-muted/50 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isGeneratingPlan}
            className="bg-primary text-primary-foreground p-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
