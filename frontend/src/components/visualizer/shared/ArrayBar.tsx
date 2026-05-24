import { motion } from 'motion/react';

export interface ArrayElement {
  id: string; // stable identifier for animation
  value: number;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted';
}

interface ArrayBarProps {
  element: ArrayElement;
}

export function ArrayBar({ element }: ArrayBarProps) {
  // Map states to design system colors
  const getStateColor = (state: ArrayElement['state']) => {
    switch (state) {
      case 'comparing': return 'var(--color-warning)'; // Yellow
      case 'swapping': return 'var(--color-error)';   // Red
      case 'sorted': return 'var(--color-success)';   // Green
      case 'idle':
      default: return 'var(--color-accent-primary)';  // Blue/Indigo
    }
  };

  return (
    <motion.div
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 1,
      }}
      className="flex flex-col items-center justify-center group w-full"
    >
      <motion.div
        animate={{
          backgroundColor: getStateColor(element.state),
        }}
        className="w-[80%] aspect-square max-w-[50px] rounded-lg border-2 border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative flex items-center justify-center overflow-hidden transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <span 
          className="text-white font-bold font-mono drop-shadow-md z-10"
          style={{ fontSize: 'clamp(0.7rem, 1.5vw, 1rem)' }}
        >
          {element.value}
        </span>
      </motion.div>
    </motion.div>
  );
}
