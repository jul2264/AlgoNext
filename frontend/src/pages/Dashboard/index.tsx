import { BookOpen, Trophy, Clock, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';

export function DashboardPage() {
  const stats = [
    { label: 'Problems Solved', value: '24', icon: Code2, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/30' },
    { label: 'Current Streak', value: '5 days', icon: Trophy, color: 'text-accent-tertiary', bg: 'bg-accent-tertiary/10', border: 'border-accent-tertiary/30' },
    { label: 'Hours Learned', value: '12.5', icon: Clock, color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/30' },
    { label: 'Curriculum Progress', value: '34%', icon: BookOpen, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/30' },
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
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
            Welcome back, <span className="neon-text-secondary">Demo Student!</span>
          </h1>
        </motion.div>
      </div>

      {/* Stats Grid - Cyberpunk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="neon-card p-6 flex items-center gap-4 group"
          >
            <div className={`p-4 rounded-xl border ${stat.bg} ${stat.border} ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-[0_0_12px_currentColor]`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted mb-1 uppercase tracking-wider font-mono">{stat.label}</p>
              <h3 className="text-3xl font-bold text-text-primary font-mono">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Continue Learning - Cyberpunk Panel */}
        <div className="col-span-2 space-y-4">
          <div className="neon-card neon-card-yellow p-8 flex flex-col md:flex-row justify-between items-center gap-8 h-full">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text-primary font-display mb-8">Resume Module</h2>
              <h3 className="text-3xl font-bold text-text-primary mb-3">Arrays & Strings</h3>
              <p className="text-text-secondary mb-8 leading-relaxed">Master the fundamentals of array traversal, manipulation, and the two-pointer technique. Essential for all interviews.</p>
              <button className="neon-btn neon-btn-cyan w-full py-4 text-sm font-bold tracking-wider hover:bg-accent-secondary/10">
                RESUME MODULE
              </button>
            </div>
            <div className="w-48 h-48 relative shrink-0">
              {/* Circular progress visual */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-bg-tertiary" strokeWidth="12" fill="none" />
                <motion.circle 
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 80 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="50" cy="50" r="40" 
                  className="stroke-accent-tertiary" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeLinecap="round" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,224,74,0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-text-primary font-mono">68%</span>
                <span className="text-xs text-text-muted font-mono uppercase">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8 flex flex-col">
          {/* Heatmap */}
          <ActivityHeatmap />

          {/* Recent Activity */}
          <div className="neon-card flex-1 flex flex-col p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4 font-display">Recent Submissions</h2>
            <div className="space-y-2">
              {recentProblems.map((prob, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  key={prob.id} 
                  className={`p-3 flex items-center justify-between hover:bg-bg-tertiary/50 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-border-default`}
                >
                  <h4 className="font-bold text-text-primary text-sm">{prob.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border font-mono ${difficultyColors[prob.difficulty]}`}>
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
