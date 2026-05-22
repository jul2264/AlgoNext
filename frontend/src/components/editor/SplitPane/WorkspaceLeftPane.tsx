import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PlaySquare, Bot } from 'lucide-react';
import { ProblemStatement } from '../ProblemStatement';

// In a real app, these would be proper components passed down or imported
const VisualizerStub = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-primary h-full">
    <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-6 border border-accent-primary/50 shadow-[0_0_20px_rgba(255,45,120,0.4)]">
      <PlaySquare size={32} className="text-accent-primary" />
    </div>
    <h3 className="text-2xl font-bold text-text-primary mb-3 font-display">Algorithm Visualizer</h3>
    <p className="text-text-secondary max-w-sm mb-8">
      Interactive visualizations for this problem will appear here. Click "Visualize" when running your code to see it step-by-step.
    </p>
    <button className="neon-btn neon-btn-cyan px-8 py-3 text-sm font-bold tracking-wider hover:bg-accent-secondary/10">
      VISUALIZE NOW
    </button>
  </div>
);

const AiTutorStub = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-primary h-full relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl"></div>
    <div className="w-16 h-16 rounded-2xl bg-accent-secondary/10 flex items-center justify-center mb-6 border border-accent-secondary/50 shadow-[0_0_20px_rgba(0,255,204,0.4)] relative z-10">
      <Bot size={32} className="text-accent-secondary" />
    </div>
    <h3 className="text-2xl font-bold text-text-primary mb-3 font-display relative z-10">AlgoNext AI Tutor</h3>
    <p className="text-text-secondary max-w-sm mb-8 relative z-10">
      I'm here to help you get unstuck without giving away the answer. Ask me for a hint or a code review!
    </p>
    <button className="neon-btn px-8 py-3 text-sm font-bold text-accent-primary border-accent-primary/50 hover:bg-accent-primary/10 relative z-10">
      ASK FOR A HINT
    </button>
  </div>
);

export function WorkspaceLeftPane({ problem }: { problem: any }) {
  const [activeTab, setActiveTab] = useState<'problem' | 'visualizer' | 'tutor'>('problem');

  const tabs = [
    { id: 'problem', label: 'Problem', icon: BookOpen },
    { id: 'visualizer', label: 'Visualizer', icon: PlaySquare },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-primary border border-border-default rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,255,204,0.05)] relative">
      {/* Cyberpunk Tab Bar */}
      <div className="flex items-center gap-1 p-2 border-b border-border-default bg-bg-secondary z-20">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-accent-secondary text-shadow-[0_0_8px_currentColor]' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <tab.icon size={16} className={isActive ? 'text-accent-secondary' : ''} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-workspace-tab"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent-secondary shadow-[0_0_8px_var(--color-accent-secondary)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'problem' && <ProblemStatement {...problem} />}
            {activeTab === 'visualizer' && <VisualizerStub />}
            {activeTab === 'tutor' && <AiTutorStub />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
