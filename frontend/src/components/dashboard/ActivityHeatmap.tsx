import { motion } from 'motion/react';
import { useMemo } from 'react';

interface ActivityHeatmapProps {
  activities?: any[];
}

export function ActivityHeatmap({ activities = [] }: ActivityHeatmapProps) {
  const weeks = 52;
  const days = 7;
  
  const activityMap = useMemo(() => {
    const map = new Map();
    activities.forEach(act => {
      let level = 0;
      if (act.problems_solved > 0) level = 1;
      if (act.problems_solved >= 3) level = 2;
      if (act.problems_solved >= 5) level = 3;
      if (act.problems_solved >= 10) level = 4;
      map.set(act.date, level);
    });
    return map;
  }, [activities]);

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date();
    const resultGrid = [];
    const labels = [];
    let lastMonth = -1;
    
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - (weeks * days - 1));

    let currentDay = new Date(startDay);

    for (let w = 0; w < weeks; w++) {
      const weekCol = [];
      for (let d = 0; d < days; d++) {
        const dateStr = currentDay.toISOString().split('T')[0];
        
        if (d === 0 && currentDay.getMonth() !== lastMonth && w < weeks - 2) {
          labels.push({ month: currentDay.toLocaleString('default', { month: 'short' }), index: w });
          lastMonth = currentDay.getMonth();
        }
        
        weekCol.push({
          date: dateStr,
          level: activityMap.get(dateStr) || 0,
          isFuture: currentDay > today
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      resultGrid.push(weekCol);
    }
    
    return { grid: resultGrid, monthLabels: labels };
  }, [activityMap]);

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
    <div className="neon-card rounded-xl flex flex-col gap-3" style={{ padding: '16px 24px' }}>
      <h3 className="text-lg font-bold text-text-primary font-display">Activity Heatmap</h3>
      
      <div className="flex gap-4">
        {/* Day labels */}
        <div className="flex flex-col gap-[6px] text-[10px] text-text-muted font-mono pt-5">
          <span className="h-3 leading-3"></span>
          <span className="h-3 leading-3">Mon</span>
          <span className="h-3 leading-3"></span>
          <span className="h-3 leading-3">Wed</span>
          <span className="h-3 leading-3"></span>
          <span className="h-3 leading-3">Fri</span>
          <span className="h-3 leading-3"></span>
        </div>
        
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex flex-col gap-1 min-w-max">
            {/* Month labels */}
            <div className="flex relative h-4 text-[10px] text-text-muted font-mono uppercase">
              {monthLabels.map((lbl, idx) => (
                <div key={idx} className="absolute top-0" style={{ left: `${lbl.index * (12 + 4)}px` }}>
                  {lbl.month}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-1">
              {grid.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <motion.div
                      key={dIdx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (wIdx * 7 + dIdx) * 0.001, type: 'spring' }}
                      className={`w-3 h-3 rounded-[2px] border ${day.isFuture ? 'bg-transparent border-transparent' : getColor(day.level)}`}
                      title={`${day.date}: Level ${day.level}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-2 text-[10px] font-mono text-text-muted uppercase tracking-wider pt-2">
        <div className="flex gap-1 items-center">
          <span className="mr-2">Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-3 h-3 rounded-[2px] border ${getColor(level)}`} />
          ))}
          <span className="ml-2">More</span>
        </div>
      </div>
    </div>
  );
}
