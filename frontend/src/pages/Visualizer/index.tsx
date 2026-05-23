import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Network, SearchCode, GitMerge, ListOrdered } from 'lucide-react';

export function VisualizerPage() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const modules = [
    { id: 'bubble', title: 'Bubble Sort', slug: 'bubble', icon: ListOrdered, desc: 'Interactive animation of the Bubble Sort algorithm swapping adjacent elements.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 'merge', title: 'Merge Sort', slug: 'merge', icon: GitMerge, desc: 'Interactive animation of the Merge Sort divide-and-conquer algorithm.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 'bst', title: 'BST Insert', slug: 'bst', icon: Network, desc: 'Interactive animation of inserting nodes into a Binary Search Tree.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 'bfs', title: 'BFS Graph', slug: 'bfs', icon: SearchCode, desc: 'Interactive animation of Breadth-First Search traversal on a graph.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 'dfs', title: 'DFS Graph', slug: 'dfs', icon: GitMerge, desc: 'Interactive animation of Depth-First Search traversal on a graph.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto py-10 min-h-[calc(100vh-4rem)] flex flex-col space-y-10"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <div className="mb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">DAA Visualizer</h1>
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
              <option value="Sorting">Sorting</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
            </select>
          </div>
        </div>

        {/* Visualizer Grid */}
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
                <button 
                  onClick={() => navigate(`/daa/${mod.slug}`)}
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
