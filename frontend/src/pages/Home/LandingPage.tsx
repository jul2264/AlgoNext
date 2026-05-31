import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Code2 } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && userId) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoaded, userId, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-accent-primary flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent" />
          <p className="font-medium">Loading AlgoNext...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-bg-primary overflow-hidden font-sans select-none px-4">
      {/* Background Neon Glow Circles (The 3 Color Scheme) */}
      {/* 1. Pink/Red Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      {/* 2. Cyan/Green Glow */}
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-secondary/10 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      {/* 3. Yellow Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-tertiary/5 blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center max-w-xl"
      >
        {/* Animated Logo Container */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-6 rounded-2xl bg-bg-secondary/40 border border-accent-secondary/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,204,0.15)] relative group"
          style={{ marginBottom: '3.5rem' }}
        >
          {/* Neon Borders Glows */}
          <div className="absolute inset-0 rounded-2xl border border-accent-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <Code2 size={72} className="text-accent-secondary drop-shadow-[0_0_15px_rgba(0,255,204,0.6)] animate-pulse" />
        </motion.div>

        {/* Title */}
        <h1 
          className="text-5xl sm:text-6xl font-extrabold tracking-tight font-display text-text-primary flex items-center gap-1"
          style={{ marginBottom: '1.75rem' }}
        >
          Algo<span className="text-accent-secondary drop-shadow-[0_0_12px_rgba(0,255,204,0.5)]">Next</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-base sm:text-lg text-text-secondary font-mono tracking-wide leading-relaxed"
          style={{ marginBottom: '4.5rem' }}
        >
          visualize and learn about DSA and DAA concepts
        </p>

        {/* Login & CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-6">
          <button
            onClick={() => navigate('/sign-in')}
            className="px-8 py-4 bg-accent-primary text-bg-primary font-mono font-bold text-base tracking-wider uppercase rounded-xl hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,45,120,0.3)] hover:shadow-[0_0_30px_rgba(255,45,120,0.5)] cursor-pointer"
          >
            Login to Start Learning
          </button>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 font-mono text-[10px] text-text-muted uppercase tracking-widest">
        AlgoNext platform &bull; Cyberpunk Edition
      </div>
    </div>
  );
}
