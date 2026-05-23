import { useState, useMemo } from 'react';
import { ArrayBar, type ArrayElement } from '../shared/ArrayBar';
import { StepControls } from '../shared/StepControls';
import { CustomArrayInput } from '../shared/CustomArrayInput';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface BubbleSortFrame {
  array: ArrayElement[];
  description: string;
}

export function BubbleSortViz({ initialArray = [34, 12, 5, 87, 21, 65, 43, 90] }) {
  const [currentData, setCurrentData] = useState<number[]>(initialArray);

  const frames = useMemo(() => {
    const generatedFrames: BubbleSortFrame[] = [];
    
    // Initial mapping
    const currentArray: ArrayElement[] = currentData.map((val, idx) => ({
      id: `elem-${val}-${idx}`,
      value: val,
      state: 'idle'
    }));

    generatedFrames.push({
      array: JSON.parse(JSON.stringify(currentArray)),
      description: "Initial array state."
    });

    let n = currentArray.length;
    let swapped;

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        currentArray[j].state = 'comparing';
        currentArray[j + 1].state = 'comparing';
        
        generatedFrames.push({
          array: JSON.parse(JSON.stringify(currentArray)),
          description: `Comparing ${currentArray[j].value} and ${currentArray[j+1].value}.`
        });

        if (currentArray[j].value > currentArray[j + 1].value) {
          currentArray[j].state = 'swapping';
          currentArray[j + 1].state = 'swapping';
          
          generatedFrames.push({
            array: JSON.parse(JSON.stringify(currentArray)),
            description: `${currentArray[j].value} > ${currentArray[j+1].value}. Swapping them.`
          });

          // Swap
          let temp = currentArray[j];
          currentArray[j] = currentArray[j + 1];
          currentArray[j + 1] = temp;

          generatedFrames.push({
            array: JSON.parse(JSON.stringify(currentArray)),
            description: `Swapped.`
          });
          swapped = true;
        }

        currentArray[j].state = 'idle';
        currentArray[j + 1].state = 'idle';
      }
      
      currentArray[n - i - 1].state = 'sorted';
      generatedFrames.push({
        array: JSON.parse(JSON.stringify(currentArray)),
        description: `${currentArray[n - i - 1].value} is now locked in its sorted position.`
      });

      if (!swapped) break;
    }

    // Mark all as sorted
    for (let i = 0; i < currentArray.length; i++) {
      currentArray[i].state = 'sorted';
    }
    
    generatedFrames.push({
      array: JSON.parse(JSON.stringify(currentArray)),
      description: "Algorithm complete! Array is sorted."
    });

    return generatedFrames;
  }, [currentData]);

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

  const handleCustomArrayApply = (newArray: number[]) => {
    setCurrentData(newArray);
    reset();
  };

  const getBoxMaxWidth = (total: number) => {
    if (total <= 10) return '80px';
    if (total <= 20) return '60px';
    if (total <= 30) return '45px';
    return '35px';
  };
  const boxMaxWidth = getBoxMaxWidth(currentFrame.array.length);

  return (
    <div className="flex flex-col h-full bg-bg-primary p-4 gap-4">
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-2xl font-bold text-text-primary">Bubble Sort Visualization</h2>
      </div>

      {/* Description Panel */}
      <div className="bg-bg-elevated p-3 rounded-lg border border-border-default min-h-[60px] flex items-center shadow-md">
        <p className="text-text-primary text-base">
          <span className="font-bold text-accent-primary">Step {currentStep + 1}: </span> 
          {currentFrame.description}
        </p>
      </div>

      {/* Visualization Canvas */}
      <div className="w-full bg-transparent flex flex-col p-4 sm:p-8 relative transition-all duration-300">
        <div className="flex flex-wrap justify-center content-center gap-x-3 gap-y-6 w-full max-w-[900px] mx-auto">
          {currentFrame.array.map((element) => (
            <div 
              key={element.id} 
              style={{ width: 'calc(10% - 0.75rem)', maxWidth: boxMaxWidth }}
              className="flex justify-center items-center"
            >
              <ArrayBar element={element} />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <CustomArrayInput 
        onApply={handleCustomArrayApply} 
        defaultValue={currentData.join(", ")}
      />

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
