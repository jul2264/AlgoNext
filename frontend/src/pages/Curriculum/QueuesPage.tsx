import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, BookOpen, AlignJustify, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award, ArrowRight
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
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [progressPercent, setProgressPercent] = useState(0);

  // Toggle completed state of a section
  const toggleSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('dsa_progress_queues', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const SECTION_WEIGHTS: Record<number, number> = { 1: 10, 2: 15, 3: 10, 4: 15, 5: 15, 6: 10, 7: 10, 8: 15 };
    const score = Object.entries(completedSections)
      .filter(([, done]) => done)
      .reduce((sum, [k]) => sum + (SECTION_WEIGHTS[Number(k)] || 0), 0);
    setProgressPercent(score);
    // Update global progress trigger if applicable
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<'py' | 'js' | 'cpp' | 'java'>('py');

  // Visualizer state
  const [activeVisTab, setActiveVisTab] = useState<'enqueue' | 'dequeue' | 'peek'>('enqueue');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep] || activeSteps[0];

  // Playback logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
      if (!completedSections[8]) {
        toggleSection(8);
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
      {/* HEADER SECTION */}
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dsa/linear-structures')}
              className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
                Queues <span className="text-accent-secondary shadow-cyan">DSA</span>
              </h1>
              <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
                Linear Data Structures Curriculum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-bg-secondary border border-border-default rounded-2xl p-4 self-start md:self-auto min-w-[200px] shadow-lg">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">MODULE PROGRESS</span>
              <span className="text-accent-secondary font-mono text-2xl font-bold">{progressPercent}%</span>
            </div>
            <div className="w-16 h-1.5 bg-bg-primary rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-accent-secondary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* 1. INTRODUCTION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[1] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              1. Introduction
            </h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] uppercase">
              What is a Queue?
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                A <strong className="text-text-primary font-semibold">Queue</strong> is a linear data structure that follows the <span className="text-accent-secondary"><strong className="font-mono font-bold">First In, First Out (FIFO)</strong> principle.</span>
              </p>
              <p>
                This means that the first element inserted is always the first one to be removed.
              </p>
            </div>

            <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] mt-6 uppercase">
              Real-World Analogy
            </h3>
            <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
              <p>Think of:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>People waiting in line (first person in line is served first)</li>
                <li>Ticket counters and printer job execution buffers</li>
                <li>Printer queues and food delivery orders</li>
              </ul>
            </div>
          </div>

          <div className="neon-card neon-card-pink flex flex-col justify-between" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div>
              <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.3rem] uppercase">
                Queue Structure
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Elements enter at the REAR and leave from the FRONT boundary:
              </p>
            </div>

            {/* ASCII Queue Structure */}
            <div className="flex flex-col items-center justify-center py-6 bg-bg-primary/20 border border-border-default/20 rounded-xl max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between w-full px-6 mb-2 font-mono font-bold text-xs">
                <span className="text-accent-primary">FRONT</span>
                <span className="text-accent-secondary">REAR</span>
              </div>
              <div className="flex items-center gap-1.5 px-4 w-full justify-center">
                <div className="text-text-muted font-mono">&larr;</div>
                <div className="py-2.5 px-4 bg-accent-primary/10 border border-accent-primary text-accent-primary font-mono font-bold text-center rounded-lg shadow-sm">
                  [10]
                </div>
                <div className="py-2.5 px-4 bg-bg-secondary border border-border-default text-text-secondary font-mono font-bold text-center rounded-lg">
                  [20]
                </div>
                <div className="py-2.5 px-4 bg-accent-secondary/10 border border-accent-secondary text-accent-secondary font-mono font-bold text-center rounded-lg shadow-sm">
                  [30]
                </div>
                <div className="text-text-muted font-mono">&larr;</div>
              </div>
            </div>

            <div className="text-sm text-text-muted text-center mt-3 font-mono">
              Here, Node <span className="text-accent-primary font-bold">10</span> leaves first; Node <span className="text-accent-secondary font-bold">30</span> leaves last.
            </div>
          </div>
        </div>

        {/* Feature Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Key Characteristics */}
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase">
              Key Characteristics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-default/40 text-text-muted font-mono uppercase text-xs">
                    <th className="py-2">Feature</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary divide-y divide-border-default/10">
                  <tr>
                    <td className="py-2 font-semibold text-text-primary">FIFO</td>
                    <td className="py-2">First In, First Out processing logic.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-text-primary">Two Ends</td>
                    <td className="py-2">Operations occur at FRONT (delete) and REAR (insert) pointers.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-text-primary">Ordered</td>
                    <td className="py-2">Elements are handled sequentially in exact insertion order.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-text-primary">Efficient</td>
                    <td className="py-2">Enqueue and Dequeue run in constant O(1) time complexity.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Operations */}
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase">
              Core Operations
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-default/40 text-text-muted font-mono uppercase text-xs">
                    <th className="py-2">Operation</th>
                    <th className="py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary divide-y divide-border-default/10">
                  <tr>
                    <td className="py-2 font-semibold text-accent-secondary font-mono">Enqueue</td>
                    <td className="py-2">Inserts a new element at the REAR end.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-accent-primary font-mono">Dequeue</td>
                    <td className="py-2">Removes the element from the FRONT end.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-text-primary font-mono">Front / Peek</td>
                    <td className="py-2">Retrieves the front element value without deleting it.</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-semibold text-text-primary font-mono">isEmpty</td>
                    <td className="py-2">Verifies whether the queue contains any active nodes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Types of Queues Cards */}
        <div className="mt-4">
          <h3 className="text-xl font-bold text-text-primary font-display mb-4">Types of Queues</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neon-card neon-card-cyan flex flex-col justify-start p-4">
              <h4 className="text-sm font-bold font-mono text-accent-secondary uppercase mb-1">Linear Queue</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Standard queue where elements enter at REAR and leave from FRONT sequentially.
              </p>
            </div>
            <div className="neon-card neon-card-pink flex flex-col justify-start p-4">
              <h4 className="text-sm font-bold font-mono text-accent-primary uppercase mb-1">Circular Queue</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Pointers wrap back to the beginning of the memory buffer to recycle space.
              </p>
            </div>
            <div className="neon-card neon-card-yellow flex flex-col justify-start p-4">
              <h4 className="text-sm font-bold font-mono text-accent-tertiary uppercase mb-1">Priority Queue</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Each node holds a priority rank; higher priorities exit before lower ones.
              </p>
            </div>
            <div className="neon-card neon-card-cyan flex flex-col justify-start p-4">
              <h4 className="text-sm font-bold font-mono text-accent-secondary uppercase mb-1">Deque</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Double-ended queue allowing insertions and deletions at both FRONT and REAR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE VISUALIZATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <AlignJustify className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Interactive Visualization
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(2)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[2] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[2] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[2] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-cyan overflow-hidden" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Operations switch tabs */}
          <div className="flex border-b border-border-default/20 mb-6 gap-2">
            <button
              onClick={() => handleTabChange('enqueue')}
              className={`px-5 py-3 text-sm font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeVisTab === 'enqueue' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Enqueue (Insert 40)
            </button>
            <button
              onClick={() => handleTabChange('dequeue')}
              className={`px-5 py-3 text-sm font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeVisTab === 'dequeue' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Dequeue (Remove Front)
            </button>
            <button
              onClick={() => handleTabChange('peek')}
              className={`px-5 py-3 text-sm font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                activeVisTab === 'peek' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              Peek (Front)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel Column */}
            <div className="flex flex-col gap-4 justify-between">
              <div>
                <div className="flex justify-between items-center w-full mb-3 text-xs font-mono font-bold text-text-muted">
                  <span className="uppercase tracking-wider select-none">
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
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3 p-4 mb-4">
                  <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode panel */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>

                  {activeVisTab === 'enqueue' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isFull() &rarr; Overflow Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>REAR = REAR + 1</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>QUEUE[REAR] = 40</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'dequeue' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isEmpty() &rarr; Underflow Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>temp = QUEUE[FRONT] // 10</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>FRONT = FRONT + 1; return temp</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'peek' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>queue.isEmpty() &rarr; Error</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
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
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-base transition-all duration-300 ${blockStyle}`}>
                          {nodeVal}
                        </div>
                        {/* Index */}
                        <span className="text-[10px] text-text-muted font-mono">[{idx}]</span>

                        {/* Pointers Stacked */}
                        {pointers.length > 0 && (
                          <div className="absolute -top-10 flex flex-col items-center gap-1">
                            {pointers.map((p, pIdx) => (
                              <span 
                                key={pIdx} 
                                className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-md ${
                                  p.label === 'FRONT' 
                                    ? 'bg-accent-primary text-bg-primary' 
                                    : 'bg-accent-secondary text-bg-primary'
                                }`}
                              >
                                {p.label}
                              </span>
                            ))}
                          </div>
                        )}
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

      {/* 3. BASIC OPERATIONS AND COMPLEXITIES */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Table className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[3] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              3. Basic Operations and Complexities
            </h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Complexity Table Card */}
          <div className="lg:col-span-5 neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem] uppercase">
              Time Complexity Table
            </h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default/45 text-text-muted font-mono uppercase text-xs">
                    <th className="py-2.5">Operation</th>
                    <th className="py-2.5 text-center">Time Complexity</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary divide-y divide-border-default/15 font-mono text-base">
                  <tr>
                    <td className="py-3">Enqueue</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(1)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Dequeue</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(1)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Peek / Front</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(1)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Search</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(N)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Traversal</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(N)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Explanation Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                <span>Enqueue</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(1)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Adding elements at the REAR pointer directly writes to memory, avoiding any traversal or element shifts.
              </p>
            </div>

            <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                <span>Dequeue</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(1)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Removing nodes from the FRONT simply advances the index pointers. No elements are moved down in RAM.
              </p>
            </div>

            <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                <span>Search</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(N)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Because array indexes are not directly exposed for random access, finding a value requires scanning elements sequentially.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERNAL WORKING */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[4] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              4. Internal Working
            </h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Implementation Models */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-4 uppercase">
              Queue Memory Structures
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-text-primary font-mono mb-2 uppercase">1. Array-Based Queue</h4>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  Allocates a contiguous block of memory. It tracks two index markers: `FRONT` (where elements leave) and `REAR` (where elements enter).
                </p>
                <div className="bg-bg-primary/45 p-3 rounded-lg border border-border-default/20 text-center font-mono text-xs text-text-muted">
                  FRONT &rarr; [10] [20] [30] &larr; REAR
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-text-primary font-mono mb-2 uppercase">2. Linked List Queue</h4>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  Allocates memory dynamically for each node. The `FRONT` pointer references the head node, and the `REAR` pointer references the tail node.
                </p>
                <div className="bg-bg-primary/45 p-3 rounded-lg border border-border-default/20 text-center font-mono text-xs text-text-muted">
                  FRONT &rarr; [10] &rarr; [20] &rarr; [30] &larr; REAR
                </div>
              </div>
            </div>
          </div>

          {/* Core Logic Blocks */}
          <div className="flex flex-col gap-4">
            <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-primary font-mono mb-1 uppercase">Circular Queue Working</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Standard linear arrays waste space once the FRONT pointer advances. A Circular Queue wraps the pointers back to index 0 using modular arithmetic:
                <br />
                <code className="text-accent-primary font-mono text-xs block mt-1.5">REAR = (REAR + 1) % CAPACITY</code>
              </p>
            </div>

            <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-primary font-mono mb-1 uppercase">Priority Queue Structure</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Elements hold numeric priority values. High-priority items are processed first, often implemented via Binary Heaps internally, powering pathfinding algorithms.
              </p>
            </div>

            <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-primary font-mono mb-1 uppercase">Queue Underflow</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Occurs when a dequeue call is executed on a queue that contains no elements. Pointers are checked (`FRONT === -1` or list size zero) to trigger empty alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CODE IMPLEMENTATIONS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[5] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              5. Code Implementation
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(5)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[5] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[5] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[5] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-cyan overflow-hidden" style={{ paddingTop: '1rem', paddingBottom: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Switch language tabs */}
          <div className="flex border-b border-border-default/20 mb-6 gap-2">
            {(['py', 'js', 'cpp', 'java'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-4 py-2 text-sm font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeCodeTab === lang 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {lang === 'py' ? 'Python' : lang === 'js' ? 'JavaScript' : lang === 'cpp' ? 'C++' : 'Java'}
              </button>
            ))}
          </div>

          {/* Implementation Snippets codebox */}
          <div className="bg-bg-primary rounded-xl border border-border-default/45 p-6 font-mono text-sm leading-relaxed overflow-x-auto text-text-secondary shadow-inner">
            {activeCodeTab === 'py' && (
              <pre className="space-y-4">
                <div>
                  <span className="text-text-muted"># Python — Queue using collections.deque</span>
                  <br />
                  <span className="text-accent-secondary">from</span> collections <span className="text-accent-secondary">import</span> deque
                  <br />
                  <br />
                  queue = deque()
                  <br />
                  <br />
                  <span className="text-text-muted"># Enqueue elements</span>
                  <br />
                  queue.append(<span className="text-accent-tertiary">10</span>)
                  <br />
                  queue.append(<span className="text-accent-tertiary">20</span>)
                  <br />
                  queue.append(<span className="text-accent-tertiary">30</span>)
                </div>
                <div>
                  <span className="text-text-muted"># Dequeue operation</span>
                  <br />
                  popped_element = queue.popleft() <span className="text-text-muted"># Returns 10</span>
                </div>
                <div>
                  <span className="text-text-muted"># Peek operation</span>
                  <br />
                  front_element = queue[<span className="text-accent-tertiary">0</span>] <span className="text-text-muted"># Returns 20</span>
                </div>
                <div className="border-t border-border-default/20 pt-4">
                  <span className="text-text-muted"># Python Class-Based Implementation</span>
                  <br />
                  <span className="text-accent-secondary">class</span> <span className="text-text-primary font-bold">Queue</span>:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">def</span> <span className="text-accent-primary font-bold">__init__</span>(self):
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.items = []
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">def</span> <span className="text-accent-primary font-bold">enqueue</span>(self, item):
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.items.append(item)
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">def</span> <span className="text-accent-primary font-bold">dequeue</span>(self):
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">return</span> self.items.pop(<span className="text-accent-tertiary">0</span>)
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">def</span> <span className="text-accent-primary font-bold">front</span>(self):
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">return</span> self.items[<span className="text-accent-tertiary">0</span>]
                </div>
              </pre>
            )}

            {activeCodeTab === 'js' && (
              <pre className="space-y-4">
                <div>
                  <span className="text-text-muted">// JavaScript — Class-Based Queue</span>
                  <br />
                  <span className="text-accent-secondary">class</span> <span className="text-text-primary font-bold">Queue</span> &#123;
                  <br />
                  &nbsp;&nbsp;constructor() &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">this</span>.items = [];
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;enqueue(element) &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">this</span>.items.push(element);
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;dequeue() &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">return</span> <span className="text-accent-secondary">this</span>.items.shift();
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;front() &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-secondary">return</span> <span className="text-accent-secondary">this</span>.items[<span className="text-accent-tertiary">0</span>];
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  &#125;
                </div>
              </pre>
            )}

            {activeCodeTab === 'cpp' && (
              <pre className="space-y-4">
                <div>
                  <span className="text-text-muted">// C++ — Standard Library Queue</span>
                  <br />
                  <span className="text-accent-secondary">#include</span> <span className="text-accent-tertiary">&lt;queue&gt;</span>
                  <br />
                  <span className="text-accent-secondary">#include</span> <span className="text-accent-tertiary">&lt;iostream&gt;</span>
                  <br />
                  <br />
                  <span className="text-accent-secondary">int</span> main() &#123;
                  <br />
                  &nbsp;&nbsp;std::queue&lt;<span className="text-accent-secondary">int</span>&gt; q;
                  <br />
                  <br />
                  &nbsp;&nbsp;<span className="text-text-muted">// Enqueue</span>
                  <br />
                  &nbsp;&nbsp;q.push(<span className="text-accent-tertiary">10</span>);
                  <br />
                  &nbsp;&nbsp;q.push(<span className="text-accent-tertiary">20</span>);
                  <br />
                  <br />
                  &nbsp;&nbsp;<span className="text-text-muted">// Front (Peek)</span>
                  <br />
                  &nbsp;&nbsp;std::cout &lt;&lt; q.front() &lt;&lt; std::endl; <span className="text-text-muted">// prints 10</span>
                  <br />
                  <br />
                  &nbsp;&nbsp;<span className="text-text-muted">// Dequeue</span>
                  <br />
                  &nbsp;&nbsp;q.pop();
                  <br />
                  &nbsp;&nbsp;<span className="text-accent-secondary">return</span> <span className="text-accent-tertiary">0</span>;
                  <br />
                  &#125;
                </div>
              </pre>
            )}

            {activeCodeTab === 'java' && (
              <pre className="space-y-4">
                <div>
                  <span className="text-text-muted">// Java — Queue Interface using LinkedList</span>
                  <br />
                  <span className="text-accent-secondary">import</span> java.util.LinkedList;
                  <br />
                  <span className="text-accent-secondary">import</span> java.util.Queue;
                  <br />
                  <br />
                  <span className="text-accent-secondary">public class</span> <span className="text-text-primary font-bold">Main</span> &#123;
                  <br />
                  &nbsp;&nbsp;<span className="text-accent-secondary">public static void</span> main(String[] args) &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;Queue&lt;Integer&gt; q = <span className="text-accent-secondary">new</span> LinkedList&lt;&gt;();
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-text-muted">// Enqueue</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;q.add(<span className="text-accent-tertiary">10</span>);
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;q.add(<span className="text-accent-tertiary">20</span>);
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-text-muted">// Front (Peek)</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;System.out.println(q.peek()); <span className="text-text-muted">// prints 10</span>
                  <br />
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-text-muted">// Dequeue</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;q.poll();
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  &#125;
                </div>
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* 6. COMMON FOUNDATIONAL PROBLEMS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[6] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              6. Common Foundational Problems
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(6)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[6] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[6] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[6] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { id: 1, title: 'Implement Queue Using Stacks', desc: 'Simulate First-In-First-Out data flows using two stacks.', type: 'Stack Simulation / Reversal' },
            { id: 2, title: 'Circular Queue Design', desc: 'Design memory-efficient circular buffer arrays using modular arithmetic.', type: 'Modular Arithmetic / Pointers' },
            { id: 3, title: 'Sliding Window Maximum', desc: 'Find maximum values in every contiguous subarray of size K using deques.', type: 'Deque Optimization' },
            { id: 4, title: 'BFS Traversal', desc: 'Traverse graphs and tree levels layer by layer using FIFO tracking.', type: 'Graph Traversal / Level Order' },
            { id: 5, title: 'Rotten Oranges', desc: 'Simulate minute-by-minute orange rot spreads using multi-source BFS.', type: 'Multi-Source BFS / Grid' },
            { id: 6, title: 'Task Scheduler', desc: 'Calculate CPU idle cool-down intervals with priority queues.', type: 'Queue Processing / CPU Scheduling' },
            { id: 7, title: 'First Non-Repeating Character', desc: 'Track unique stream elements dynamically using queues and maps.', type: 'Hashing + Queue' },
            { id: 8, title: 'Priority Queue Scheduling', desc: 'Simulate ready-list process executions based on importance ranks.', type: 'Heap-based Processing' }
          ].map(prob => (
            <div 
              key={prob.id}
              className="neon-card neon-card-cyan flex flex-col justify-between h-full group hover:border-accent-secondary/50 transition-colors"
              style={{ padding: '16px 24px 20px 24px' }}
            >
              <div>
                <span className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-widest block mb-1">
                  {prob.type}
                </span>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-secondary transition-colors mb-[0.7rem]">
                  {prob.id}. {prob.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {prob.desc}
                </p>
              </div>
              <button 
                onClick={() => navigate('/playground')}
                className="mt-6 text-sm font-mono font-bold text-accent-secondary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start cursor-pointer border-none bg-transparent outline-none"
              >
                Playground &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REAL WORLD APPLICATIONS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[7] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              7. Real World Applications
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(7)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[7] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.15)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[7] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[7] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'CPU Task Scheduling', desc: 'Operating systems line up ready-to-run processes in job queues for FIFO execution.' },
            { title: 'Printer Buffers', desc: 'Spooling systems process print document jobs in the exact sequential order they arrive.' },
            { title: 'Network Packet Routing', desc: 'Routers queue arriving data packets in buffers before forwarding them to destinations.' },
            { title: 'BFS Traversal', desc: 'Search paths explore neighbor nodes level-by-level using queues to track boundaries.' },
            { title: 'Ticket Booking Lines', desc: 'Web requests reserve seats in strict FIFO order, ensuring fair transaction processing.' },
            { title: 'Call Center Queues', desc: 'Inbound calls wait in line queues until customer support agents become active.' },
            { title: 'Streaming Buffers', desc: 'Audio and video players buffer network streams in queues to prevent playback stuttering.' }
          ].map((app, idx) => (
            <div 
              key={idx} 
              className="neon-card neon-card-pink flex flex-col justify-start"
              style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <h3 className="text-base font-bold text-accent-primary font-mono mb-2 flex items-center gap-2">
                <span>{app.title}</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{app.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. QUIZ SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[8] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              8. Queue Quiz
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(8)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[8] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[8] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[8] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-cyan" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-secondary uppercase tracking-wider">
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
            <div className="flex flex-col items-center justify-center text-center py-8 gap-6">
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
