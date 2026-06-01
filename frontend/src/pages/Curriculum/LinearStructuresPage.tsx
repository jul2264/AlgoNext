import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, List, Link as LinkIcon, Layers, AlignJustify } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function LinearStructuresPage() {
  const navigate = useNavigate();
  const [progresses, setProgresses] = useState({
    arrays: 0,
    linkedLists: 0,
    stacks: 0,
    queues: 0
  });

  useEffect(() => {
    const SECTION_WEIGHTS: Record<number, number> = { 1: 10, 2: 15, 3: 10, 4: 15, 5: 15, 6: 10, 7: 10, 8: 15 };

    const getProgress = (key: string) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const completedMap = JSON.parse(saved) as Record<string, boolean>;
          return Object.entries(completedMap)
            .filter(([, done]) => done)
            .reduce((sum, [k]) => sum + (SECTION_WEIGHTS[Number(k)] || 0), 0);
        }
      } catch (e) {
        console.error(`Failed to parse progress for ${key}:`, e);
      }
      return 0;
    };

    setProgresses({
      arrays: getProgress('dsa_progress_arrays'),
      linkedLists: getProgress('dsa_progress_linked_lists'),
      stacks: getProgress('dsa_progress_stacks'),
      queues: getProgress('dsa_progress_queues')
    });
  }, []);

  const getStatus = (progress: number) => {
    if (progress === 0) return 'start';
    if (progress === 100) return 'completed';
    return 'in progress';
  };

  const modules = [
    { id: 1, title: 'Arrays', slug: 'arrays', icon: List, desc: 'Contiguous memory blocks for fast indexing and sequential iteration.', progress: progresses.arrays, status: getStatus(progresses.arrays), colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 2, title: 'Linked Lists', slug: 'linked-lists', icon: LinkIcon, desc: 'Nodes connected by pointers, enabling dynamic memory allocation.', progress: progresses.linkedLists, status: getStatus(progresses.linkedLists), colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 3, title: 'Stacks', slug: 'stacks', icon: Layers, desc: 'LIFO structure used for history tracking and execution frames.', progress: progresses.stacks, status: getStatus(progresses.stacks), colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 4, title: 'Queues', slug: 'queues', icon: AlignJustify, desc: 'FIFO structure ideal for scheduling and order processing.', progress: progresses.queues, status: getStatus(progresses.queues), colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dsa')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
              <span className="text-accent-tertiary">Linear</span> Structures
            </h1>
            <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
              Data Structures Subcategories
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full mt-6">
          {modules.map((mod, idx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`neon-card ${mod.colorClass} flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-300`}
              style={{ padding: '28px 32px' }}
            >
              {/* Sequence number in top-right background */}
              <div className="absolute right-6 top-3 text-7xl font-display font-extrabold text-white/[0.03] group-hover:text-white/[0.05] transition-colors select-none pointer-events-none">
                0{mod.id}
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-bg-secondary/60 rounded-xl border border-border-default/50 transition-colors ${mod.iconColorClass} group-hover:border-current`}>
                    <mod.icon size={28} />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-text-primary transition-colors">{mod.title}</h2>
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed mb-8">{mod.desc}</p>
              </div>

              <div className="flex flex-col mt-auto">
                <div className="flex justify-between items-center text-xs font-mono font-bold tracking-wider mb-2">
                  <span className="text-text-muted">COMPLETION</span>
                  <span className="text-text-primary">{mod.progress}%</span>
                </div>
                <div className="h-2 w-full bg-bg-secondary/80 rounded-full overflow-hidden border border-white/5 mb-6">
                  <div 
                    className="h-full bg-text-primary rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${mod.progress}%` }} 
                  />
                </div>
                <button 
                  onClick={() => navigate(`/dsa/linear-structures/${mod.slug}`)}
                  className={`w-full py-3.5 rounded-xl font-bold font-mono tracking-wider transition-all duration-300 ${mod.btnClass}`}
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
