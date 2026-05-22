import { BookOpen, Trophy, Clock, Code2, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';

export function DashboardPage() {
  const stats = [
    { label: 'Problems Solved', value: '24', icon: Code2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    { label: 'Current Streak', value: '5 days', icon: Trophy, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    { label: 'Hours Learned', value: '12.5', icon: Clock, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/20' },
    { label: 'Curriculum Progress', value: '34%', icon: BookOpen, color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/20' },
  ];

  const recentProblems = [
    { id: 1, title: 'Two Sum', difficulty: 'easy', date: '2 hours ago' },
    { id: 2, title: 'Valid Parentheses', difficulty: 'easy', date: 'Yesterday' },
    { id: 3, title: 'Merge Intervals', difficulty: 'medium', date: '3 days ago' },
  ];

  const difficultyColors: Record<string, string> = {
    easy: 'text-easy bg-easy/10 border-easy/20',
    medium: 'text-medium bg-medium/10 border-medium/20',
    hard: 'text-hard bg-hard/10 border-hard/20',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tight">Dashboard</h1>
          <p className="text-text-secondary font-mono text-sm">Ready to continue your algorithmic journey?</p>
        </motion.div>
        
        {/* Brutalist XP Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="brutal-card px-6 py-3 flex items-center gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg text-warning">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase">Total XP</p>
              <p className="text-xl font-black text-text-primary font-mono">1,450</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border-default"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/20 rounded-lg text-success">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase">Level</p>
              <p className="text-xl font-black text-text-primary font-mono">14</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid - Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-primary/10 transition-all duration-300 cursor-default group"
          >
            <div className={`p-4 rounded-xl border ${stat.bg} ${stat.border} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted mb-1 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-text-primary font-mono">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Learning - Neomorphic & Brutalist */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Continue Learning</h2>
          <div className="neo-container p-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-accent-primary/20 text-accent-primary border border-accent-primary/30 uppercase tracking-wider mb-4">Level 1: Foundations</span>
              <h3 className="text-3xl font-black text-text-primary mb-3">Arrays & Strings</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">Master the fundamentals of array traversal, manipulation, and the two-pointer technique. Essential for all interviews.</p>
              <button className="brutal-btn brutal-btn-primary px-8 py-3 font-bold text-sm tracking-wider uppercase">
                Resume Module
              </button>
            </div>
            <div className="w-40 h-40 relative shrink-0">
              {/* Circular progress visual */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-bg-tertiary" strokeWidth="12" fill="none" />
                <motion.circle 
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 80 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="50" cy="50" r="40" 
                  className="stroke-accent-primary" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeLinecap="round" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-black text-text-primary font-mono">68%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Heatmap */}
          <ActivityHeatmap />

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Recent Submissions</h2>
            <div className="glass-panel rounded-xl overflow-hidden">
              {recentProblems.map((prob, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  key={prob.id} 
                  className={`p-4 flex items-center justify-between hover:bg-bg-secondary/50 transition-colors cursor-pointer ${idx !== recentProblems.length - 1 ? 'border-b border-border-default' : ''}`}
                >
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">{prob.title}</h4>
                    <p className="text-xs text-text-muted font-mono">{prob.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${difficultyColors[prob.difficulty]}`}>
                    {prob.difficulty}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
