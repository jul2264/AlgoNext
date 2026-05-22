import { motion } from 'motion/react';

export function ActivityHeatmap() {
  // Generate dummy heatmap data (7 days * 15 weeks)
  const weeks = 15;
  const days = 7;
  const data = Array.from({ length: weeks * days }, () => Math.floor(Math.random() * 5));

  const getColor = (level: number) => {
    switch(level) {
      case 0: return 'bg-bg-tertiary border-border-default';
      case 1: return 'bg-accent-primary/20 border-accent-primary/30';
      case 2: return 'bg-accent-primary/40 border-accent-primary/50';
      case 3: return 'bg-accent-primary/70 border-accent-primary/80';
      case 4: return 'bg-accent-primary border-accent-primary';
      default: return 'bg-bg-tertiary border-border-default';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">Learning Activity</h3>
        <span className="text-sm font-medium text-text-muted">42 contributions in the last 15 weeks</span>
      </div>
      
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 text-xs text-text-muted justify-around py-1 font-mono">
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
                      className={`w-3 h-3 rounded-[3px] border ${getColor(level)}`}
                      title={`${level} problems solved`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 text-xs text-text-muted mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-3 h-3 rounded-[3px] border ${getColor(level)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
