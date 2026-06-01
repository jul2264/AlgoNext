import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  // Representing the visual stack nodes
  nodes: { val: number | string; label?: string }[];
  activeIndex?: number;
  pointers?: { label: string; index: number }[];
  highlightIndices?: number[];
  line: number;
}

// Visualizer steps configuration for Stacks
const VISUALIZATION_STEPS: Record<'push' | 'pop' | 'peek', VisStep[]> = {
  push: [
    {
      step: 0,
      description: 'Initial state of the stack. TOP points to Node 30 (index 2). We want to push a new element 40.',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }],
      activeIndex: -1,
      pointers: [{ label: 'TOP', index: 2 }],
      line: 0
    },
    {
      step: 1,
      description: 'Increment the TOP pointer (or allocate a new stack memory index).',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }, { val: '?' }],
      activeIndex: 3,
      pointers: [{ label: 'TOP', index: 3 }],
      line: 1
    },
    {
      step: 2,
      description: 'Place the new value (40) at the TOP index. The push operation is complete.',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }, { val: 40 }],
      activeIndex: 3,
      pointers: [{ label: 'TOP', index: 3 }],
      line: 2
    }
  ],
  pop: [
    {
      step: 0,
      description: 'Initial state of the stack. TOP points to Node 40 (index 3).',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }, { val: 40 }],
      activeIndex: -1,
      pointers: [{ label: 'TOP', index: 3 }],
      line: 0
    },
    {
      step: 1,
      description: 'Retrieve and save the top-most element (40) in a temporary variable.',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }, { val: 40 }],
      activeIndex: 3,
      pointers: [{ label: 'TOP', index: 3 }],
      line: 1
    },
    {
      step: 2,
      description: 'Decrement the TOP pointer, removing access to the node. Node 40 is popped.',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }],
      activeIndex: -1,
      pointers: [{ label: 'TOP', index: 2 }],
      line: 2
    }
  ],
  peek: [
    {
      step: 0,
      description: 'Initial state of the stack. TOP points to Node 30 (index 2).',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }],
      activeIndex: -1,
      pointers: [{ label: 'TOP', index: 2 }],
      line: 0
    },
    {
      step: 1,
      description: 'Access and return the value of the node currently pointed to by TOP (30) without modifying the stack.',
      nodes: [{ val: 10 }, { val: 20 }, { val: 30 }],
      activeIndex: 2,
      pointers: [{ label: 'TOP', index: 2 }],
      line: 1
    }
  ]
};

// Quiz questions setup (20 MCQs)
const QUIZ_QUESTIONS = [
  {
    question: "Which principle does a Stack follow?",
    options: ["FIFO", "LIFO", "Random Access", "Tree Traversal"],
    answer: 1,
    explanation: "A Stack follows the Last In, First Out (LIFO) principle, where the most recently added element is the first one to be removed."
  },
  {
    question: "What does the PUSH operation do?",
    options: ["Removes an element", "Searches for an element", "Adds an element to the TOP", "Sorts the stack"],
    answer: 2,
    explanation: "The push operation inserts a new element at the TOP of the stack."
  },
  {
    question: "Which operation removes the top element?",
    options: ["Peek", "Push", "Pop", "Search"],
    answer: 2,
    explanation: "The pop operation retrieves and removes the element at the TOP of the stack."
  },
  {
    question: "Which operation views the top element without removing it?",
    options: ["Pop", "Peek", "Push", "Delete"],
    answer: 1,
    explanation: "The peek (or top) operation returns the value of the top element without modifying the stack structure."
  },
  {
    question: "What is the time complexity of the Push operation?",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Push takes constant O(1) time because elements are added directly at the TOP, requiring no traversal."
  },
  {
    question: "What is the time complexity of the Pop operation?",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Pop takes constant O(1) time because the top element is removed directly without any index shifting."
  },
  {
    question: "Which end of the Stack is accessible for insertion and deletion?",
    options: ["Bottom only", "Middle only", "TOP only", "Random nodes"],
    answer: 2,
    explanation: "All insertions and deletions in a stack occur at a single access point: the TOP."
  },
  {
    question: "Which data structure is primarily used by compilers to support function recursion?",
    options: ["Queue", "Heap", "Stack", "Trie"],
    answer: 2,
    explanation: "Operating systems and runtimes use an execution Stack (call stack) to store stack frames for active functions."
  },
  {
    question: "What commonly triggers a Stack Overflow error?",
    options: ["Heap fragmentation", "Excessive or infinite recursion", "Sequential array traversal", "Binary search division"],
    answer: 1,
    explanation: "Stack Overflow occurs when stack memory space becomes completely full, often due to unbounded recursive calls adding too many stack frames."
  },
  {
    question: "Which algorithmic problem is most commonly solved using a Stack?",
    options: ["BFS", "Binary Search", "Valid Parentheses", "Merge Sort"],
    answer: 2,
    explanation: "Valid Parentheses uses a stack to match brackets (pushing opening brackets, popping to match closing ones)."
  },
  {
    question: "Stacks are commonly implemented using:",
    options: ["Trees only", "Graphs only", "Arrays or Linked Lists", "Queues only"],
    answer: 2,
    explanation: "Stacks are linear structures that can be easily implemented using either contiguous arrays or node-based linked lists."
  },
  {
    question: "Which operation adds elements in LIFO order?",
    options: ["Push", "Pop", "Peek", "Traverse"],
    answer: 0,
    explanation: "The push operation inserts elements at the TOP of the stack, satisfying the LIFO protocol."
  },
  {
    question: "Which real-world application relies directly on stack behavior?",
    options: ["Browser Back Button", "Image Compression", "Binary Trees", "Database Joins"],
    answer: 0,
    explanation: "A browser's back button navigates history in reverse order (LIFO), which is implemented using a navigation stack."
  },
  {
    question: "Which traversal algorithm uses a stack (either call stack or explicit)?",
    options: ["BFS", "DFS", "Binary Search", "Dijkstra"],
    answer: 1,
    explanation: "Depth First Search (DFS) traverses paths deeply before backtracking, utilizing a stack structure to track visited nodes."
  },
  {
    question: "What is the time complexity of searching for a random value inside a Stack?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "Searching a stack requires sequentially popping and inspecting elements from top to bottom, resulting in O(N) time complexity."
  },
  {
    question: "What are the records stored inside a function call stack called?",
    options: ["Pixels", "Stack Frames", "Graph Edges", "Heap Nodes"],
    answer: 1,
    explanation: "Each active function call allocates a Stack Frame containing local variables, arguments, and the return address."
  },
  {
    question: "Which stack operation verifies whether the stack has no elements left?",
    options: ["push()", "top()", "isEmpty()", "enqueue()"],
    answer: 2,
    explanation: "isEmpty() checks whether the stack size is zero or the TOP pointer is null."
  },
  {
    question: "Which algorithmic optimization uses stacks to find range limits?",
    options: ["Histogram Area using Monotonic Stack", "DFS Traversal only", "Matrix Addition", "Heapify Sorting"],
    answer: 0,
    explanation: "Monotonic stacks (maintaining elements in sorted order) are used to efficiently compute boundary areas in Histograms."
  },
  {
    question: "Why are stack push and pop operations so efficient?",
    options: ["Random indexing support", "All operations occur strictly at the TOP", "Recursive array partitioning", "Dynamic hashing tables"],
    answer: 1,
    explanation: "Since elements are only ever added or removed at the TOP pointer, no element shifting or traversal is ever needed."
  },
  {
    question: "Which data structure naturally reverses the order of input elements?",
    options: ["Queue", "Heap", "Stack", "Trie"],
    answer: 2,
    explanation: "Due to the LIFO rule, elements pushed onto a stack are popped in the exact reverse order of their arrival."
  }
];

export function StacksPage() {
  const navigate = useNavigate();

  // Progress management (2 checkpoints)
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_stacks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load stacks progress:', e);
    }
    return { 1: false, 2: false };
  });

  const toggleSection = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: !prev[sectionNum] };
      localStorage.setItem('dsa_progress_stacks', JSON.stringify(updated));
      return updated;
    });
  };



  // Visualization state
  const [activeVisTab, setActiveVisTab] = useState<'push' | 'pop' | 'peek'>('push');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<any>(null);

  useEffect(() => {
    setVisStep(0);
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVisTab]);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep] || activeSteps[0];

  const handlePlayToggle = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setVisStep((prev) => {
          if (prev >= activeSteps.length - 1) {
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
    setVisStep(0);
  };

  const handlePrev = () => {
    if (visStep > 0) {
      setVisStep(visStep - 1);
    }
  };

  const handleNext = () => {
    if (visStep < activeSteps.length - 1) {
      setVisStep(visStep + 1);
    }
  };


  // Quiz State
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    // Generate 5 random questions
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    if (selectedOption === activeQuestions[currentQuizQuestion].answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuizQuestion < activeQuestions.length - 1) {
      setCurrentQuizQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Mark quiz section completed
      if (!completedSections[2]) {
        toggleSection(2);
      }
    }
  };

  const handleRetryQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
    setCurrentQuizQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dsa/linear-structures')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.3)]">Stacks</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Last In, First Out (LIFO) sequential execution buffer
            </p>
          </div>
        </div>
      </PageHeader>

      {/* 1. INTERACTIVE VISUALIZATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-primary opacity-70" size={24} />
            <h2 className="text-2xl font-bold font-display text-text-primary">
              1. Interactive Visualization
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Visualizer Mode Switchers */}
          <div className="flex border-b border-border-default/50 gap-4 overflow-x-auto">
            {([
              { id: 'push', label: 'Push (Insert 40)' },
              { id: 'pop', label: 'Pop (Remove Top)' },
              { id: 'peek', label: 'Peek (View Top)' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveVisTab(tab.id);
                  handleReset();
                }}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === tab.id 
                    ? 'border-accent-primary text-accent-primary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-text-secondary uppercase">
                  Step {visStep + 1} of {activeSteps.length}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReset} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw size={16} className="opacity-70" />
                  </button>
                  <button 
                    onClick={handlePrev} 
                    disabled={visStep === 0}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Prev"
                  >
                    <SkipForward size={16} className="rotate-180 opacity-70" />
                  </button>
                  <button 
                    onClick={handlePlayToggle} 
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={16} className="opacity-70" /> : <Play size={16} className="opacity-70" />}
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={visStep === activeSteps.length - 1}
                    className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next"
                  >
                    <SkipForward size={16} className="opacity-70" />
                  </button>
                </div>
              </div>

              {/* Action Description */}
              <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <AlertCircle className="text-accent-primary shrink-0 mt-0.5 opacity-70" size={18} />
                <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
              </div>

              {/* Pseudocode panel */}
              <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                  pseudocode
                </div>

                {activeVisTab === 'push' && (
                  <div className="space-y-1 text-sm font-mono select-none">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>stack.isFull() &rarr; Overflow Error</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>TOP = TOP + 1</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>STACK[TOP] = 40</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'pop' && (
                  <div className="space-y-1 text-sm font-mono select-none">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>stack.isEmpty() &rarr; Underflow Error</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>temp = STACK[TOP] // 40</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>TOP = TOP - 1; return temp</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'peek' && (
                  <div className="space-y-1 text-sm font-mono select-none">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>stack.isEmpty() &rarr; Error</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>return STACK[TOP] // 30</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>STACK MEMORY BUFFER</span>
              </div>

              {/* Vertical Stack rendering (drawn from top to bottom) */}
              <div className="flex-1 flex flex-col items-center justify-center w-full py-6">
                <div className="flex flex-col items-center gap-2 w-28">
                  {[...activeStepData.nodes].reverse().map((node, reversedIdx) => {
                    const originalIdx = activeStepData.nodes.length - 1 - reversedIdx;
                    const isActive = activeStepData.activeIndex === originalIdx;
                    const pointerLabel = activeStepData.pointers?.find(p => p.index === originalIdx)?.label;

                    let nodeStyle = 'border-border-default bg-bg-secondary text-text-secondary';
                    if (isActive) {
                      nodeStyle = 'border-accent-primary bg-accent-primary/15 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.2)]';
                    }

                    return (
                      <div key={originalIdx} className="w-full relative flex flex-col items-center">
                        {/* TOP Pointer arrow block */}
                        {pointerLabel && (
                          <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-accent-primary font-mono font-bold text-xs select-none">
                            <span>{pointerLabel}</span>
                            <span className="text-accent-primary font-extrabold">&rarr;</span>
                          </div>
                        )}

                        <motion.div
                          layout
                          className={`w-full py-3 border rounded-xl flex items-center justify-center font-mono font-bold text-sm sm:text-base shadow-md transition-all ${nodeStyle}`}
                        >
                          {node.val}
                        </motion.div>
                        <span className="absolute -right-14 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-mono select-none">[{originalIdx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUIZ SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Stack Quiz
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-cyan" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-secondary uppercase tracking-wider select-none">
                  QUESTION {currentQuizQuestion + 1} OF {activeQuestions.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-lg font-semibold text-text-primary leading-relaxed">
                  {activeQuestions[currentQuizQuestion].question}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeQuestions[currentQuizQuestion].options.map((option, idx) => {
                    let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                    if (selectedOption === idx) {
                      if (isAnswered) {
                        optionStyle = idx === activeQuestions[currentQuizQuestion].answer
                          ? "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                          : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                      } else {
                        optionStyle = "border border-accent-secondary bg-accent-secondary/10 text-accent-secondary shadow-[0_0_12px_rgba(0,255,204,0.15)]";
                      }
                    } else if (isAnswered && idx === activeQuestions[currentQuizQuestion].answer) {
                      optionStyle = "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleOptionSelect(idx)}
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

              {isAnswered ? (
                <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6 font-sans">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase tracking-wider ${selectedOption === activeQuestions[currentQuizQuestion].answer ? 'text-success' : 'text-error'}`}>
                      {selectedOption === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {activeQuestions[currentQuizQuestion].explanation}
                  </p>
                  
                  <div className="pt-6 mt-4 border-t border-border-default/20">
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-4 bg-accent-secondary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,204,0.25)] hover:shadow-[0_0_20px_rgba(0,255,204,0.45)] cursor-pointer"
                    >
                      {currentQuizQuestion < activeQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    disabled={selectedOption === null}
                    onClick={handleAnswerSubmit}
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
            <div className="flex flex-col items-center justify-center text-center py-8 gap-6 select-none">
              <Award className="text-accent-secondary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-secondary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetryQuiz}
                  className="px-14 py-4 bg-bg-secondary border border-border-default text-text-primary font-mono font-bold text-base tracking-wider uppercase rounded-lg hover:border-accent-secondary/50 hover:text-accent-secondary transition-all cursor-pointer"
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
