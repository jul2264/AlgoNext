import { BookOpen, Trophy, Clock, Code2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { apiClient } from '@/services/api.client';
import { PageHeader } from '@/components/layout/PageHeader';

export function DashboardPage() {
  const { user } = useUser();
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/progress/summary/')
      .then(res => setSummaryData(res.data))
      .catch(err => console.error('Failed to fetch summary data', err));
  }, []);

  const totalHours = summaryData?.recent_activity
    ? (summaryData.recent_activity.reduce((acc: number, curr: any) => acc + curr.time_spent_minutes, 0) / 60).toFixed(1)
    : '0.0';

  const stats = [
    { label: 'Problems Solved', value: summaryData?.solved_count?.toString() || '0', icon: Code2, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/30' },
    { label: 'Current Streak', value: `${summaryData?.streak?.current_streak || 0} days`, icon: Trophy, color: 'text-accent-tertiary', bg: 'bg-accent-tertiary/10', border: 'border-accent-tertiary/30' },
    { label: 'Hours Learned', value: totalHours, icon: Clock, color: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/30' },
    { label: 'DSA Progress', value: '34%', icon: BookOpen, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/30' },
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
    <div 
      className="w-full mx-auto pb-4 flex flex-col gap-4 min-h-[calc(100vh-4rem)]"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
              Welcome back, <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">{user?.firstName || 'Student'}!</span>
            </h1>
          </motion.div>
        </div>
      </PageHeader>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        {/* Stats Grid - Cyberpunk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="neon-card flex flex-col justify-center items-center text-center gap-3 group"
              style={{ paddingTop: '0.75rem', paddingBottom: '1rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <div className={`${stat.color} transition-transform duration-300`}>
                <stat.icon size={36} />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-text-primary font-mono mb-1">{stat.value}</h3>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider font-mono">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Continue Learning - Cyberpunk Panel */}
          <div className="col-span-2">
            <div className="neon-card neon-card-yellow py-4 px-10 flex flex-col justify-center items-center text-center gap-3 relative h-full">
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-sm font-bold text-accent-tertiary font-mono uppercase tracking-widest mb-1">Resume Module</h2>
                <h3 className="text-3xl font-bold text-text-primary mb-1">Arrays & Strings</h3>
                <p className="text-text-secondary leading-snug max-w-md text-base text-center">Master the fundamentals of array traversal, manipulation, and the two-pointer technique. Essential for all interviews.</p>
              </div>
              
              <div className="w-36 h-36 relative shrink-0 my-1">
                {/* Circular progress visual */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" className="stroke-bg-tertiary" strokeWidth="6" fill="none" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 84 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="42" 
                    className="stroke-accent-tertiary" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray="264" 
                    strokeLinecap="round" 
                    style={{ filter: 'drop-shadow(0 0 2px rgba(255,224,74,0.3))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-text-primary font-mono drop-shadow-[0_0_2px_currentColor]">68%</span>
                  <span className="text-[10px] text-text-muted font-mono uppercase mt-1 tracking-widest">Complete</span>
                </div>
              </div>
              
              <div className="w-full flex justify-center mt-1">
                <button className="neon-btn neon-btn-cyan w-full md:w-2/3 px-8 py-3 text-sm font-bold tracking-wider hover:bg-accent-secondary/5">
                  RESUME MODULE
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 h-full">
            {/* Heatmap */}
            <ActivityHeatmap activities={summaryData?.recent_activity || []} />

            {/* Recent Activity */}
            <div className="neon-card flex-1 flex flex-col" style={{ padding: '16px 40px' }}>
              <h2 className="text-lg font-bold text-text-primary mb-3 font-display">Recent Submissions</h2>
              <div className="space-y-4">
                {recentProblems.map((prob, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    key={prob.id} 
                    className={`p-3 flex items-center justify-between hover:bg-bg-tertiary/50 transition-colors cursor-pointer rounded-lg border border-transparent hover:border-border-default`}
                  >
                    <h4 className="font-normal text-text-primary text-sm">{prob.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border font-mono ${difficultyColors[prob.difficulty]}`}>
                      {prob.difficulty}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
