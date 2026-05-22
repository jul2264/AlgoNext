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
    <div className="flex flex-col gap-4 bg-bg-elevated p-4 rounded-lg border border-border-default">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Step {currentStep + 1}</span>
          <span>{totalSteps} Total</span>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className="bg-accent-primary h-2 transition-all duration-300 ease-in-out"
            style={{ width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Step"
          >
            <SkipBack size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="p-2 bg-accent-primary hover:bg-accent-hover text-white rounded-md transition-colors shadow-md shadow-accent-primary/20"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Step"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted w-12">{speedMultiplier}x</span>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            // Invert the slider visually so right is faster (lower milliseconds)
            value={2050 - speed}
            onChange={(e) => onSpeedChange(2050 - Number(e.target.value))}
            className="w-24 accent-accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
