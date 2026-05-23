import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface CustomArrayInputProps {
  onApply: (newArray: number[]) => void;
  defaultValue?: string;
  isProcessing?: boolean;
}

export function CustomArrayInput({ onApply, defaultValue = "34, 12, 5, 87, 21, 65, 43, 90", isProcessing = false }: CustomArrayInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    // Clear previous error
    setError(null);

    // Parse input (supports commas or spaces)
    const rawTokens = inputValue.split(/[\s,]+/).filter(t => t.trim() !== '');
    
    if (rawTokens.length === 0) {
      setError("Please enter some numbers.");
      return;
    }

    if (rawTokens.length > 50) {
      setError("Please enter a maximum of 50 numbers.");
      return;
    }

    const newArray: number[] = [];
    for (const token of rawTokens) {
      const num = parseInt(token, 10);
      if (isNaN(num)) {
        setError(`"${token}" is not a valid number.`);
        return;
      }
      if (num < 1 || num > 100) {
        setError("All numbers must be between 1 and 100.");
        return;
      }
      newArray.push(num);
    }

    onApply(newArray);
  };

  return (
    <div 
      className="bg-bg-elevated rounded-xl border border-border-default shadow-md w-full"
      style={{ padding: '1.5rem 3rem' }}
    >
      <h3 className="text-xl font-bold text-text-primary mb-2">Custom Array Input</h3>
      <p className="text-base text-text-muted mb-4">
        Enter up to 50 numbers (between 1 and 100), separated by commas or spaces.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            disabled={isProcessing}
            placeholder="e.g. 15, 8, 22, 50, 4"
            className="w-full bg-bg-secondary border border-border-default focus:border-accent-primary text-text-primary rounded-lg px-6 py-4 text-lg outline-none transition-colors"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={isProcessing}
          className="bg-transparent text-accent-primary hover:bg-accent-primary hover:text-white font-bold py-4 px-10 text-base rounded-lg transition-all hover:shadow-[0_0_15px_rgba(255,45,120,0.4)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-accent-primary disabled:hover:shadow-none whitespace-nowrap w-full sm:w-auto"
        >
          Apply Array
        </button>
      </div>

      {error && (
        <div className="mt-4 text-error-primary flex items-center gap-2 text-sm font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
