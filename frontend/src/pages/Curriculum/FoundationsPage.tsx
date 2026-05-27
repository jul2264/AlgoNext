import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, BookOpen, Layers, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award 
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

// Static Data for Foundations Page
const OPERATIONS = [
  { operation: 'Variable Declaration / Assignment', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Allocating memory and storing a primitive value.' },
  { operation: 'Array Index Access', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Retrieving an element via direct memory offset.' },
  { operation: "Arithmetic Operation\n(+, -, *, /)", timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Basic CPU ALU cycle operation.' },
  { operation: 'Single Loop (1 to N)', timeComplexity: 'O(N)', spaceComplexity: 'O(1)', description: 'Iterating linearly through elements.' },
  { operation: 'Nested Loops (N x N)', timeComplexity: 'O(N²)', spaceComplexity: 'O(1)', description: 'Comparing every pair of elements.' },
  { operation: 'Recursive Call Stack Frame', timeComplexity: 'O(1) per call', spaceComplexity: 'O(D) depth', description: 'Pushing a function frame onto the runtime call stack.' },
];

const CODE_IMPLEMENTATIONS = {
  python: `def factorial(n):
    # Base Case: stop the recursion
    if n <= 1:
        return 1
        
    # Recursive Case: call self with n - 1
    return n * factorial(n - 1)

# Usage
result = factorial(3)
print(f"Result: {result}")`,
  javascript: `function factorial(n) {
    // Base Case: stop the recursion
    if (n <= 1) {
        return 1;
    }
    
    // Recursive Case: call self with n - 1
    return n * factorial(n - 1);
}

// Usage
const result = factorial(3);
console.log(\`Result: \${result}\`);`,
  cpp: `#include <iostream>

int factorial(int n) {
    // Base Case: stop the recursion
    if (n <= 1) {
        return 1;
    }
    
    // Recursive Case: call self with n - 1
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(3);
    std::cout << "Result: " << result << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static int factorial(int n) {
        // Base Case: stop the recursion
        if (n <= 1) {
            return 1;
        }
        
        // Recursive Case: call self with n - 1
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(3);
        System.out.println("Result: " + result);
    }
}`
};

const PROBLEM_SAMPLE_CODES = {
  'Fibonacci Sequence': `def fibonacci(n):
    # Base cases
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    # Recursive case
    return fibonacci(n - 1) + fibonacci(n - 2)

# Run Fibonacci for n = 6
n = 6
print(f"Fibonacci({n}) = {fibonacci(n)}")`,

  'Climbing Stairs': `def climb_stairs(n):
    if n <= 2:
        return n
    
    # Iterative state simulation
    prev2 = 1
    prev1 = 2
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1

# Run Climbing Stairs for n = 5
n = 5
print(f"Ways to climb {n} stairs: {climb_stairs(n)}")`,

  'Towers of Hanoi': `def hanoi(n, source, target, auxiliary):
    if n > 0:
        # Move n-1 disks from source to auxiliary
        hanoi(n - 1, source, auxiliary, target)
        
        # Move the nth disk from source to target
        print(f"Move disk {n} from {source} to {target}")
        
        # Move the n-1 disks from auxiliary to target
        hanoi(n - 1, auxiliary, target, source)

# Solve for 3 disks on Pegs A, C, B
print("Solving Towers of Hanoi for 3 disks:")
hanoi(3, 'Peg A', 'Peg C', 'Peg B')`,

  'Binary Search': `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        guess = arr[mid]
        if guess == target:
            return mid
        if guess > target:
            high = mid - 1
        else:
            low = mid + 1
    return -1

# Search in sorted array
arr = [1, 3, 5, 7, 9, 11, 13, 15]
target = 9
idx = binary_search(arr, target)
print(f"Array: {arr}")
print(f"Search for {target} -> Index: {idx}")`
};

// Simulation Steps for Recursion Call Stack Visualizer: factorial(3)
const VISUALIZATION_STEPS = [
  {
    step: 0,
    line: 1,
    description: 'Initial function call is made to factorial(3). Pushing first stack frame.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'active', returnValue: null }
    ]
  },
  {
    step: 1,
    line: 2,
    description: 'Evaluating base case: is n <= 1? (3 <= 1) is False. Continuing to recursive case.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'evaluating', returnValue: null }
    ]
  },
  {
    step: 2,
    line: 5,
    description: 'Recursive case reached: return 3 * factorial(2). Suspending factorial(3) and calling factorial(2).',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'active', returnValue: null }
    ]
  },
  {
    step: 3,
    line: 2,
    description: 'Evaluating base case for factorial(2): is n <= 1? (2 <= 1) is False. Continuing to recursive case.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'evaluating', returnValue: null }
    ]
  },
  {
    step: 4,
    line: 5,
    description: 'Recursive case reached: return 2 * factorial(1). Suspending factorial(2) and calling factorial(1).',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'suspended', returnValue: null },
      { id: 3, name: 'factorial(1)', param: 'n = 1', status: 'active', returnValue: null }
    ]
  },
  {
    step: 5,
    line: 2,
    description: 'Evaluating base case for factorial(1): is n <= 1? (1 <= 1) is True! Preparing to return 1.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'suspended', returnValue: null },
      { id: 3, name: 'factorial(1)', param: 'n = 1', status: 'returning', returnValue: '1' }
    ]
  },
  {
    step: 6,
    line: 3,
    description: 'factorial(1) resolves and returns 1. Popping frame from stack.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'resolving', returnValue: '2 * factorial(1) = 2 * 1' }
    ]
  },
  {
    step: 7,
    line: 5,
    description: 'factorial(2) completes calculation: 2 * 1 = 2. Preparing to return 2. Popping frame from stack.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'resolving', returnValue: '3 * factorial(2) = 3 * 2' }
    ]
  },
  {
    step: 8,
    line: 5,
    description: 'factorial(3) completes calculation: 3 * 2 = 6. All call stack frames resolved. Final answer: 6.',
    stack: []
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(log N)", "O(N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Array retrieval by index is O(1) because it uses a direct memory offset calculation."
  },
  {
    question: "Which data structure follows the LIFO principle?",
    options: ["Queue", "Stack", "Linked List", "Heap"],
    answer: 1,
    explanation: "Stack is a Last-In, First-Out (LIFO) data structure where elements are pushed and popped from the same end."
  },
  {
    question: "What is the base case in recursion?",
    options: ["The recursive call", "The first loop iteration", "The condition that stops recursion", "The return statement only"],
    answer: 2,
    explanation: "The base case is the halting condition in a recursive function that prevents further self-invocation and stops stack frame creation."
  },
  {
    question: "What happens if recursion has no base case?",
    options: ["Faster execution", "Memory optimization", "Stack Overflow", "Infinite loop in heap memory"],
    answer: 2,
    explanation: "Without a base case, recursion loops infinitely until the program runs out of call stack space, triggering a Stack Overflow."
  },
  {
    question: "Which memory area stores function call frames?",
    options: ["Heap Memory", "Stack Memory", "Cache Memory", "ROM"],
    answer: 1,
    explanation: "Stack memory is automatically managed and stores function call frames, local variables, and return addresses."
  },
  {
    question: "What is the time complexity of a single loop running from 1 to N?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "A single loop iterating N times performs operations proportional to N, giving a linear complexity of O(N)."
  },
  {
    question: "Which operation is generally performed in constant time?",
    options: ["Nested Loop Traversal", "Binary Search", "Variable Assignment", "Merge Sort"],
    answer: 2,
    explanation: "Variable assignment takes a fixed number of CPU cycles and executes in O(1) constant time."
  },
  {
    question: "What is the worst-case time complexity of nested loops (N × N)?",
    options: ["O(N)", "O(log N)", "O(N²)", "O(2N)"],
    answer: 2,
    explanation: "Nested loops running up to N execute the inner statement N * N times, resulting in a quadratic complexity of O(N²)."
  },
  {
    question: "Which data structure is commonly used for Undo/Redo functionality?",
    options: ["Queue", "Heap", "Stack", "Trie"],
    answer: 2,
    explanation: "Undo/Redo features push states onto a stack, popping the latest action to reverse it (LIFO)."
  },
  {
    question: "Which algorithm repeatedly divides the search space into halves?",
    options: ["Bubble Sort", "DFS", "Binary Search", "BFS"],
    answer: 2,
    explanation: "Binary Search splits a sorted search interval in half at each step, making retrieval highly efficient."
  },
  {
    question: "What is the time complexity of Binary Search?",
    options: ["O(1)", "O(N)", "O(log N)", "O(N²)"],
    answer: 2,
    explanation: "Binary search repeatedly halves the search space, giving a logarithmic time complexity of O(log N)."
  },
  {
    question: "Which memory type dynamically allocates objects during runtime?",
    options: ["Stack Memory", "Heap Memory", "CPU Registers", "Cache"],
    answer: 1,
    explanation: "Heap memory is used for dynamic memory allocation, where objects remain until freed manually or by garbage collection."
  },
  {
    question: "Which data structure is best suited for FIFO operations?",
    options: ["Stack", "Queue", "Heap", "BST"],
    answer: 1,
    explanation: "A Queue operates on a First-In, First-Out (FIFO) basis where elements are added at the rear and removed from the front."
  },
  {
    question: "In recursion, each function call creates a new:",
    options: ["Heap Node", "Stack Frame", "Queue Entry", "Hash Bucket"],
    answer: 1,
    explanation: "Each recursive call pushes a new execution stack frame containing parameters and local variables onto the call stack."
  },
  {
    question: "Which of the following is a divide-and-conquer algorithm?",
    options: ["Bubble Sort", "Linear Search", "Binary Search", "Selection Sort"],
    answer: 2,
    explanation: "Binary Search is a classic divide-and-conquer algorithm that cuts the search space in half at each step."
  },
  {
    question: "What is the primary advantage of arrays?",
    options: ["Dynamic memory growth", "Constant-time indexed access", "Automatic sorting", "Recursive traversal"],
    answer: 1,
    explanation: "Arrays store elements contiguously in memory, enabling direct index calculations in O(1) time."
  },
  {
    question: "Which of the following best describes recursion?",
    options: ["Iterating through arrays", "A function calling itself", "Sorting elements repeatedly", "Storing data dynamically"],
    answer: 1,
    explanation: "Recursion is a programming technique where a function calls itself directly or indirectly to solve a problem."
  },
  {
    question: "What is stored inside a stack frame?",
    options: ["Only return values", "Variables and return address", "Only heap pointers", "Graph edges"],
    answer: 1,
    explanation: "Stack frames store parameters, local variables, and the return address to resume execution after call completion."
  },
  {
    question: "Which real-world system commonly uses recursive traversal?",
    options: ["Audio Speakers", "File Systems", "Web Browsers", "Databases only"],
    answer: 1,
    explanation: "Directories in file systems contain nested sub-directories, naturally requiring recursive traversal functions."
  },
  {
    question: "What is the space complexity of recursion with depth D?",
    options: ["O(1)", "O(log D)", "O(D)", "O(N²)"],
    answer: 2,
    explanation: "Each recursive call requires a stack frame; if the recursion depth is D, the call stack memory scales as O(D)."
  }
];

export function FoundationsPage() {
  const navigate = useNavigate();
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_foundations');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load foundations progress:', e);
    }
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
  });

  const toggleSection = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: !prev[sectionNum] };
      localStorage.setItem('dsa_progress_foundations', JSON.stringify(updated));
      return updated;
    });
  };

  const setSectionCompleted = (sectionNum: number, isCompleted: boolean) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: isCompleted };
      localStorage.setItem('dsa_progress_foundations', JSON.stringify(updated));
      return updated;
    });
  };

  const SECTION_WEIGHTS: Record<number, number> = { 1: 5, 2: 15, 3: 10, 4: 15, 5: 10, 6: 15, 7: 5, 8: 25 };
  const progressPercent = Object.entries(completedSections)
    .filter(([, done]) => done)
    .reduce((sum, [key]) => sum + (SECTION_WEIGHTS[Number(key)] || 0), 0);

  // Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>(() => {
    return [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
  });

  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<any>(null);

  // Handle auto-playing of visualizer steps
  const handlePlayToggle = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= VISUALIZATION_STEPS.length - 1) {
            clearInterval(interval);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
      setPlayInterval(interval);
    }
  };

  const handleReset = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    }
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < VISUALIZATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeStepData = VISUALIZATION_STEPS[currentStep];

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader
        centerContent={
          <div className="flex flex-col gap-2 w-full select-none">
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-text-muted">PROGRESS</span>
              <span className="text-accent-secondary font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-accent-secondary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,255,204,0.3)]" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dsa')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              Foundations of <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Complexity, Memory, Variables & Loops
            </p>
          </div>
        </div>
      </PageHeader>

      {/* 1. INTRODUCTION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[1] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>1. Introduction</h2>
          </div>
          <button 
            onClick={() => toggleSection(1)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[1] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[1] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[1] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neon-card flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem]">WHAT IT IS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Foundations represent the basic plumbing of computer science: variables (how data is labeled), loop iteration (repeating operations), and function recursion (functions calling themselves to solve sub-problems).
            </p>
          </div>
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.3rem]">WHY IT EXISTS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              To write correct and performant code, developers must understand how variables occupy memory, how execution context flows line-by-line, and how algorithm complexity scales when loops or recursive stack frames are processed by CPU threads.
            </p>
          </div>
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem]">REAL-WORLD ANALOGY</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Think of variables as named drawer files, loops as assembly-line workers stamping widgets sequentially, and recursion as a set of nested Russian Matryoshka dolls—each doll looks identical but is smaller, and you must open all of them to find the prize.
            </p>
          </div>
        </div>
      </section>

      {/* 2. VISUALIZATION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>2. Interactive Visualization</h2>
          </div>
          <button 
            onClick={() => toggleSection(2)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[2] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[2] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[2] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="border-b border-border-default pb-4">
            <h3 className="text-lg font-bold text-text-primary mb-1">Visualizing a Recursion Call Stack</h3>
            <p className="text-sm text-text-muted">Trace the push and pop operations of execution frames when computing <code className="text-accent-secondary">factorial(3)</code>.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Box: Code trace and controls */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-text-secondary uppercase">Execution Step {currentStep + 1} of {VISUALIZATION_STEPS.length}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReset} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-secondary transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={16} className="opacity-70" />
                  </button>
                  <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Prev"
                  >
                    <SkipForward size={16} className="rotate-180 opacity-70" />
                  </button>
                  <button 
                    onClick={handlePlayToggle} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-secondary transition-colors"
                    title={isPlaying ? "Pause" : "Play Auto-run"}
                  >
                    {isPlaying ? <Pause size={16} className="opacity-70" /> : <Play size={16} className="opacity-70" />}
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={currentStep === VISUALIZATION_STEPS.length - 1}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next"
                  >
                    <SkipForward size={16} className="opacity-70" />
                  </button>
                </div>
              </div>

              {/* Staged Code Frame */}
              <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden relative" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <div className="text-[10px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 select-none border-b border-border-default/45 pb-1">pseudocode</div>
                
                <div className="relative space-y-1">
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">1</span>
                    <span>FUNCTION factorial(n):</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">2</span>
                    <span>    IF n &lt;= 1 THEN</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">3</span>
                    <span>        RETURN 1</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">4</span>
                    <span>    ELSE</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">5</span>
                    <span>        RETURN n * factorial(n - 1)</span>
                  </div>
                </div>
              </div>

              {/* Action Description */}
              <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
              </div>
            </div>

            {/* Right Box: Dynamic Runtime Call Stack Visualizer */}
            <div className="flex flex-col justify-end min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                <Database size={14} className="opacity-70" />
                <span>Runtime Call Stack (LIFO)</span>
              </div>
              
              <div className="flex flex-col-reverse gap-3 w-full z-10">
                <AnimatePresence mode="popLayout">
                  {activeStepData.stack.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-text-muted italic font-mono text-sm"
                    >
                      [Call Stack Empty / Idle]
                    </motion.div>
                  ) : (
                    activeStepData.stack.map((frame) => {
                      let statusColors = 'border-accent-secondary/30 bg-accent-secondary/5 text-accent-secondary';
                      if (frame.status === 'suspended') statusColors = 'border-border-default bg-bg-secondary text-text-secondary opacity-60';
                      if (frame.status === 'returning') statusColors = 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_15px_rgba(255,45,120,0.15)]';
                      if (frame.status === 'resolving') statusColors = 'border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary';

                       return (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, y: -40, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, y: 30 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className={`border rounded-xl flex flex-col gap-1.5 ${statusColors} font-mono relative backdrop-blur-md`}
                          style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">{frame.name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-transparent">{frame.status}</span>
                          </div>
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Parameters: {frame.param}</span>
                            {frame.returnValue && (
                              <span className="text-accent-secondary font-bold font-sans">
                                Return Value: {frame.returnValue}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Grid scanning effect bg */}
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONS TABLE SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Table className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[3] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>3. Basic Operations & Complexities</h2>
          </div>
          <button 
            onClick={() => toggleSection(3)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[3] 
                ? 'bg-accent-tertiary border-accent-tertiary text-bg-primary shadow-[0_0_15px_rgba(255,224,74,0.35)] hover:shadow-[0_0_20px_rgba(255,224,74,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-tertiary/35 text-accent-tertiary/50 shadow-[0_0_8px_rgba(255,224,74,0.1)] hover:border-accent-tertiary hover:text-accent-tertiary hover:shadow-[0_0_15px_rgba(255,224,74,0.3)]'
            }`}
            title={completedSections[3] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[3] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="neon-card neon-card-yellow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-secondary border-b border-white/20 font-mono text-sm uppercase tracking-wider text-text-primary divide-x divide-white/20">
                  <th className="w-[30%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Operation</th>
                  <th className="text-accent-secondary w-[20%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Time Complexity</th>
                  <th className="text-accent-primary w-[20%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Space Complexity</th>
                  <th className="w-[30%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 font-sans text-base">
                {OPERATIONS.map((op, idx) => (
                  <tr key={idx} className="hover:bg-bg-secondary/40 transition-colors divide-x divide-white/20">
                    <td className="font-semibold text-text-primary whitespace-pre-line" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{op.operation}</td>
                    <td className="font-mono text-accent-secondary font-semibold" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{op.timeComplexity}</td>
                    <td className="font-mono text-accent-primary font-semibold" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{op.spaceComplexity}</td>
                    <td className="text-text-secondary leading-relaxed" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{op.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. INTERNAL WORKING SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[4] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>4. Internal Working</h2>
          </div>
          <button 
            onClick={() => toggleSection(4)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[4] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[4] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[4] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="neon-card flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem] flex items-center gap-2">
              <span>STACK VS HEAP MEMORY LAYOUT</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                When a program executes, the OS allocates virtual memory split into distinct segments:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-text-primary font-mono">Stack Memory:</strong> Stores function execution frames, primitive variable values, and references to objects. Memory allocation is automatic, static, fast (LIFO execution), and size is fixed.
                </li>
                <li>
                  <strong className="text-text-primary font-mono">Heap Memory:</strong> Stores dynamically allocated objects (like dynamic arrays, tree nodes, objects). Memory allocation is dynamic, slow, managed via pointers, and reclaimed by Garbage Collectors or explicit deletion.
                </li>
              </ul>
            </div>
          </div>
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.3rem] flex items-center gap-2">
              <span>RECURSION FLOW & THE RUNTIME STACK</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Every function invocation creates a <strong className="text-text-primary font-semibold">Stack Frame</strong> containing:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Parameters and arguments passed.</li>
                <li>Local variables instantiated inside.</li>
                <li>The Return Address (where execution resumes once complete).</li>
              </ul>
              <p>
                Without a base case, recursive loops cause <strong className="text-text-primary font-semibold">Stack Overflow</strong>, where the allocated stack memory segment runs out of frames, triggering process crashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPLEMENTATION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[5] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>5. Code Implementation</h2>
          </div>
          <button 
            onClick={() => toggleSection(5)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[5] 
                ? 'bg-accent-tertiary border-accent-tertiary text-bg-primary shadow-[0_0_15px_rgba(255,224,74,0.35)] hover:shadow-[0_0_20px_rgba(255,224,74,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-tertiary/35 text-accent-tertiary/50 shadow-[0_0_8px_rgba(255,224,74,0.1)] hover:border-accent-tertiary hover:text-accent-tertiary hover:shadow-[0_0_15px_rgba(255,224,74,0.3)]'
            }`}
            title={completedSections[5] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[5] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Language Selection Tabs */}
          <div className="flex border-b border-border-default/50 gap-6 overflow-x-auto">
            {(['python', 'javascript', 'cpp', 'java'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap ${activeTab === lang ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Active Code Segment */}
          <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-x-auto relative max-h-[450px]" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <pre className="text-text-primary">{CODE_IMPLEMENTATIONS[activeTab]}</pre>
          </div>
        </div>
      </section>

      {/* 6. COMMON PROBLEMS SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[6] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>6. Common Foundations Problems</h2>
          </div>
          <button 
            onClick={() => toggleSection(6)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[6] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[6] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[6] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Fibonacci Sequence', type: 'Recursion', desc: 'Solve via basic recursive formula and discuss optimization through Memoization.' },
            { title: 'Climbing Stairs', type: 'Loops & State', desc: 'Model stepping combinations to reach the Nth stair using iterative states.' },
            { title: 'Towers of Hanoi', type: 'Recursion Depth', desc: 'Move disks between pegs using mathematical inductive partitioning.' },
            { title: 'Binary Search', type: 'Div & Conquer', desc: 'Divide execution space in half dynamically, reducing complexity to log(N).' }
          ].map((prob, idx) => (
            <div key={idx} className="neon-card neon-card-pink flex flex-col justify-between h-full group hover:border-accent-primary/50" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary border border-border-default/50 uppercase">{prob.type}</span>
                <h4 className="text-lg font-bold text-text-primary mt-3 group-hover:text-accent-primary transition-colors">{prob.title}</h4>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{prob.desc}</p>
              </div>
              <button 
                onClick={() => navigate('/playground', { 
                  state: { 
                    code: PROBLEM_SAMPLE_CODES[prob.title as keyof typeof PROBLEM_SAMPLE_CODES], 
                    language: 'python', 
                    execute: true 
                  } 
                })}
                className="mt-6 text-xs font-mono font-bold text-accent-primary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start"
              >
                Explore in Playground &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REAL-WORLD USAGE SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[7] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>7. Real-World Applications</h2>
          </div>
          <button 
            onClick={() => toggleSection(7)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[7] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[7] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[7] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neon-card flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem]">FILE SYSTEM TRAVERSAL</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Operating system folder search trees are recursive structures. Traversal APIs call themselves recursively for child folders inside parents until finding matching file patterns.
            </p>
          </div>
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.3rem]">BROWSER CALL STACKS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Web browser JS engines maintain call stacks. Function executions push context blocks. When exceptions happen, the Stack Trace prints active frames, letting you trace errors.
            </p>
          </div>
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem]">UNDO / REDO LOGIC</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Editors stack snapshots of state. The undo operations pop states from the undo-stack and push them onto the redo-stack, allowing structured reversal of user inputs.
            </p>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE QUIZ SECTION */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full mb-0">
          <div className="flex items-center gap-3">
            <Award className="text-accent-primary opacity-70" size={32} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[8] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>8. Foundations Quiz</h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {!quizFinished ? (
            <div className="flex flex-col gap-6">
              {/* Quiz Header */}
              <div className="flex justify-between items-center border-b border-border-default/50 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Test Your Knowledge</h3>
                  <p className="text-sm text-text-muted">Answer the questions to unlock foundations mastery.</p>
                </div>
                <span className="text-lg font-mono font-bold text-accent-primary uppercase tracking-wider bg-transparent border-0 p-0">
                  QUESTION {currentQuizQuestion + 1} OF {activeQuestions.length}
                </span>
              </div>

              {/* Question & Options Group */}
              <div className="flex flex-col gap-2">
                {/* Question Text */}
                <h4 className="text-lg font-semibold text-text-primary leading-relaxed">
                  {activeQuestions[currentQuizQuestion].question}
                </h4>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQuestions[currentQuizQuestion].options.map((option, idx) => {
                    let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                    if (selectedOption === idx) {
                      if (isAnswered) {
                        optionStyle = idx === activeQuestions[currentQuizQuestion].answer
                          ? "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                          : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                      } else {
                        optionStyle = "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                      }
                    } else if (isAnswered && idx === activeQuestions[currentQuizQuestion].answer) {
                      optionStyle = "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(idx)}
                        className={`text-left py-2.5 px-4 rounded-xl transition-all duration-200 leading-relaxed cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono font-bold shrink-0 border-current">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback and Next Controls */}
              {isAnswered ? (
                <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase tracking-wider ${selectedOption === activeQuestions[currentQuizQuestion].answer ? 'text-success' : 'text-error'}`}>
                      {selectedOption === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeQuestions[currentQuizQuestion].explanation}
                  </p>
                  <button
                    onClick={() => {
                      if (currentQuizQuestion < activeQuestions.length - 1) {
                        setCurrentQuizQuestion(prev => prev + 1);
                        setSelectedOption(null);
                        setIsAnswered(false);
                      } else {
                        setQuizFinished(true);
                        setSectionCompleted(8, true);
                      }
                    }}
                    className="self-end px-14 py-4 bg-accent-primary text-bg-primary font-mono font-bold text-base tracking-wider uppercase rounded-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,45,120,0.25)] hover:shadow-[0_0_20px_rgba(255,45,120,0.45)] cursor-pointer"
                  >
                    {currentQuizQuestion < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              ) : (
                <button
                  disabled={selectedOption === null}
                  onClick={() => {
                    setIsAnswered(true);
                    if (selectedOption === activeQuestions[currentQuizQuestion].answer) {
                      setScore(prev => prev + 1);
                    }
                  }}
                  className="self-end px-28 py-7 bg-bg-secondary border border-accent-primary text-accent-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:scale-105 hover:shadow-[0_0_15px_rgba(255,45,120,0.2)] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer mt-6"
                >
                  Submit Answer
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-6">
              <Award className="text-accent-primary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-primary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setActiveQuestions([...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5));
                    setCurrentQuizQuestion(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setScore(0);
                    setQuizFinished(false);
                  }}
                  className="px-14 py-4 bg-bg-secondary border border-border-default text-text-primary font-mono font-bold text-base tracking-wider uppercase rounded-lg hover:border-accent-primary/50 hover:text-accent-primary transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
