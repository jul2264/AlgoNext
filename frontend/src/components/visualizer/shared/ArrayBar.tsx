import { motion } from 'motion/react';

export interface ArrayElement {
  id: string; // stable identifier for animation
  value: number;
  state: 'idle' | 'comparing' | 'swapping' | 'sorted';
}

interface ArrayBarProps {
  element: ArrayElement;
  maxValue: number;
}

export function ArrayBar({ element, maxValue }: ArrayBarProps) {
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

  const percentHeight = (element.value / maxValue) * 100;

  return (
    <motion.div
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 1,
      }}
      className="flex flex-col items-center justify-end group"
      style={{ minWidth: '40px' }}
    >
      <div className="text-text-muted text-xs font-mono mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {element.value}
      </div>
      <motion.div
        animate={{
          backgroundColor: getStateColor(element.state),
          height: `${Math.max(percentHeight, 10)}%`, // At least 10% height
        }}
        className="w-12 rounded-t-md border border-black/20 shadow-lg relative overflow-hidden"
      >
        <div className="absolute bottom-2 w-full text-center text-white font-mono text-sm drop-shadow-md">
          {element.value}
        </div>
      </motion.div>
    </motion.div>
  );
}
