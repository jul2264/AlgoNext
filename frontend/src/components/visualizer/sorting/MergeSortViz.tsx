import { useState, useMemo } from 'react';
import { ArrayBar, type ArrayElement } from '../shared/ArrayBar';
import { StepControls } from '../shared/StepControls';
import { CustomArrayInput } from '../shared/CustomArrayInput';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface MergeSortFrame {
  array: ArrayElement[];
  description: string;
}

export function MergeSortViz({ initialArray = [34, 12, 5, 87, 21, 65, 43, 90] }) {
  const [currentData, setCurrentData] = useState<number[]>(initialArray);

  const frames = useMemo(() => {
    const generatedFrames: MergeSortFrame[] = [];
    
    // Initial mapping
    let currentArray: ArrayElement[] = currentData.map((val, idx) => ({
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
  } = useStepPlayer({ totalSteps: frames.length, initialSpeed: 600 });

  const currentFrame = frames[currentStep];

  const getBoxMaxWidth = (total: number) => {
    if (total <= 10) return '80px';
    if (total <= 20) return '60px';
    if (total <= 30) return '45px';
    return '35px';
  };
  const boxMaxWidth = getBoxMaxWidth(frames[currentStep].array.length);

  return (
    <div className="flex flex-col h-full bg-bg-primary p-2 sm:p-4 gap-3">

      <div 
        className="bg-bg-elevated rounded-lg border border-border-default min-h-[50px] flex items-center shadow-md"
        style={{ padding: '1.25rem 2rem' }}
      >
        <p className="text-text-primary text-lg">
          <span className="font-bold text-accent-primary">Step {currentStep + 1}: </span> 
          {currentFrame.description}
        </p>
      </div>

      <div className="w-full bg-transparent flex flex-col p-2 sm:p-4 relative transition-all duration-300">
        <div className="flex flex-wrap justify-center content-center gap-x-2 gap-y-3 w-full max-w-[900px] mx-auto">
          {frames[currentStep].array.map((element) => (
            <div 
              key={element.id} 
              style={{ width: 'calc(10% - 0.5rem)', maxWidth: boxMaxWidth }}
              className="flex justify-center items-center"
            >
              <ArrayBar element={element} />
            </div>
          ))}
        </div>
      </div>

      <CustomArrayInput 
        onApply={(newArr) => {
          setCurrentData(newArr);
          reset();
        }} 
        defaultValue={currentData.join(", ")}
      />

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
