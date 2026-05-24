import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

interface StepControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function StepControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onReset,
  currentStep,
  totalSteps,
  speed,
  onSpeedChange,
}: StepControlsProps) {
  // Speed options (lower value = faster)
  const speedMultiplier = Math.round((1000 / speed) * 10) / 10;

  return (
    <div 
      className="bg-bg-elevated rounded-xl border border-border-default shadow-lg flex flex-col gap-4 w-full"
      style={{ padding: '1rem 2rem' }}
    >
      {/* Top: Scrubber */}
      <div className="w-full relative">
        <div className="flex justify-between text-[10px] sm:text-xs text-text-muted mb-2 font-mono tracking-wider font-bold">
          <span>Step {currentStep + 1}</span>
          <span>{totalSteps} Total</span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className="bg-accent-primary h-full transition-all duration-300 relative shadow-[0_0_10px_rgba(255,45,120,0.5)]"
            style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100}%` }}
          />
        </div>
      </div>

      {/* Bottom: Controls Grid */}
      <div className="grid grid-cols-3 items-center w-full gap-4">
        {/* Left: Reset */}
        <div className="flex justify-start">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-text-muted hover:text-white hover:bg-bg-secondary rounded-lg transition-colors font-bold text-sm"
            title="Reset"
          >
            <RotateCcw size={20} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Center: Playback */}
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="p-1 sm:p-2 text-text-muted hover:text-white hover:bg-bg-secondary rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Step"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>
          
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 flex items-center justify-center bg-accent-primary hover:bg-accent-hover text-white rounded-xl transition-all shadow-[0_0_15px_rgba(255,45,120,0.4)] hover:shadow-[0_0_25px_rgba(255,45,120,0.6)] hover:scale-105"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 text-text-muted hover:text-white hover:bg-bg-secondary rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Step"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Right: Speed */}
        <div className="flex flex-col items-end justify-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-text-muted font-mono font-bold uppercase tracking-widest">Speed</span>
            <span className="text-sm text-white font-bold">{speedMultiplier}x</span>
          </div>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={2050 - speed}
            onChange={(e) => onSpeedChange(2050 - Number(e.target.value))}
            className="w-24 sm:w-32 accent-accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
