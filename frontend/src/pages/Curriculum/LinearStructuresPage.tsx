import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, List, Link as LinkIcon, Layers, AlignJustify } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function LinearStructuresPage() {
  const navigate = useNavigate();

  const modules = [
    { id: 1, title: 'Arrays', slug: 'arrays', icon: List, desc: 'Contiguous memory blocks for fast indexing and sequential iteration.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 2, title: 'Linked Lists', slug: 'linked-lists', icon: LinkIcon, desc: 'Nodes connected by pointers, enabling dynamic memory allocation.', progress: 0, status: 'start', colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 3, title: 'Stacks', slug: 'stacks', icon: Layers, desc: 'LIFO structure used for history tracking and execution frames.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 4, title: 'Queues', slug: 'queues', icon: AlignJustify, desc: 'FIFO structure ideal for scheduling and order processing.', progress: 0, status: 'start', colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
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
        {/* Intro Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>What Are Linear Data Structures?</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Linear Data Structures organize elements sequentially, where each element is connected logically to the next, forming a simple straight line of data.
              </p>
            </div>
          </div>

          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Why Not Trees And Graphs?</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary">Traversal happens linearly</strong> - moving step-by-step from start to finish</li>
                <li><strong className="text-text-primary">Elements are processed one-by-one</strong> - establishing a single path of execution</li>
                <li><strong className="text-text-primary">Memory access follows a predictable order</strong> - improving hardware cache locality</li>
              </ul>
            </div>
          </div>

          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Why They Exist?</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary">Sequential storage</strong> - mapping directly to contiguous RAM</li>
                <li><strong className="text-text-primary">Ordered processing</strong> - keeping data naturally sorted by arrival</li>
                <li><strong className="text-text-primary">Memory-efficient traversal</strong> - simple logic without recursive overhead</li>
                <li><strong className="text-text-primary">Temporary data handling</strong> - buffering data streams effectively</li>
              </ul>
            </div>
          </div>

          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Foundational For</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-text-primary">Algorithms:</strong> Sorting, searching, and two-pointer traversals</li>
                <li><strong className="text-text-primary">Operating Systems:</strong> Task scheduling queues and memory stacks</li>
                <li><strong className="text-text-primary">Compilers:</strong> Syntax parsing and execution environments</li>
                <li><strong className="text-text-primary">Browsers:</strong> Undo/redo history and event rendering queues</li>
                <li><strong className="text-text-primary">Databases:</strong> Write-ahead transaction logs and record storage</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-text-muted font-mono font-medium">PROGRESS</span>
                  <span className="text-text-primary font-bold font-mono">{mod.progress}%</span>
                </div>
                <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden border border-white/5 mb-6">
                  <div className="h-full bg-text-primary rounded-full" style={{ width: `${mod.progress}%` }}></div>
                </div>
                <button 
                  onClick={() => navigate(`/dsa/linear-structures/${mod.slug}`)}
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
