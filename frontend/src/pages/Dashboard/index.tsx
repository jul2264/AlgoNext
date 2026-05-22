import { BookOpen, Trophy, Clock, Code2 } from 'lucide-react';

export function DashboardPage() {
  const stats = [
    { label: 'Problems Solved', value: '24', icon: Code2, color: 'text-success' },
    { label: 'Current Streak', value: '5 days', icon: Trophy, color: 'text-warning' },
    { label: 'Hours Learned', value: '12.5', icon: Clock, color: 'text-accent-secondary' },
    { label: 'Curriculum Progress', value: '34%', icon: BookOpen, color: 'text-accent-primary' },
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back!</h1>
        <p className="text-text-secondary">Ready to continue your algorithmic journey?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-bg-elevated p-6 rounded-xl border border-border-default flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-lg bg-bg-secondary border border-border-default ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Continue Learning</h2>
          <div className="bg-bg-elevated rounded-xl border border-border-default p-6 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-2 block">Level 1: Foundations</span>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Arrays & Strings</h3>
              <p className="text-text-secondary mb-4 max-w-md">Master the fundamentals of array traversal, manipulation, and the two-pointer technique.</p>
              <button className="px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-lg font-medium transition-colors shadow-md shadow-accent-primary/20">
                Resume Module
              </button>
            </div>
            <div className="hidden md:block w-32 h-32 relative">
              {/* Circular progress visual */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-bg-secondary" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" className="stroke-accent-primary" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="80" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-text-primary">68%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Recent Submissions</h2>
          <div className="bg-bg-elevated rounded-xl border border-border-default overflow-hidden shadow-sm">
            {recentProblems.map((prob, idx) => (
              <div key={prob.id} className={`p-4 flex items-center justify-between ${idx !== recentProblems.length - 1 ? 'border-b border-border-default' : ''}`}>
                <div>
                  <h4 className="font-medium text-text-primary mb-1">{prob.title}</h4>
                  <p className="text-xs text-text-muted">{prob.date}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${difficultyColors[prob.difficulty]}`}>
                  {prob.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
