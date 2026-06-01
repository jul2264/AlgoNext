import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award 
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

// Static Data for Foundations Page


// Simulation Steps for Recursion Call Stack Visualizer: factorial(3)
const VISUALIZATION_STEPS = [
  {
    step: 0,
    line: 1,
    description: 'Initial function call is made to factorial(3). Pushing first execution frame.',
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
    description: 'factorial(1) resolves and returns 1. Popping execution frame.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'resolving', returnValue: '2 * factorial(1) = 2 * 1' }
    ]
  },
  {
    step: 7,
    line: 5,
    description: 'factorial(2) completes calculation: 2 * 1 = 2. Preparing to return 2. Popping execution frame.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'resolving', returnValue: '3 * factorial(2) = 3 * 2' }
    ]
  },
  {
    step: 8,
    line: 5,
    description: 'factorial(3) completes calculation: 3 * 2 = 6. All call frames resolved. Final answer: 6.',
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
    return { 1: false, 2: false };
  });

  const setSectionCompleted = (sectionNum: number, isCompleted: boolean) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: isCompleted };
      localStorage.setItem('dsa_progress_foundations', JSON.stringify(updated));
      return updated;
    });
  };

  // Quiz State
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>(() => {
    return [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
  });
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
      <PageHeader>
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

      {/* 1. VISUALIZATION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-primary opacity-70" size={24} />
            <h2 className="text-2xl font-bold font-display text-text-primary">1. Interactive Visualization</h2>
          </div>
        </div>
        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <div className="border-b border-border-default pb-4">
            <h3 className="text-lg font-bold text-text-primary mb-1">Visualizing a Recursion Call</h3>
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
                    <span className="whitespace-pre">FUNCTION factorial(n):</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">2</span>
                    <span className="whitespace-pre">    IF n &lt;= 1 THEN</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">3</span>
                    <span className="whitespace-pre">        RETURN 1</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">4</span>
                    <span className="whitespace-pre">    ELSE</span>
                  </div>
                  <div className={`flex gap-4 pl-10 pr-4 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-secondary/15 border-l-2 border-accent-secondary' : 'border-l-2 border-transparent'}`}>
                    <span className="text-text-muted select-none w-4 text-right">5</span>
                    <span className="whitespace-pre">        RETURN n * factorial(n - 1)</span>
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
                <span>Runtime Calls (LIFO)</span>
              </div>
              
              <div className="flex flex-col-reverse gap-3 w-full z-10">
                <AnimatePresence mode="popLayout">
                  {activeStepData.stack.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-text-muted italic font-mono text-sm"
                    >
                      [Calls Empty / Idle]
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

      {/* 2. INTERACTIVE QUIZ SECTION */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full mb-0">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>2. Foundations Quiz</h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {!quizFinished ? (
            <div className="flex flex-col gap-1">
              {/* Quiz Header */}
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-primary uppercase tracking-wider">
                  QUESTION {currentQuizQuestion + 1} OF {activeQuestions.length}
                </span>
              </div>

              {/* Question & Options Group */}
              <div className="flex flex-col gap-3">
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
                  
                  {/* Action Button */}
                  <div className="pt-6 mt-4 border-t border-border-default/20">
                    <button
                      onClick={() => {
                        if (currentQuizQuestion < activeQuestions.length - 1) {
                          setCurrentQuizQuestion(prev => prev + 1);
                          setSelectedOption(null);
                          setIsAnswered(false);
                        } else {
                          setQuizFinished(true);
                          setSectionCompleted(2, true);
                        }
                      }}
                      className="w-full py-4 bg-accent-primary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,45,120,0.25)] hover:shadow-[0_0_20px_rgba(255,45,120,0.45)] cursor-pointer"
                    >
                      {currentQuizQuestion < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    disabled={selectedOption === null}
                    onClick={() => {
                      setIsAnswered(true);
                      if (selectedOption === activeQuestions[currentQuizQuestion].answer) {
                        setScore(prev => prev + 1);
                      }
                    }}
                    className={`w-full py-4 bg-transparent border font-mono font-bold text-base tracking-wider uppercase rounded-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer ${
                      selectedOption === null 
                        ? 'border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary/10 hover:shadow-[0_0_15px_rgba(255,224,74,0.2)] disabled:opacity-40' 
                        : 'border-success text-success hover:bg-success/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] shadow-[0_0_10px_rgba(0,255,204,0.15)]'
                    }`}
                  >
                    Submit Answer
                  </button>
                </div>
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
