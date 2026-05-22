import { useMemo } from 'react';
import { ArrayBar, type ArrayElement } from '../shared/ArrayBar';
import { StepControls } from '../shared/StepControls';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface BubbleSortFrame {
  array: ArrayElement[];
  description: string;
}

export function BubbleSortViz({ initialArray = [34, 12, 5, 87, 21, 65, 43, 90, 1] }) {
  // Generate the animation frames once
  const frames = useMemo(() => {
    const generatedFrames: BubbleSortFrame[] = [];
    
    // Deep copy and assign IDs for framer-motion tracking
    let arr: ArrayElement[] = initialArray.map((val, idx) => ({
      id: `elem-${val}-${idx}`,
      value: val,
      state: 'idle'
    }));

    // Initial state
    generatedFrames.push({
      array: JSON.parse(JSON.stringify(arr)),
      description: "Initial array state."
    });

    const n = arr.length;
    let swapped;

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        // Highlighting current pair
        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        generatedFrames.push({
          array: JSON.parse(JSON.stringify(arr)),
          description: `Comparing ${arr[j].value} and ${arr[j + 1].value}.`
        });

        if (arr[j].value > arr[j + 1].value) {
          // Highlight swapping
          arr[j].state = 'swapping';
          arr[j + 1].state = 'swapping';
          generatedFrames.push({
            array: JSON.parse(JSON.stringify(arr)),
            description: `${arr[j].value} > ${arr[j + 1].value}, so we swap them.`
          });

          // Perform swap
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          
          generatedFrames.push({
            array: JSON.parse(JSON.stringify(arr)),
            description: `Swapped!`
          });
          swapped = true;
        }

        // Reset to idle after comparison
        arr[j].state = 'idle';
        arr[j + 1].state = 'idle';
      }

      // The last element in the current pass is guaranteed to be in its correct place
      arr[n - i - 1].state = 'sorted';
      generatedFrames.push({
        array: JSON.parse(JSON.stringify(arr)),
        description: `${arr[n - i - 1].value} is now in its correct sorted position.`
      });

      if (!swapped) {
        generatedFrames.push({
          array: JSON.parse(JSON.stringify(arr)),
          description: `No swaps occurred in this pass, meaning the array is completely sorted!`
        });
        break;
      }
    }

    // Mark remaining elements as sorted
    arr.forEach(item => item.state = 'sorted');
    generatedFrames.push({
      array: JSON.parse(JSON.stringify(arr)),
      description: "Algorithm complete! Array is sorted."
    });

    return generatedFrames;
  }, [initialArray]);

  const {
    currentStep,
    isPlaying,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    speed,
    setSpeed
  } = useStepPlayer({ totalSteps: frames.length, initialSpeed: 500 });

  const currentFrame = frames[currentStep];
  const maxValue = Math.max(...initialArray);

  return (
    <div className="flex flex-col h-full bg-bg-primary p-4 gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-text-primary">Bubble Sort Visualization</h2>
      </div>

      {/* Description Panel */}
      <div className="bg-bg-elevated p-4 rounded-lg border border-border-default min-h-[80px] flex items-center shadow-lg">
        <p className="text-text-primary text-lg">
          <span className="font-bold text-accent-primary mr-2">Step {currentStep + 1}:</span> 
          {currentFrame.description}
        </p>
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 bg-bg-secondary rounded-xl border border-border-default flex items-end justify-center p-8 gap-4 overflow-hidden relative shadow-inner">
        {currentFrame.array.map((element) => (
          <ArrayBar 
            key={element.id} 
            element={element} 
            maxValue={maxValue} 
          />
        ))}
      </div>

      {/* Controls */}
      <StepControls
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextStep}
        onPrev={prevStep}
        onReset={reset}
        currentStep={currentStep}
        totalSteps={frames.length}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
