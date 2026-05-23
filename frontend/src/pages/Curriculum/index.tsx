import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Code2, GitMerge, Network, Cpu, SearchCode, Database } from 'lucide-react';

export function CurriculumPage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const modules = [
    { id: 1, title: 'Arrays & Hashing', slug: 'arrays-&-hashing', icon: Code2, desc: 'Fundamental array traversal, hashing, and manipulation techniques.', progress: 68, status: 'continue', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 2, title: 'Intervals', slug: 'intervals', icon: GitMerge, desc: 'Algorithms from interval merging to non-overlapping scheduling.', progress: 10, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 3, title: 'Stacks', slug: 'stacks', icon: Network, desc: 'Algorithms dealing with LIFO structures and monotonic stacks.', progress: 5, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 4, title: 'Linked Lists', slug: 'linked-lists', icon: Cpu, desc: 'Traversal, cycle detection, and merging of linked data structures.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 5, title: 'Trees & Graphs', slug: 'trees-&-graphs', icon: SearchCode, desc: 'Fundamental graph searching (BFS/DFS) and tree balancing.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 6, title: 'Dynamic Programming', slug: 'dynamic-programming', icon: Database, desc: 'Memoization and tabulating overlapping subproblems.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto py-10 min-h-[calc(100vh-4rem)] flex flex-col space-y-10"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">Data Structures and Algorithms</h1>
        </motion.div>
      </div>

      <div className="flex flex-col gap-8 flex-1">
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full bg-bg-elevated p-4 rounded-xl border border-border-default shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest font-mono">Difficulty:</span>
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-bg-secondary border border-border-default text-text-primary text-sm rounded-lg focus:ring-accent-secondary focus:border-accent-secondary block w-full sm:w-48 p-2.5 font-mono cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest font-mono">Topics:</span>
            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-bg-secondary border border-border-default text-text-primary text-sm rounded-lg focus:ring-accent-secondary focus:border-accent-secondary block w-full sm:w-48 p-2.5 font-mono cursor-pointer"
            >
              <option value="All">All Topics</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`neon-card ${mod.colorClass} flex flex-col h-full group`}
              style={{ padding: '28px 24px 20px 24px' }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className={`p-3 bg-bg-tertiary rounded-xl border border-border-default group-hover:border-current transition-colors ${mod.iconColorClass}`}>
                  <mod.icon size={26} />
                </div>
                <h2 className="text-xl font-bold font-display text-text-primary group-hover:text-current transition-colors">{mod.title}</h2>
              </div>
              
              <div className="mb-14 flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 font-mono">Summary</p>
                <p className="text-sm text-text-secondary leading-relaxed">{mod.desc}</p>
              </div>

              <div className="mt-auto flex flex-col">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-text-muted font-mono font-medium">PROGRESS</span>
                  <span className="text-text-primary font-bold font-mono">{mod.progress}%</span>
                </div>
                <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-white/5 mb-6">
                  <div className="h-full bg-text-primary rounded-full" style={{ width: `${mod.progress}%` }}></div>
                </div>
                <button 
                  onClick={() => navigate(`/dsa/${mod.slug}`)}
                  className={`w-full py-3 rounded-lg font-bold font-mono tracking-wider transition-all duration-300 ${mod.btnClass}`}
                >
                  {mod.status.toUpperCase()}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
