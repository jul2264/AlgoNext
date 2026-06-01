import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Network, Scale, Activity, History, GitMerge, Database } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function TreesModulePage() {
  const navigate = useNavigate();
  const [basicTreesProgress, setBasicTreesProgress] = useState(0);
  const [balancedTreesProgress, setBalancedTreesProgress] = useState(0);
  const [rangeTreesProgress, setRangeTreesProgress] = useState(0);
  const [persistentTreesProgress, setPersistentTreesProgress] = useState(0);
  const [advancedTreesProgress, setAdvancedTreesProgress] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_basic_trees');
      if (saved) {
        const completedMap = JSON.parse(saved) as Record<string, boolean>;
        const weights: Record<number, number> = { 1: 50, 2: 50 };
        const progress = Object.entries(completedMap)
          .filter(([, done]) => done)
          .reduce((sum, [key]) => sum + (weights[Number(key)] || 0), 0);
        setBasicTreesProgress(progress);
      }
    } catch (e) {
      console.error('Failed to parse basic trees progress:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_balanced_trees');
      if (saved) {
        const completedMap = JSON.parse(saved) as Record<string, boolean>;
        const weights: Record<number, number> = { 1: 50, 2: 50 };
        const progress = Object.entries(completedMap)
          .filter(([, done]) => done)
          .reduce((sum, [key]) => sum + (weights[Number(key)] || 0), 0);
        setBalancedTreesProgress(progress);
      }
    } catch (e) {
      console.error('Failed to parse balanced trees progress:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_range_trees');
      if (saved) {
        const completedMap = JSON.parse(saved) as Record<string, boolean>;
        const weights: Record<number, number> = { 1: 50, 2: 50 };
        const progress = Object.entries(completedMap)
          .filter(([, done]) => done)
          .reduce((sum, [key]) => sum + (weights[Number(key)] || 0), 0);
        setRangeTreesProgress(progress);
      }
    } catch (e) {
      console.error('Failed to parse range trees progress:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_persistent_trees');
      if (saved) {
        const completedMap = JSON.parse(saved) as Record<string, boolean>;
        const weights: Record<number, number> = { 1: 50, 2: 50 };
        const progress = Object.entries(completedMap)
          .filter(([, done]) => done)
          .reduce((sum, [key]) => sum + (weights[Number(key)] || 0), 0);
        setPersistentTreesProgress(progress);
      }
    } catch (e) {
      console.error('Failed to parse persistent trees progress:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_advanced_trees');
      if (saved) {
        const completedMap = JSON.parse(saved) as Record<string, boolean>;
        const weights: Record<number, number> = { 1: 50, 2: 50 };
        const progress = Object.entries(completedMap)
          .filter(([, done]) => done)
          .reduce((sum, [key]) => sum + (weights[Number(key)] || 0), 0);
        setAdvancedTreesProgress(progress);
      }
    } catch (e) {
      console.error('Failed to parse advanced trees progress:', e);
    }
  }, []);

  const getStatus = (progress: number) => {
    if (progress === 0) return 'start';
    if (progress === 100) return 'completed';
    return 'in progress';
  };

  const modules = [
    { id: 1, title: 'Basic Trees', slug: 'basic-trees', icon: Network, desc: 'Binary Trees, BSTs, and basic traversal techniques.', progress: basicTreesProgress, status: getStatus(basicTreesProgress), colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 2, title: 'Balanced Trees', slug: 'balanced-trees', icon: Scale, desc: 'AVL Trees, Red-Black Trees, and balancing mechanisms.', progress: balancedTreesProgress, status: getStatus(balancedTreesProgress), colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 3, title: 'Range Trees', slug: 'range-trees', icon: Activity, desc: 'Segment Trees and Fenwick Trees for range queries.', progress: rangeTreesProgress, status: getStatus(rangeTreesProgress), colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
    { id: 4, title: 'Persistent Trees', slug: 'persistent-trees', icon: History, desc: 'Data structures that preserve previous versions of themselves.', progress: persistentTreesProgress, status: getStatus(persistentTreesProgress), colorClass: 'neon-card-cyan', iconColorClass: 'text-accent-secondary', btnClass: 'neon-btn' },
    { id: 5, title: 'Advanced Trees', slug: 'advanced-trees', icon: GitMerge, desc: 'Splay Trees, Treaps, and specialized tree structures.', progress: advancedTreesProgress, status: getStatus(advancedTreesProgress), colorClass: 'neon-card-pink', iconColorClass: 'text-accent-primary', btnClass: 'neon-btn' },
    { id: 6, title: 'Database Trees', slug: 'database-trees', icon: Database, desc: 'B-Trees and B+ Trees used in modern database indices.', progress: 0, status: 'start', colorClass: 'neon-card-yellow', iconColorClass: 'text-accent-tertiary', btnClass: 'neon-btn' },
  ];

  return (
    <div 
      className="w-full mx-auto pt-16 pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
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
              Trees
            </h1>
            <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
              Data Structures Subcategories
            </p>
          </div>
        </div>
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
                <div className={`transition-colors ${mod.iconColorClass}`}>
                  <mod.icon size={28} />
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
                  onClick={() => navigate(`/dsa/trees/${mod.slug}`)}
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
