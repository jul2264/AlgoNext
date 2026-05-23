import { motion } from 'motion/react';

export function ActivityHeatmap() {
  // Generate dummy heatmap data (7 days * 15 weeks)
  const weeks = 15;
  const days = 7;
  const data = Array.from({ length: weeks * days }, () => Math.floor(Math.random() * 5));

  const getColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-bg-tertiary border-border-default';
      case 1: return 'bg-emerald-900/50 border-emerald-800/50';
      case 2: return 'bg-emerald-700/70 border-emerald-600/70';
      case 3: return 'bg-emerald-500/90 border-emerald-400/90';
      case 4: return 'bg-emerald-400 border-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]';
      default: return 'bg-bg-tertiary border-border-default';
    }
  };

  return (
    <div className="neon-card rounded-xl flex flex-col gap-4" style={{ padding: '16px 40px' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-text-primary font-display">Activity Heatmap</h3>
      </div>
      
      <div className="flex gap-8">
        <div className="flex flex-col gap-2 text-[10px] text-text-muted justify-around py-1 font-mono uppercase">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-1.5">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1.5">
                {Array.from({ length: days }).map((_, dayIndex) => {
                  const dataIndex = weekIndex * days + dayIndex;
                  const level = data[dataIndex];
                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: dataIndex * 0.005, type: 'spring' }}
                      className={`w-3 h-3 rounded-sm border ${getColor(level)}`}
                      title={`${level} problems solved`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-text-muted uppercase tracking-wider border-t border-border-default pt-4">
        <span>Activity</span>
        <div className="flex gap-1 items-center">
          <span className="mr-2">Low</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-3 h-3 rounded-sm border ${getColor(level)}`} />
          ))}
          <span className="ml-2">High</span>
        </div>
      </div>
    </div>
  );
}
