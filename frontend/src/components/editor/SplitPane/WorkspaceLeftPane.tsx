import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PlaySquare, Bot } from 'lucide-react';
import { ProblemStatement } from '../ProblemStatement';

// In a real app, these would be proper components passed down or imported
const VisualizerStub = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-primary h-full">
    <div className="w-16 h-16 rounded-2xl bg-accent-primary/20 flex items-center justify-center mb-4 border border-accent-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
      <PlaySquare size={32} className="text-accent-primary" />
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">Algorithm Visualizer</h3>
    <p className="text-text-secondary max-w-sm">
      Interactive visualizations for this problem will appear here. Click "Visualize" when running your code to see it step-by-step.
    </p>
  </div>
);

const AiTutorStub = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-bg-primary h-full">
    <div className="w-16 h-16 rounded-2xl bg-accent-secondary/20 flex items-center justify-center mb-4 border border-accent-secondary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
      <Bot size={32} className="text-accent-secondary" />
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-2">AlgoNext AI Tutor</h3>
    <p className="text-text-secondary max-w-sm">
      I'm here to help you get unstuck without giving away the answer. Ask me for a hint or a code review!
    </p>
    <button className="mt-6 brutal-btn px-6 py-2 text-sm font-bold text-accent-secondary border-accent-secondary/50 hover:border-accent-secondary">
      Ask for a hint
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
    <div className="flex flex-col h-full bg-bg-primary border border-border-default rounded-xl overflow-hidden shadow-lg">
      {/* Glassmorphic Tab Bar */}
      <div className="flex items-center gap-1 p-2 border-b border-border-default bg-bg-secondary/80 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary/50'
              }`}
            >
              <tab.icon size={16} className={isActive ? 'text-accent-primary' : ''} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/20 rounded-lg shadow-[inset_0_-2px_0_var(--color-accent-primary)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
