import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';

interface ActivityHeatmapProps {
  activities?: any[];
}

export function ActivityHeatmap({ activities = [] }: ActivityHeatmapProps) {
  const [activeDay, setActiveDay] = useState<{ date: string; level: number } | null>(null);

  
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };
  
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
    const currentYear = today.getFullYear();
    
    // Start on the first Monday on or before Jan 1st
    const startDay = new Date(currentYear, 0, 1);
    const dayOfWeek = startDay.getDay(); 
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    startDay.setDate(startDay.getDate() - offset);

    // End on the last Sunday on or after Dec 31st
    const endDay = new Date(currentYear, 11, 31);
    const endDayOfWeek = endDay.getDay();
    const endOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDay.setDate(endDay.getDate() + endOffset);

    const totalDays = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);

    const resultGrid = [];
    const labels = [];
    
    let currentDay = new Date(startDay);

    for (let w = 0; w < weeks; w++) {
      const weekCol = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDay.toISOString().split('T')[0];
        
        // Add label on the first Monday of each month
        if (d === 0 && currentDay.getDate() <= 7) {
          labels.push({ month: currentDay.toLocaleString('default', { month: 'short' }), index: w });
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
      <div className="flex items-center justify-between min-h-[32px]">
        <h3 className="text-lg font-bold text-text-primary font-display">Activity Heatmap</h3>
        <AnimatePresence>
          {activeDay && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-bg-tertiary border border-border-default px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            >
              <span className="text-text-primary font-bold">{formatDate(activeDay.date)}</span>
              <span className="text-text-muted">|</span>
              <span className={`w-2.5 h-2.5 rounded-full border ${getColor(activeDay.level)}`} />
              <span className="text-text-secondary">Level {activeDay.level}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-[4px] text-[10px] text-text-muted font-mono pt-5">
          <span className="h-[10px] leading-[10px]"></span>
          <span className="h-[10px] leading-[10px]">Mon</span>
          <span className="h-[10px] leading-[10px]"></span>
          <span className="h-[10px] leading-[10px]">Wed</span>
          <span className="h-[10px] leading-[10px]"></span>
          <span className="h-[10px] leading-[10px]">Fri</span>
          <span className="h-[10px] leading-[10px]"></span>
        </div>
        
        <div className="flex-1 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex flex-col gap-[2px] min-w-max">
            {/* Month labels */}
            <div className="flex relative h-4 text-[10px] text-text-muted font-mono uppercase">
              {monthLabels.map((lbl, idx) => (
                <div key={idx} className="absolute top-0" style={{ left: `${lbl.index * (10 + 2)}px` }}>
                  {lbl.month}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-[2px]">
              {grid.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[2px]">
                  {week.map((day, dIdx) => (
                    <motion.div
                      key={dIdx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (wIdx * 7 + dIdx) * 0.001, type: 'spring' }}
                      className={`cursor-pointer hover:ring-2 hover:ring-accent-primary transition-all w-[10px] h-[10px] rounded-[2px] border ${getColor(day.level)} ${day.isFuture ? 'opacity-30' : ''}`}
                      onClick={() => setActiveDay(day)}
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
