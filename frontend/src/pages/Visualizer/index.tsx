
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Network, SearchCode, GitMerge, ListOrdered } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function VisualizerPage() {
  const navigate = useNavigate();

  const modules = [
    { id: 'bubble', title: 'Bubble Sort', slug: 'bubble', icon: ListOrdered, desc: 'Interactive animation of the Bubble Sort algorithm swapping adjacent elements.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 'merge', title: 'Merge Sort', slug: 'merge', icon: GitMerge, desc: 'Interactive animation of the Merge Sort divide-and-conquer algorithm.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 'bst', title: 'BST Insert', slug: 'bst', icon: Network, desc: 'Interactive animation of inserting nodes into a Binary Search Tree.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 'bfs', title: 'BFS Graph', slug: 'bfs', icon: SearchCode, desc: 'Interactive animation of Breadth-First Search traversal on a graph.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 'dfs', title: 'DFS Graph', slug: 'dfs', icon: GitMerge, desc: 'Interactive animation of Depth-First Search traversal on a graph.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
            <span className="text-accent-primary">DAA</span> Visualizer
          </h1>
        </motion.div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`neon-card ${mod.colorClass} flex flex-col h-full group`}
              style={{ padding: '16px 24px 20px 24px' }}
            >
              <div className="flex items-center gap-3 mb-[0.7rem]">
                <div className={`transition-colors ${mod.iconColorClass}`}>
                  <mod.icon size={26} />
                </div>
                <h2 className="text-xl font-bold font-display text-text-primary group-hover:text-current transition-colors">{mod.title}</h2>
              </div>
              
              <div className="mb-14 flex-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-[0.3rem] font-mono">Summary</p>
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
