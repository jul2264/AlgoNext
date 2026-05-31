import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, BookOpen, Layers, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award, ArrowDown
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

  // Progress management (8 checkpoints)
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_stacks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load stacks progress:', e);
    }
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
  });

  const toggleSection = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: !prev[sectionNum] };
      localStorage.setItem('dsa_progress_stacks', JSON.stringify(updated));
      return updated;
    });
  };

  const SECTION_WEIGHTS: Record<number, number> = { 1: 10, 2: 15, 3: 10, 4: 15, 5: 15, 6: 10, 7: 10, 8: 15 };
  const progressPercent = Object.entries(completedSections)
    .filter(([, done]) => done)
    .reduce((sum, [key]) => sum + (SECTION_WEIGHTS[Number(key)] || 0), 0);

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

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'js' | 'cpp' | 'java'>('python');

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
              What is a Stack?
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                A <strong className="text-text-primary font-semibold">Stack</strong> is a linear data structure that follows the <span className="text-accent-secondary"><strong className="font-mono font-bold">Last In, First Out (LIFO)</strong> principle.</span>
              </p>
              <p>
                This means that the most recently added element is always the first one to be removed.
              </p>
            </div>

            <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] mt-6 uppercase">
              Real-World Analogy
            </h3>
            <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
              <p>Think of:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>A stack of plates (you only add/remove from the top)</li>
                <li>Browser tabs (closing tabs displays the previous page)</li>
                <li>Undo operations in editors (recent edits are reversed first)</li>
              </ul>
            </div>
          </div>

          <div className="neon-card neon-card-pink flex flex-col justify-between" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <div>
              <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.3rem] uppercase">
                Stack Structure
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Elements are stacked vertically. Insertion and deletion happen exclusively at the TOP:
              </p>
            </div>

            {/* ASCII Stack Structure */}
            <div className="flex flex-col items-center justify-center py-4 bg-bg-primary/20 border border-border-default/20 rounded-xl max-w-xs mx-auto w-full">
              <div className="text-xs font-mono font-bold text-accent-primary flex flex-col items-center mb-1">
                <span>TOP</span>
                <ArrowDown size={14} className="animate-bounce" />
              </div>
              <div className="flex flex-col items-center gap-1.5 w-24">
                <div className="w-full py-2 bg-accent-primary/10 border border-accent-primary text-accent-primary font-mono font-bold text-center rounded-lg shadow-[0_0_8px_rgba(255,45,120,0.15)]">
                  [30]
                </div>
                <div className="w-full py-2 bg-bg-secondary border border-border-default text-text-secondary font-mono font-bold text-center rounded-lg">
                  [20]
                </div>
                <div className="w-full py-2 bg-bg-secondary border border-border-default text-text-secondary font-mono font-bold text-center rounded-lg">
                  [10]
                </div>
              </div>
            </div>

            <div className="text-sm text-text-muted text-center mt-3 font-mono">
              Here, Node <span className="text-accent-primary font-bold">30</span> is removed first; Node <span className="text-text-primary font-bold">10</span> is removed last.
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
                    <td className="py-2.5 font-bold font-mono text-accent-tertiary">LIFO</td>
                    <td className="py-2.5">Last In, First Out ordering rule.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-tertiary">Single Access</td>
                    <td className="py-2.5">All updates occur strictly at the TOP.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-tertiary">Fast Operations</td>
                    <td className="py-2.5">Push and Pop run in constant O(1) time.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-tertiary">Sequential</td>
                    <td className="py-2.5">Elements are layered vertically in order of entry.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Operations */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase">
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
                    <td className="py-2.5 font-bold font-mono text-accent-secondary">Push</td>
                    <td className="py-2.5">Insert a new element at the TOP.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-secondary">Pop</td>
                    <td className="py-2.5">Remove the element currently at the TOP.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-secondary">Peek / Top</td>
                    <td className="py-2.5">View the top element without removing it.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold font-mono text-accent-secondary">isEmpty</td>
                    <td className="py-2.5">Verify whether the stack contains any nodes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE VISUALIZATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Interactive Visualization
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(2)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[2] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1) ] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[2] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[2] && <Check size={18} strokeWidth={3.5} />}
          </button>
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
                    <td className="py-3">Push</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(1)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Pop</td>
                    <td className="py-3 text-center text-accent-tertiary font-extrabold">O(1)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Peek</td>
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
                <span>Constant Time Push</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(1)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Adding elements strictly at the TOP simply updates the TOP index or node address reference, requiring no shifts or iterations.
              </p>
            </div>

            <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                <span>Constant Time Pop</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(1)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Removing elements from the TOP requires no element shifting across RAM blocks. It simply decreases the pointer reference index.
              </p>
            </div>

            <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
              <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-wrap items-baseline gap-x-2">
                <span>Linear Search</span>
                <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(N)</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Since stack structures restrict direct index lookup access, finding any random element inside a stack requires sequential node backtracking pop loops.
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
          {/* Implementation Memory Models */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-4 uppercase">
              1. Stack Memory Structure
            </h3>
            <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
              <p>Stacks can be structurally backed by two core memory strategies:</p>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-1">Array-Based Stack</strong>
                <p className="mb-2">Contiguous sequential RAM mapping. TOP references index offsets:</p>
                <div className="w-full flex justify-center">
                  <div 
                    className="relative bg-bg-primary/30 p-4 rounded-lg border border-border-default/20 w-full max-w-xs flex justify-center select-none"
                    style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}
                  >
                    <span className="absolute left-4 top-4 text-text-muted font-mono" style={{ fontSize: '0.75rem' }}>Index:</span>
                    <div className="flex items-start gap-4 font-mono">
                      <div className="flex flex-col items-center w-12">
                        <span className="text-text-muted mb-1" style={{ fontSize: '0.75rem' }}>0</span>
                        <span className="text-accent-secondary font-bold text-base">[10]</span>
                      </div>
                      <div className="flex flex-col items-center w-12">
                        <span className="text-text-muted mb-1" style={{ fontSize: '0.75rem' }}>1</span>
                        <span className="text-accent-secondary font-bold text-base">[20]</span>
                      </div>
                      <div className="flex flex-col items-center w-12">
                        <span className="text-text-muted mb-1" style={{ fontSize: '0.75rem' }}>2</span>
                        <span className="text-accent-secondary font-bold text-base">[30]</span>
                        <span className="text-accent-secondary text-base mt-1 leading-none">↑</span>
                        <span className="text-accent-secondary font-bold text-xs mt-0.5">TOP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside mt-3 text-sm space-y-2">
                  <li><strong>Push:</strong> Increment TOP and insert at array index location.</li>
                  <li><strong>Pop:</strong> Fetch value and decrement TOP index variable.</li>
                </ul>
              </div>

              <div className="pt-2">
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-1">Linked List Stack</strong>
                <p className="mb-2">Scattered node pointer connections. TOP stores the address reference to the head node:</p>
                <div className="w-full flex justify-center">
                  <div 
                    className="font-mono bg-bg-primary/30 p-3 rounded-lg border border-border-default/20 text-center w-full max-w-md text-accent-secondary font-bold"
                    style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}
                  >
                    TOP &rarr; [30] &rarr; [20] &rarr; [10] &rarr; NULL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency & Overflow Details */}
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-4 uppercase">
              2. Why Stacks Are Fast
            </h3>
            <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
              <p>
                All operations occur strictly at the <strong className="text-text-primary">TOP</strong> pointer boundary. No elements need to be shifted, memory cells shuffled, or linked nodes traversed.
              </p>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-1">Stack Overflow</strong>
                <p className="mb-1">
                  Occurs when stack allocation memory capacity becomes completely full, or too many nested function activations recur.
                </p>
                <p className="text-sm text-accent-primary font-mono font-bold mt-2 text-center">
                  Example: Unbounded infinite recursion calls.
                </p>
              </div>

              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-1">Function Call Stack</strong>
                <p className="mb-2">
                  Operating systems execute code routines using call stacks. Every invocation pushes local context variables and returns pointers in reverse order:
                </p>
                <div className="w-full flex justify-center">
                  <div 
                    className="space-y-2 font-mono bg-bg-primary/30 p-4 border border-border-default/20 rounded-lg w-full max-w-xs flex flex-col items-center justify-center"
                    style={{ marginTop: '1rem', marginBottom: '1rem' }}
                  >
                    <div className="text-accent-primary font-bold text-center" style={{ fontSize: '0.85rem' }}>funcB() Frame</div>
                    <div className="text-accent-primary/60 font-normal text-center" style={{ fontSize: '0.75rem' }}>&darr; returns first</div>
                    <div className="text-accent-primary font-bold text-center" style={{ fontSize: '0.85rem' }}>funcA() Frame</div>
                    <div className="text-accent-primary/60 font-normal text-center" style={{ fontSize: '0.75rem' }}>&darr; returns next</div>
                    <div className="text-accent-primary font-bold text-center" style={{ fontSize: '0.85rem' }}>main() Frame</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CODE IMPLEMENTATION */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Code2 className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[5] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              5. Code Implementation
            </h2>
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
          {/* Language Tabs */}
          <div className="flex border-b border-border-default/50 gap-4 overflow-x-auto">
            {([
              { id: 'python', label: 'Python' },
              { id: 'js', label: 'JavaScript' },
              { id: 'cpp', label: 'C++' },
              { id: 'java', label: 'Java' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCodeTab(tab.id)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeCodeTab === tab.id 
                    ? 'border-accent-tertiary text-accent-tertiary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Blocks */}
          <div className="bg-bg-primary/70 rounded-xl border border-border-default/80 p-4 font-mono text-sm leading-relaxed overflow-x-auto max-h-[480px] scrollbar-hide">
            {activeCodeTab === 'python' && (
              <pre className="text-white">
{`# 1. Stack using standard Python list
stack = []

# PUSH Operations
stack.append(10)
stack.append(20)
stack.append(30)
print("Stack contents:", stack)  # Output: [10, 20, 30]

# POP Operation
popped = stack.pop()
print("Popped item:", popped)     # Output: 30
print("Stack contents:", stack)  # Output: [10, 20]

# PEEK Operation
top_item = stack[-1]
print("Top item (Peek):", top_item) # Output: 20


# 2. Stack implementation using a Custom Class
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

# Test Class
stack = Stack()
stack.push(10)
stack.push(20)
print("Custom Stack Peek:", stack.peek())  # Output: 20`}
              </pre>
            )}

            {activeCodeTab === 'js' && (
              <pre className="text-white">
{`// 1. Stack using standard Array
const stack = [];

// PUSH Operations
stack.push(10);
stack.push(20);
stack.push(30);
console.log("Stack contents:", stack);  // Output: [10, 20, 30]

// POP Operation
const popped = stack.pop();
console.log("Popped item:", popped);     // Output: 30

// PEEK Operation
const topItem = stack[stack.length - 1];
console.log("Top item (Peek):", topItem); // Output: 20


// 2. Stack implementation using Custom Class
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack Underflow");
    }
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

// Test Class
const myStack = new Stack();
myStack.push(10);
myStack.push(20);
console.log("Custom Stack Peek:", myStack.peek()); // Output: 20`}
              </pre>
            )}

            {activeCodeTab === 'cpp' && (
              <pre className="text-white">
{`#include <iostream>
#include <stack>
#include <stdexcept>

// C++ STL Stack demonstration
int main() {
    std::stack<int> s;

    // PUSH operations
    s.push(10);
    s.push(20);
    s.push(30);

    // PEEK / view top element
    std::cout << "Top element: " << s.top() << std::endl; // Output: 30

    // POP operation
    s.pop();
    std::cout << "Top element after pop: " << s.top() << std::endl; // Output: 20

    // Check empty state
    if (s.empty()) {
        std::cout << "Stack is empty." << std::endl;
    } else {
        std::cout << "Stack has elements." << std::endl;
    }

    return 0;
}`}
              </pre>
            )}

            {activeCodeTab === 'java' && (
              <pre className="text-white">
{`import java.util.Stack;
import java.util.EmptyStackException;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();

        // PUSH operations
        stack.push(10);
        stack.push(20);
        stack.push(30);

        // PEEK operation
        System.out.println("Top element: " + stack.peek()); // Output: 30

        // POP operation
        int popped = stack.pop();
        System.out.println("Popped element: " + popped);     // Output: 30
        System.out.println("New Top: " + stack.peek());      // Output: 20

        // Check empty state
        System.out.println("Is stack empty? " + stack.isEmpty()); // Output: false
    }
}`}
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* 6. FOUNDATIONAL PROBLEMS */}
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

        {/* Problems Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { id: 1, title: 'Valid Parentheses', type: 'String Parsing / Stack Matching', desc: 'Identify matching braces using push/pop stack checks.' },
            { id: 2, title: 'Next Greater Element', type: 'Monotonic Stack', desc: 'Find nearest greater elements using linear monotonic optimizations.' },
            { id: 3, title: 'Reverse String', type: 'LIFO Reversal', desc: 'Reverse string characters by leveraging standard stack buffer LIFO ordering.' },
            { id: 4, title: 'Evaluate Postfix Expression', type: 'Operand Stacking', desc: 'Parse math expressions and resolve postfix operators.' },
            { id: 5, title: 'Min Stack', type: 'Auxiliary Stack', desc: 'Support O(1) minimum value retrieval inside a custom stack wrapper.' },
            { id: 6, title: 'Largest Rectangle in Histogram', type: 'Monotonic Stack Boundaries', desc: 'Calculate the maximum rectangular area boundaries.' },
            { id: 7, title: 'Browser Back Button', type: 'State History / Navigation', desc: 'Model site history navigation by storing routes on back stacks.' },
            { id: 8, title: 'Recursion Simulation', type: 'Call Stack Execution', desc: 'Mock recursion function layers using explicit stack arrays.' }
          ].map((prob) => (
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
                className="mt-6 text-sm font-mono font-bold text-accent-secondary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start cursor-pointer"
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
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1) ] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[7] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[7] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        {/* Applications Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            { title: 'Undo / Redo Systems', desc: 'Used in text editors, graphic design software, and IDEs to reverse recent user edit states.' },
            { title: 'Browser History Navigation', desc: 'Backwards and forwards page navigation history is managed using LIFO stack tracks.' },
            { title: 'Function Call Execution', desc: 'Compilers maintain execution environments and track local variables in call stack frames.' },
            { title: 'Expression Validation & Parsing', desc: 'Compilers parse mathematical expression parentheses using stack delimiters.' },
            { title: 'DFS (Depth-First Search)', desc: 'Graph deep traversals use stacks to track backtrack routes when hitting search limits.' },
            { title: 'Operating System Memory', desc: 'Execution stacks control execution threads and handle local parameter bounds.' },
            { title: 'String and Sequence Reversal', desc: 'LIFO structures naturally reverse sequences when popped.' }
          ].map((app, idx) => (
            <div 
              key={idx}
              className="neon-card neon-card-pink flex flex-col justify-start"
              style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <h3 className="text-base font-bold text-accent-primary font-mono mb-[0.3rem] uppercase">
                {app.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mt-1">
                {app.desc}
              </p>
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
              8. Stack Quiz
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
