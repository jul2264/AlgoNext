import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  // Representing the visual queue elements in buffer
  nodes: (number | string)[];
  activeIndex?: number;
  pointers?: { label: string; index: number }[];
  highlightIndices?: number[];
  line: number;
}

// Visualizer steps configuration for Queues
const VISUALIZATION_STEPS: Record<'enqueue' | 'dequeue' | 'peek', VisStep[]> = {
  enqueue: [
    {
      step: 0,
      description: 'Initial state of the queue. FRONT points to index 0 (value 10), REAR points to index 2 (value 30). We want to enqueue a new element 40.',
      nodes: [10, 20, 30],
      activeIndex: -1,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 2 }],
      line: 0
    },
    {
      step: 1,
      description: 'Increment the REAR pointer to allocate the next free memory cell (index 3).',
      nodes: [10, 20, 30, '?'],
      activeIndex: 3,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 3 }],
      line: 1
    },
    {
      step: 2,
      description: 'Insert the new element 40 at the REAR pointer index. The enqueue operation is complete.',
      nodes: [10, 20, 30, 40],
      activeIndex: 3,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 3 }],
      line: 2
    }
  ],
  dequeue: [
    {
      step: 0,
      description: 'Initial state of the queue. FRONT points to index 0 (value 10), REAR points to index 3 (value 40).',
      nodes: [10, 20, 30, 40],
      activeIndex: -1,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 3 }],
      line: 0
    },
    {
      step: 1,
      description: 'Retrieve and save the value at the FRONT pointer (10) to return it.',
      nodes: [10, 20, 30, 40],
      activeIndex: 0,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 3 }],
      line: 1
    },
    {
      step: 2,
      description: 'Increment the FRONT pointer to index 1. Index 0 is no longer accessible. Element 10 is dequeued.',
      nodes: [20, 30, 40],
      activeIndex: -1,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 2 }],
      line: 2
    }
  ],
  peek: [
    {
      step: 0,
      description: 'Initial state of the queue. FRONT points to the element at index 0 (value 10).',
      nodes: [10, 20, 30],
      activeIndex: -1,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 2 }],
      line: 0
    },
    {
      step: 1,
      description: 'Read and return the value at the FRONT pointer (10) without modifying the queue.',
      nodes: [10, 20, 30],
      activeIndex: 0,
      pointers: [{ label: 'FRONT', index: 0 }, { label: 'REAR', index: 2 }],
      line: 1
    }
  ]
};

// Quiz questions setup (20 MCQs)
const QUIZ_QUESTIONS = [
  {
    question: "Which principle does a Queue follow?",
    options: ["LIFO", "FIFO", "DFS", "Random Access"],
    answer: 1,
    explanation: "A Queue follows the First In, First Out (FIFO) principle, where the first element inserted is the first one to be removed."
  },
  {
    question: "What does the ENQUEUE operation do?",
    options: ["Removes an element from the front", "Searches for an element", "Adds an element at the REAR", "Reverses the queue order"],
    answer: 2,
    explanation: "Enqueue adds a new element to the back (REAR) of the queue."
  },
  {
    question: "Which operation removes the front element from a queue?",
    options: ["Push", "Pop", "Dequeue", "Peek"],
    answer: 2,
    explanation: "Dequeue removes the element located at the FRONT of the queue."
  },
  {
    question: "Which operation allows viewing the front element without removing it?",
    options: ["Push", "Front/Peek", "Pop", "Delete"],
    answer: 1,
    explanation: "Front or Peek returns the value of the front-most element without modifying the queue state."
  },
  {
    question: "What is the time complexity of the Enqueue operation?",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Enqueue operates directly at the REAR pointer in constant O(1) time."
  },
  {
    question: "What is the time complexity of the Dequeue operation?",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Dequeue operates directly at the FRONT pointer, running in constant O(1) time."
  },
  {
    question: "At which end of the queue are new elements inserted?",
    options: ["FRONT", "TOP", "REAR", "NULL"],
    answer: 2,
    explanation: "New elements are always enqueued at the REAR (back) of the queue."
  },
  {
    question: "From which end of the queue are elements removed?",
    options: ["REAR", "FRONT", "TOP", "CENTER"],
    answer: 1,
    explanation: "Elements are dequeued from the FRONT of the queue, adhering to FIFO processing."
  },
  {
    question: "Which data structure is typically used to implement Breadth-First Search (BFS)?",
    options: ["Stack", "Queue", "Trie", "Heap"],
    answer: 1,
    explanation: "BFS processes nodes level-by-level, which naturally maps to the First-In, First-Out execution of a Queue."
  },
  {
    question: "What event occurs when Dequeue is attempted on an empty queue?",
    options: ["Queue Overflow", "Queue Underflow", "Pointer Collision", "Stack Recursion Limit"],
    answer: 1,
    explanation: "Attempting to remove elements from an empty queue triggers a Queue Underflow error."
  },
  {
    question: "Which type of queue prevents wasted space by wrapping pointers back to the beginning?",
    options: ["Linear Queue", "Priority Queue", "Circular Queue", "Heap Queue"],
    answer: 2,
    explanation: "A Circular Queue connects the last position back to the first, reusing vacated memory slots dynamically."
  },
  {
    question: "Which data structure processes elements based on importance rather than arrival order?",
    options: ["Circular Queue", "Stack", "Priority Queue", "Linked List"],
    answer: 2,
    explanation: "A Priority Queue assigns values a priority rank, processing higher priority elements first."
  },
  {
    question: "Which application is a classic use case for a queue?",
    options: ["Depth-First Search", "Browser Back History", "Printer Job Scheduling", "Binary Search"],
    answer: 2,
    explanation: "Printer queues process jobs sequentially in the exact order they arrive, making it a standard FIFO queue."
  },
  {
    question: "What is the time complexity of searching for an arbitrary element inside a queue?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "Since queues do not support direct index access, searching requires traversing all N elements in O(N) linear time."
  },
  {
    question: "Which operation is used to check if the queue contains any elements?",
    options: ["push()", "top()", "isEmpty()", "peek()"],
    answer: 2,
    explanation: "isEmpty() checks whether FRONT and REAR indicate that the queue has no active elements."
  },
  {
    question: "Which queue implementation maintains FRONT and REAR pointers dynamically without pre-allocated memory size limitations?",
    options: ["Linked List Queue", "Heap Queue", "Trie Queue", "Matrix Queue"],
    answer: 0,
    explanation: "A Linked List Queue allocates memory dynamically for each node and updates FRONT and REAR references dynamically."
  },
  {
    question: "Which traversal algorithm relies heavily on queues for tracking state?",
    options: ["BFS", "Binary Search", "Merge Sort", "DFS Recursion"],
    answer: 0,
    explanation: "Breadth-First Search (BFS) uses a queue to visit neighbor vertices sequentially level by level."
  },
  {
    question: "Why are queue operations (Enqueue/Dequeue) highly efficient?",
    options: ["Direct indexing offsets", "Operations occur strictly at FRONT and REAR boundaries", "Random memory block allocations", "Recursive stack optimizations"],
    answer: 1,
    explanation: "By restricting insertion/deletion to FRONT and REAR endpoints, no elements ever need to be shifted, yielding O(1) performance."
  },
  {
    question: "Which structure connects the rear back to the front to recycle memory cells?",
    options: ["Priority Queue", "Circular Queue", "Stack Queue", "Linked Queue"],
    answer: 1,
    explanation: "The Circular Queue uses modular arithmetic so that the index wraps back to zero when it reaches the buffer limit."
  },
  {
    question: "Which operating system process manager uses queue systems internally?",
    options: ["CPU Scheduling", "AVL Rotations", "Binary Trees only", "Hash Collisions only"],
    answer: 0,
    explanation: "OS CPU task managers queue ready processes in FIFO order using scheduling queues."
  }
];

export function QueuesPage() {
  const navigate = useNavigate();

  // Completed sections progress tracker
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_queues');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { 1: false, 2: false };
  });

  const toggleSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('dsa_progress_queues', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Update global progress trigger if applicable
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);


  // Visualizer state
  const [activeVisTab, setActiveVisTab] = useState<'enqueue' | 'dequeue' | 'peek'>('enqueue');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep] || activeSteps[0];

  // Playback logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setVisStep(prev => {
          if (prev >= activeSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSteps.length]);

  const handleTabChange = (tab: 'enqueue' | 'dequeue' | 'peek') => {
    setActiveVisTab(tab);
    setVisStep(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setVisStep(0);
    setIsPlaying(false);
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

  // Quiz state
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Initialize quiz with 5 random MCQs
  useEffect(() => {
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
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuizQuestion < activeQuestions.length - 1) {
      setCurrentQuizQuestion(prev => prev + 1);
    } else {
      setQuizFinished(true);
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
              <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">Queues</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              First In, First Out (FIFO) sequential scheduling buffer
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-secondary opacity-70" size={24} />
            <h2 className="text-2xl font-bold font-display text-text-primary">
              1. Interactive Visualization
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-cyan flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Operations switch tabs */}
          <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
            <button
              onClick={() => handleTabChange('enqueue')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'enqueue' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Enqueue (Insert 40)
            </button>
            <button
              onClick={() => handleTabChange('dequeue')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'dequeue' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Dequeue (Remove Front)
            </button>
            <button
              onClick={() => handleTabChange('peek')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'peek' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Peek (Front)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel Column */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-text-secondary uppercase">
                    Step {visStep + 1} of {activeSteps.length}
                  </span>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleReset}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button 
                      onClick={handlePrev}
                      disabled={visStep === 0}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <SkipForward size={16} className="rotate-180" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Auto Play"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={visStep === activeSteps.length - 1}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Step warning description */}
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode panel */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>

                  {activeVisTab === 'enqueue' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isFull() &rarr; Overflow Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>REAR = REAR + 1</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>QUEUE[REAR] = 40</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'dequeue' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isEmpty() &rarr; Underflow Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>temp = QUEUE[FRONT] // 10</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>FRONT = FRONT + 1; return temp</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'peek' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isEmpty() &rarr; Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>return QUEUE[FRONT] // 10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer Area Column */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>QUEUE MEMORY BUFFER</span>
              </div>

              {/* Horizontal slots rendering */}
              <div className="flex flex-col items-center gap-8 w-full max-w-sm mt-4">
                <div className="flex items-center gap-3 bg-bg-primary/30 p-4 border border-border-default/20 rounded-xl w-full justify-center min-h-[100px]">
                  {activeStepData.nodes.map((nodeVal, idx) => {
                    const isActive = activeStepData.activeIndex === idx;
                    const pointers = activeStepData.pointers?.filter(p => p.index === idx) || [];

                    let blockStyle = 'border-border-default bg-bg-secondary text-text-secondary';
                    if (nodeVal === '?') {
                      blockStyle = 'border-accent-secondary border-dashed bg-accent-secondary/5 text-accent-secondary animate-pulse';
                    } else if (isActive) {
                      blockStyle = 'border-accent-primary bg-accent-primary/15 text-accent-primary shadow-[0_0_15px_rgba(255,45,120,0.2)]';
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 relative">
                        {/* Element slot */}
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-base transition-all duration-300 relative ${blockStyle}`}>
                          {nodeVal}

                          {/* Pointers Stacked */}
                          {pointers.length > 0 && (
                            <div className="absolute bottom-[52px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 select-none">
                              {pointers.map((p, pIdx) => (
                                <div 
                                  key={pIdx} 
                                  className={`flex flex-col items-center gap-0.5 font-mono font-bold text-xs ${
                                    p.label === 'FRONT' 
                                      ? 'text-accent-primary' 
                                      : 'text-accent-secondary'
                                  }`}
                                >
                                  <span>{p.label}</span>
                                  <span className="font-extrabold leading-none">&darr;</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Index */}
                        <span className="text-[10px] text-text-muted font-mono">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-8 items-center text-xs font-mono text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                    <span>FRONT Pointer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-secondary"></div>
                    <span>REAR Pointer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Queue Quiz
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
                      className="w-full py-4 bg-accent-secondary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,204,0.25)] hover:shadow-[0_0_25px_rgba(0,255,204,0.45)] cursor-pointer"
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
