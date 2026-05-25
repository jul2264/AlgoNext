import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Box, ArrowRight, Hash, Network, Share2, Type, Shapes, Server, Trophy, Dices } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function CurriculumPage() {
  const navigate = useNavigate();

  const modules = [
    { id: 1, title: 'Foundations', slug: 'foundations', icon: Box, desc: 'Core fundamentals including basic syntax, variables, and loops.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 2, title: 'Linear Structures', slug: 'linear-structures', icon: ArrowRight, desc: 'Arrays, Linked Lists, Stacks, and Queues.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 3, title: 'Hash Structures', slug: 'hash-structures', icon: Hash, desc: 'Hash Maps, Hash Sets, and Collision Resolution strategies.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 4, title: 'Trees', slug: 'trees', icon: Network, desc: 'Hierarchical data structures, from Basic to Database Trees.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 5, title: 'Graph Structures', slug: 'graph-structures', icon: Share2, desc: 'Nodes and edges representing networks, BFS, DFS, and shortest paths.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 6, title: 'String Structures', slug: 'string-structures', icon: Type, desc: 'Tries, Suffix Arrays, and advanced pattern matching algorithms.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 7, title: 'Geometric Structures', slug: 'geometric-structures', icon: Shapes, desc: 'Quad-trees, K-D Trees, and spatial data representation.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 8, title: 'Distributed Structures', slug: 'distributed-structures', icon: Server, desc: 'Consistent Hashing, Merkle Trees, and distributed consensus.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 9, title: 'Competitive Programming Structures', slug: 'competitive-programming-structures', icon: Trophy, desc: 'Segment Trees, Fenwick Trees, and disjoint sets.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 10, title: 'Probabilistic Structures', slug: 'probabilistic-structures', icon: Dices, desc: 'Bloom Filters, Count-Min Sketch, and HyperLogLog.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
            <span className="text-accent-tertiary">Data</span> Structures and Algorithms
          </h1>
        </motion.div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">


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
