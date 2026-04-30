import React from 'react';
import { motion } from 'motion/react';
import { 
  Code, 
  Brain, 
  Briefcase, 
  Send, 
  Award, 
  Target, 
  Search, 
  Users,
  LucideIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Code,
  Brain,
  Briefcase,
  Send,
  Award,
  Target,
  Search,
  Users
};

interface RoadmapItem {
  quarter: string;
  theme: string;
  activities: string[];
  milestone: string;
  icon: string;
}

interface PlacementRoadmapProps {
  roadmap: RoadmapItem[];
}

export default function PlacementRoadmap({ roadmap }: PlacementRoadmapProps) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="relative py-12 px-4 overflow-hidden">
      {/* Background track */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2 hidden md:block" />

      <div className="space-y-24 relative z-10">
        {roadmap.map((item, index) => {
          const Icon = iconMap[item.icon] || Target;
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={item.quarter}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-0`}
            >
              {/* Content Panel */}
              <div className={`flex-1 w-full ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                <div className={`p-6 bg-card/60 backdrop-blur-md border border-primary/20 rounded-3xl shadow-xl hover:border-primary/40 transition-all group relative ${isEven ? 'md:mr-12' : 'md:ml-12'}`}>
                  {/* Decorative corner */}
                  <div className={`absolute top-0 ${isEven ? 'right-0' : 'left-0'} w-24 h-24 bg-primary/5 rounded-full -m-8 blur-2xl group-hover:bg-primary/10 transition-colors`} />
                  
                  <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'} gap-2 relative z-10`}>
                    <span className="text-primary font-bold tracking-widest text-sm uppercase">{item.quarter}</span>
                    <h4 className="text-2xl font-bold mb-4">{item.theme}</h4>
                    
                    <ul className={`space-y-3 mb-6 ${isEven ? 'md:items-end text-right' : 'md:items-start text-left'}`}>
                      {item.activities.map((activity, i) => (
                        <li key={i} className={`flex items-center gap-3 text-sm text-muted-foreground ${isEven ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                          {activity}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-primary/10 w-full flex items-center gap-3 text-sm font-semibold text-primary">
                      <Sparkles className="w-4 h-4" />
                      Milestone: {item.milestone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Icon Node */}
              <div className="relative z-20 flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 rotate-45 transform hover:rotate-0 transition-transform duration-500 ring-8 ring-background">
                  <Icon className="w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
              </div>

              {/* Empty Space for layout */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
