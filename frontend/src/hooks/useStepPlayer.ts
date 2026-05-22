import { useState, useEffect, useCallback, useRef } from 'react';

export interface StepPlayerOptions {
  totalSteps: number;
  initialSpeed?: number; // milliseconds per step
}

export function useStepPlayer({ totalSteps, initialSpeed = 500 }: StepPlayerOptions) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      // If we are at the end and click play, restart
      if (!prev && currentStep >= totalSteps - 1) {
        setCurrentStep(0);
      }
      return !prev;
    });
  }, [currentStep, totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      if (currentStep >= totalSteps - 1) {
        setIsPlaying(false);
        return;
      }
      
      timerRef.current = setTimeout(() => {
        nextStep();
      }, speed);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, totalSteps, speed, nextStep]);

  return {
    currentStep,
    setCurrentStep,
    isPlaying,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    speed,
    setSpeed,
    isComplete: currentStep >= totalSteps - 1,
  };
}
