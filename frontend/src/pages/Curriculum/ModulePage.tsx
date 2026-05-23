import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ChevronLeft, Code2, BrainCircuit, Activity } from 'lucide-react';
import { apiClient } from '@/services/api.client';

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  tags: string[];
}

export function ModulePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: problems = [], isLoading, error } = useQuery({
    queryKey: ['problems', slug],
    queryFn: async () => {
      const response = await apiClient.get(`/problems/?category__slug=${slug}`);
      return response.data.results || response.data; // Handle paginated or non-paginated responses
    },
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-accent-secondary border-accent-secondary/30 bg-accent-secondary/10';
      case 'medium': return 'text-accent-tertiary border-accent-tertiary/30 bg-accent-tertiary/10';
      case 'hard': return 'text-accent-primary border-accent-primary/30 bg-accent-primary/10';
      default: return 'text-text-secondary border-border-default bg-bg-tertiary';
    }
  };

  return (
    <div className="w-full mx-auto py-10 min-h-[calc(100vh-4rem)] flex flex-col space-y-8" style={{ paddingLeft: '3vw', paddingRight: '3vw' }}>
      
      {/* Header Area */}
      <div className="flex items-center gap-6 mb-4">
        <button 
          onClick={() => navigate('/dsa')}
          className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
            DSA Module
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
          </div>
        ) : error ? (
          <div className="p-8 neon-card neon-card-pink text-center">
            <p className="text-accent-primary font-bold text-xl">Failed to load problems.</p>
            <p className="text-text-secondary mt-2">Please ensure your backend server is running.</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="p-12 border border-dashed border-border-default rounded-xl flex flex-col items-center justify-center text-center">
            <BrainCircuit size={48} className="text-text-muted mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-text-primary mb-2">No Problems Yet</h3>
            <p className="text-text-secondary max-w-md">There are currently no problems loaded for this specific module in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {problems.map((problem: Problem, idx: number) => (
              <motion.div
                key={problem.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/problems/${problem.slug}`} className="block h-full group">
                  <div className="neon-card flex flex-col h-full bg-bg-secondary border border-border-default hover:border-accent-secondary transition-all duration-300 relative overflow-hidden" style={{ padding: '24px' }}>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                         style={{ background: `linear-gradient(90deg, transparent, var(--color-accent-secondary), transparent)` }}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 bg-bg-tertiary rounded-lg border border-border-default group-hover:border-accent-secondary/50 transition-colors">
                        <Code2 size={20} className="text-text-muted group-hover:text-accent-secondary transition-colors" />
                      </div>
                      <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-display text-text-primary mb-3 group-hover:text-accent-secondary transition-colors line-clamp-1">
                      {problem.title}
                    </h3>
                    
                    <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1">
                      {problem.description || "Solve this algorithmic challenge and optimize your solution for time and space complexity."}
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {problem.tags && problem.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[11px] font-mono px-2 py-1 bg-bg-tertiary text-text-muted rounded border border-border-default">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border-default">
                        <div className="flex items-center gap-2 text-text-muted text-sm font-mono">
                          <Activity size={14} />
                          <span>0 Completions</span>
                        </div>
                        <span className="text-accent-secondary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Solve Challenge &rarr;
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
