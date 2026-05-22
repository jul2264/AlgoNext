import { useMemo } from 'react';
import { ArrayBar, type ArrayElement } from '../shared/ArrayBar';
import { StepControls } from '../shared/StepControls';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface MergeSortFrame {
  array: ArrayElement[];
  description: string;
}

export function MergeSortViz({ initialArray = [34, 12, 5, 87, 21, 65, 43, 90] }) {
  const frames = useMemo(() => {
    const generatedFrames: MergeSortFrame[] = [];
    
    // Initial mapping
    let currentArray: ArrayElement[] = initialArray.map((val, idx) => ({
      id: `elem-${val}-${idx}`,
      value: val,
      state: 'idle'
    }));

    generatedFrames.push({
      array: JSON.parse(JSON.stringify(currentArray)),
      description: "Initial array state."
    });

    // Helper to capture a frame
    const captureFrame = (arr: ArrayElement[], desc: string) => {
      generatedFrames.push({
        array: JSON.parse(JSON.stringify(arr)),
        description: desc
      });
    };

    // Recursive Merge Sort
    const mergeSort = (arr: ArrayElement[], left: number, right: number) => {
      if (left >= right) return;

      const mid = Math.floor(left + (right - left) / 2);
      
      captureFrame(currentArray, `Dividing array from index ${left} to ${right} at mid ${mid}.`);

      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);

      merge(arr, left, mid, right);
    };

    const merge = (arr: ArrayElement[], left: number, mid: number, right: number) => {
      captureFrame(currentArray, `Merging sub-arrays [${left}...${mid}] and [${mid + 1}...${right}]`);

      // Highlight the range being merged
      for (let i = left; i <= right; i++) {
        currentArray[i].state = 'comparing';
      }
      captureFrame(currentArray, `Focusing on range to merge.`);

      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        currentArray[k].state = 'swapping';
        captureFrame(currentArray, `Comparing ${leftArr[i].value} and ${rightArr[j].value}`);

        if (leftArr[i].value <= rightArr[j].value) {
          currentArray[k] = { ...leftArr[i], state: 'swapping' };
          i++;
        } else {
          currentArray[k] = { ...rightArr[j], state: 'swapping' };
          j++;
        }
        
        captureFrame(currentArray, `Placed ${currentArray[k].value} at index ${k}.`);
        currentArray[k].state = 'sorted';
        k++;
      }

      while (i < leftArr.length) {
        currentArray[k] = { ...leftArr[i], state: 'swapping' };
        captureFrame(currentArray, `Placed remaining element ${leftArr[i].value} at index ${k}.`);
        currentArray[k].state = 'sorted';
        i++;
        k++;
      }

      while (j < rightArr.length) {
        currentArray[k] = { ...rightArr[j], state: 'swapping' };
        captureFrame(currentArray, `Placed remaining element ${rightArr[j].value} at index ${k}.`);
        currentArray[k].state = 'sorted';
        j++;
        k++;
      }

      // Re-map the updated segment to currentArray reference
      for (let idx = left; idx <= right; idx++) {
        arr[idx] = currentArray[idx];
      }
      
      captureFrame(currentArray, `Merge complete for range [${left}...${right}].`);
      
      // Reset state for elements not fully sorted yet (unless it's the final merge)
      if (left !== 0 || right !== arr.length - 1) {
        for (let idx = left; idx <= right; idx++) {
          currentArray[idx].state = 'idle';
        }
      } else {
        for (let idx = left; idx <= right; idx++) {
          currentArray[idx].state = 'sorted';
        }
      }
    };

    mergeSort(currentArray, 0, currentArray.length - 1);
    
    captureFrame(currentArray, "Algorithm complete! Array is fully sorted.");
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
  } = useStepPlayer({ totalSteps: frames.length, initialSpeed: 600 });

  const currentFrame = frames[currentStep];
  const maxValue = Math.max(...initialArray);

  return (
    <div className="flex flex-col h-full bg-bg-primary p-4 gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-text-primary">Merge Sort Visualization</h2>
      </div>

      <div className="bg-bg-elevated p-4 rounded-lg border border-border-default min-h-[80px] flex items-center shadow-lg">
        <p className="text-text-primary text-lg">
          <span className="font-bold text-accent-primary mr-2">Step {currentStep + 1}:</span> 
          {currentFrame.description}
        </p>
      </div>

      <div className="flex-1 bg-bg-secondary rounded-xl border border-border-default flex items-end justify-center p-8 gap-4 overflow-hidden relative shadow-inner">
        {currentFrame.array.map((element) => (
          <ArrayBar 
            key={element.id} 
            element={element} 
            maxValue={maxValue} 
          />
        ))}
      </div>

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
