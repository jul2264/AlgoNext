import { useState } from 'react';
import { motion } from 'motion/react';
import { Code2, GitMerge, Network, Cpu, SearchCode, Database } from 'lucide-react';

export function CurriculumPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const modules = [
    { id: 1, title: 'Arrays & Strings', icon: Code2, desc: 'Master fundamental array traversal and manipulation techniques.', progress: 68, status: 'continue', colorClass: 'neon-card-cyan', btnClass: 'neon-btn-cyan' },
    { id: 2, title: 'Linked Lists', icon: GitMerge, desc: 'Master algorithms from two-pointers to reversing linked lists.', progress: 10, status: 'start', colorClass: 'neon-card-pink', btnClass: 'neon-btn' },
    { id: 3, title: 'Trees & Graphs', icon: Network, desc: 'Master algorithms from basic trees to complex graph traversals.', progress: 5, status: 'start', colorClass: 'neon-card-yellow', btnClass: 'neon-btn' },
    { id: 4, title: 'Dynamic Programming', icon: Cpu, desc: 'Master algorithms to optimize and recalculate overlapping subproblems.', progress: 0, status: 'start', colorClass: 'neon-card-pink', btnClass: 'neon-btn' },
    { id: 5, title: 'Sorting & Searching', icon: SearchCode, desc: 'Master fundamental sorting and advanced binary searching.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', btnClass: 'neon-btn' },
    { id: 6, title: 'Greedy Algorithms', icon: Database, desc: 'Master greedy choices for optimization problems.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', btnClass: 'neon-btn-cyan' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-12 md:px-24 lg:px-40 py-6 min-h-[calc(100vh-4rem)] flex flex-col space-y-8 w-full">
      <div className="mb-2">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold font-display text-text-primary tracking-tight">Curriculum Explorer</h1>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 flex-1">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-10">
          <div className="neon-card p-8">
            <h3 className="text-lg font-bold font-display text-text-primary mb-4">Difficulty</h3>
            <div className="space-y-3">
              {[
                { id: 'All', color: 'accent-secondary' },
                { id: 'Easy', color: 'accent-secondary' },
                { id: 'Medium', color: 'accent-tertiary' },
                { id: 'Hard', color: 'accent-primary' }
              ].map(diff => {
                const isSelected = selectedDifficulty === diff.id;
                const activeClasses = isSelected ? 'bg-' + diff.color + '/20 border-' + diff.color + ' shadow-[0_0_8px_var(--color-' + diff.color + ')]' : 'border-border-default bg-bg-tertiary group-hover:border-border-hover';
                return (
                  <label key={diff.id} onClick={() => setSelectedDifficulty(diff.id)} className="flex items-center gap-3 cursor-pointer group">
                    <div className={'w-5 h-5 rounded border flex items-center justify-center transition-colors ' + activeClasses}>
                      {isSelected && <div className={'w-2.5 h-2.5 rounded-sm bg-' + diff.color} />}
                    </div>
                    <span className={`font-mono text-sm ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{diff.id}</span>
                  </label>
                );
              })}
            </div>

            <h3 className="text-lg font-bold font-display text-text-primary mb-4 mt-8">Topics</h3>
            <div className="space-y-3">
              {['Data Structures', 'Algorithms', 'Advanced'].map((topic, i) => (
                <label key={topic} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${i < 2 ? 'bg-accent-secondary/20 border-accent-secondary shadow-[0_0_8px_var(--color-accent-secondary)]' : 'border-border-default bg-bg-tertiary group-hover:border-border-hover'}`}>
                    {i < 2 && <div className="w-2.5 h-2.5 rounded-sm bg-accent-secondary" />}
                  </div>
                  <span className={`font-mono text-sm ${i < 2 ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>{topic}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`neon-card ${mod.colorClass} p-8 flex flex-col h-full group`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-bg-tertiary rounded-xl border border-border-default group-hover:border-current transition-colors">
                  <mod.icon size={26} />
                </div>
                <h2 className="text-xl font-bold font-display text-text-primary group-hover:text-current transition-colors">{mod.title}</h2>
              </div>
              
              <div className="mb-6 flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 font-mono">Summary</p>
                <p className="text-sm text-text-secondary leading-relaxed">{mod.desc}</p>
              </div>

              <div className="mt-auto space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-text-muted uppercase">Progress</span>
                    <span className="text-text-primary">{mod.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${mod.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-current rounded-full shadow-[0_0_8px_currentColor]"
                    />
                  </div>
                </div>

                <button className={`w-full py-3 ${mod.btnClass}`}>
                  {mod.status === 'continue' ? 'CONTINUE' : 'START'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
