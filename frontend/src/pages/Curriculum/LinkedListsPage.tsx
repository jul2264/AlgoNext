import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award, ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  // Representing the visual linked list nodes
  nodes: { val: number; nextVal: number | string | null; label?: string }[];
  activeIndex?: number;
  pointers?: { label: string; index: number }[];
  highlightIndices?: number[];
  line: number;
}

// Visualizer steps configuration for Linked Lists
const VISUALIZATION_STEPS: Record<'traversal' | 'insert-head' | 'insert-tail' | 'delete' | 'reverse', VisStep[]> = {
  traversal: [
    {
      step: 0,
      description: 'Initial state of the linked list. Traversal starts at the HEAD pointer (index 0).',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Visit Node 10. Access the value (10) and follow the next pointer to index 1.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      line: 4
    },
    {
      step: 2,
      description: 'Follow pointer to Node 20. Access the value (20) and read the next reference pointing to index 2.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 1,
      pointers: [{ label: 'curr', index: 1 }],
      line: 5
    },
    {
      step: 3,
      description: 'Follow pointer to Node 30. Access the value (30). The next pointer is NULL, indicating the end of the list.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 2,
      pointers: [{ label: 'curr', index: 2 }],
      line: 5
    },
    {
      step: 4,
      description: 'Current reaches NULL. The linear traversal loop terminates.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [],
      line: 4
    }
  ],
  'insert-head': [
    {
      step: 0,
      description: 'Initial list: HEAD points to Node 20. We want to insert a new node with value 10 at the beginning.',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Allocate a new node in memory with data 10 and next pointing to NULL.',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null },
        { val: 10, nextVal: null, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2],
      line: 1
    },
    {
      step: 2,
      description: 'Connect the new node. Point new_node.next to the current HEAD node (Node 20).',
      nodes: [
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null },
        { val: 10, nextVal: 20, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2, 0],
      line: 3
    },
    {
      step: 3,
      description: 'Update HEAD to reference the new node (Node 10). The insertion at head is complete.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'HEAD', index: 0 }],
      highlightIndices: [0],
      line: 4
    }
  ],
  'insert-tail': [
    {
      step: 0,
      description: 'Initial list. To insert at the end, we first need to traverse the list and find the tail node.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Create the new node with data 30 and next pointing to NULL.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null },
        { val: 30, nextVal: null, label: 'new_node' }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }, { label: 'new_node', index: 2 }],
      highlightIndices: [2],
      line: 1
    },
    {
      step: 2,
      description: 'Traverse to find the tail node. Node 20 is the tail since its next is NULL.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: null, label: 'tail' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 1,
      pointers: [{ label: 'curr', index: 1 }, { label: 'new_node', index: 2 }],
      highlightIndices: [1],
      line: 3
    },
    {
      step: 3,
      description: 'Update the tail node\'s pointer. Connect Node 20\'s next pointer to the new node (30).',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 2,
      pointers: [{ label: 'HEAD', index: 0 }],
      highlightIndices: [1, 2],
      line: 4
    }
  ],
  delete: [
    {
      step: 0,
      description: 'Initial state: We want to delete Node 20. Traversal will find the node preceding the target.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Locate the predecessor node (Node 10) which is right before the target Node 20.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      highlightIndices: [0],
      line: 4
    },
    {
      step: 2,
      description: 'Reassign pointers. Point Node 10\'s next directly to Node 20\'s next (Node 30).',
      nodes: [
        { val: 10, nextVal: 30 },
        { val: 20, nextVal: 30, label: 'orphaned' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'curr', index: 0 }],
      highlightIndices: [0, 2],
      line: 6
    },
    {
      step: 3,
      description: 'Node 20 is completely bypassed. Garbage collection (or delete) reclaims Node 20\'s memory.',
      nodes: [
        { val: 10, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 6
    }
  ],
  reverse: [
    {
      step: 0,
      description: 'Initial list. Reversal requires keeping track of three pointers: prev, current, and next.',
      nodes: [
        { val: 10, nextVal: 20 },
        { val: 20, nextVal: 30 },
        { val: 30, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 1
    },
    {
      step: 1,
      description: 'Point Node 10\'s next to prev (NULL). Shift pointers (prev=10, current=20).',
      nodes: [
        { val: 10, nextVal: null, label: 'prev' },
        { val: 20, nextVal: 30, label: 'curr' },
        { val: 30, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }, { label: 'curr', index: 1 }],
      highlightIndices: [0],
      line: 6
    },
    {
      step: 2,
      description: 'Point Node 20\'s next to prev (Node 10). Shift pointers (prev=20, current=30).',
      nodes: [
        { val: 20, nextVal: 10, label: 'prev' },
        { val: 10, nextVal: null },
        { val: 30, nextVal: null, label: 'curr' }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }, { label: 'curr', index: 2 }],
      highlightIndices: [0, 1],
      line: 6
    },
    {
      step: 3,
      description: 'Point Node 30\'s next to prev (Node 20). Shift pointers (prev=30, current=NULL).',
      nodes: [
        { val: 30, nextVal: 20, label: 'prev' },
        { val: 20, nextVal: 10 },
        { val: 10, nextVal: null }
      ],
      activeIndex: 0,
      pointers: [{ label: 'prev', index: 0 }],
      highlightIndices: [0, 1],
      line: 6
    },
    {
      step: 4,
      description: 'Update HEAD pointer to prev (Node 30). The reversed linked list is complete.',
      nodes: [
        { val: 30, nextVal: 20 },
        { val: 20, nextVal: 10 },
        { val: 10, nextVal: null }
      ],
      activeIndex: -1,
      pointers: [{ label: 'HEAD', index: 0 }],
      line: 9
    }
  ]
};

const QUIZ_QUESTIONS = [
  {
    question: "Linked Lists store elements using:",
    options: ["Indices", "Hashes", "Nodes and pointers", "Matrices"],
    answer: 2,
    explanation: "A linked list stores data in individual objects called nodes, where each node holds its value and a pointer/reference to the next node."
  },
  {
    question: "Which structure allows dynamic memory allocation?",
    options: ["Array", "Linked List", "Matrix", "Heap Sort"],
    answer: 1,
    explanation: "Linked Lists dynamically allocate memory for nodes on the heap as they are added, avoiding the static sizing limitation of arrays."
  },
  {
    question: "Which operation is O(1) in linked lists?",
    options: ["Access by Index", "Search", "Insert at Head", "Traversal"],
    answer: 2,
    explanation: "Inserting a node at the head only requires updating pointers, which does not require traversing the list and runs in constant O(1) time."
  },
  {
    question: "Linked Lists use:",
    options: ["Contiguous memory", "Sequential memory blocks", "Scattered memory locations", "Stack memory only"],
    answer: 2,
    explanation: "Unlike arrays which require a single contiguous block of memory, linked list nodes can be scattered anywhere in the heap."
  },
  {
    question: "What does each singly linked list node contain?",
    options: ["Data only", "Pointer only", "Data and next pointer", "Previous pointer only"],
    answer: 2,
    explanation: "Singly linked list nodes contain a data field and a pointer referencing the next node in the sequence."
  },
  {
    question: "Which linked list supports backward traversal?",
    options: ["Singly Linked List", "Circular Linked List", "Doubly Linked List", "Array"],
    answer: 2,
    explanation: "Doubly linked lists contain both next and previous pointers, allowing nodes to be traversed in both directions."
  },
  {
    question: "What marks the end of a linked list?",
    options: ["0", "HEAD", "NULL", "Tail Index"],
    answer: 2,
    explanation: "The next pointer of the final node in a standard linked list is set to NULL, signaling that there are no further nodes."
  },
  {
    question: "What is the time complexity of linked list traversal?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "To traverse a list, we must visit every node from HEAD to the tail, requiring O(N) linear time."
  },
  {
    question: "Which algorithm detects cycles in linked lists?",
    options: ["Binary Search", "DFS", "Floyd’s Cycle Detection", "Merge Sort"],
    answer: 2,
    explanation: "Floyd's Cycle Detection (Tortoise and Hare) uses two pointers moving at different speeds to detect cycles in linear time."
  },
  {
    question: "Which pointer references the first node?",
    options: ["ROOT", "HEAD", "TOP", "FRONT"],
    answer: 1,
    explanation: "The entry point of a linked list is tracked via the HEAD pointer."
  },
  {
    question: "Why are insertions efficient in linked lists?",
    options: ["Direct indexing", "No shifting required", "Contiguous memory", "Cache optimization"],
    answer: 1,
    explanation: "Insertions in linked lists only require re-linking pointers. Unlike arrays, no elements need to be shifted in memory."
  },
  {
    question: "Which linked list connects the last node back to the first?",
    options: ["Doubly Linked List", "Dynamic Array", "Circular Linked List", "Stack"],
    answer: 2,
    explanation: "In a circular linked list, the tail node's next pointer references the HEAD node, forming a closed loop."
  },
  {
    question: "What is a major disadvantage of linked lists?",
    options: ["Dynamic growth", "Efficient insertions", "Slow access time", "Pointer support"],
    answer: 2,
    explanation: "Because nodes are not indexed, accessing a node requires linear O(N) traversal, which is slow compared to constant O(1) array access."
  },
  {
    question: "Which structure powers browser navigation history?",
    options: ["Array", "Heap", "Doubly Linked List", "Trie"],
    answer: 2,
    explanation: "Browser back and forward navigation history fits a doubly linked list structure, allowing forwards and backwards traversal."
  },
  {
    question: "Which operation reconnects pointers during deletion?",
    options: ["Shifting", "Traversal", "Pointer reassignment", "Heapify"],
    answer: 2,
    explanation: "Deleting a node involves reassigning the predecessor's next pointer to point to the successor node."
  },
  {
    question: "Linked Lists are commonly used in:",
    options: ["Hash table chaining", "Matrix multiplication", "Binary search", "Sorting networks"],
    answer: 0,
    explanation: "Separate chaining resolves hash table collisions by attaching a linked list to each bucket."
  },
  {
    question: "Which technique finds the middle node efficiently?",
    options: ["Prefix Sum", "Binary Search", "Fast and Slow Pointers", "Heap Traversal"],
    answer: 2,
    explanation: "A slow pointer moves 1 step while a fast pointer moves 2 steps. When the fast pointer reaches the end, the slow pointer points to the middle."
  },
  {
    question: "Which linked list problem commonly uses reversal?",
    options: ["Palindrome Detection", "DFS", "Segment Trees", "Graph Coloring"],
    answer: 0,
    explanation: "Validating a palindrome linked list often involves finding the middle, reversing the second half, and comparing node values."
  },
  {
    question: "Why are linked lists less cache-friendly than arrays?",
    options: ["Fixed size", "Pointer arithmetic", "Non-contiguous memory", "Dynamic indexing"],
    answer: 2,
    explanation: "Because nodes are scattered in memory rather than contiguous, traversals trigger frequent CPU cache misses."
  },
  {
    question: "Which linked list variant stores both previous and next references?",
    options: ["Singly Linked List", "Circular Array", "Doubly Linked List", "Stack"],
    answer: 2,
    explanation: "Doubly linked lists maintain node links in both directions using next and previous pointers."
  }
];

export function LinkedListsPage() {
  const navigate = useNavigate();

  // Progress management (2 checkpoints)
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_linked_lists');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load linked lists progress:', e);
    }
    return { 1: false, 2: false };
  });



  // Visualization state
  const [activeVisTab, setActiveVisTab] = useState<'traversal' | 'insert-head' | 'insert-tail' | 'delete' | 'reverse'>('traversal');
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

  const handleNext = () => {
    if (visStep < activeSteps.length - 1) {
      setVisStep(visStep + 1);
    }
  };

  const handlePrev = () => {
    if (visStep > 0) {
      setVisStep(visStep - 1);
    }
  };

  // Quiz state
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>([]);

  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optIdx);
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
      // Mark Section 2 (Quiz) as completed
      setCompletedSections((prev) => {
        const updated = { ...prev, 2: true };
        localStorage.setItem('dsa_progress_linked_lists', JSON.stringify(updated));
        return updated;
      });
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
              <span className="text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.3)]">Linked Lists</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Dynamic size and pointer-based sequence allocation
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
              { id: 'traversal', label: 'Traversal' },
              { id: 'insert-head', label: 'Insert Head' },
              { id: 'insert-tail', label: 'Insert Tail' },
              { id: 'delete', label: 'Delete Node' },
              { id: 'reverse', label: 'Reverse List' }
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
                {activeVisTab === 'traversal' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span className="whitespace-pre">curr = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span className="whitespace-pre">while curr is not NULL:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span className="whitespace-pre">    visit(curr.val)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">4</span>
                      <span className="whitespace-pre">    curr = curr.next</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'insert-head' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span className="whitespace-pre">new_node = Node(10)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span className="whitespace-pre">new_node.next = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span className="whitespace-pre">HEAD = new_node</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'insert-tail' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span className="whitespace-pre">new_node = Node(30)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span className="whitespace-pre">curr = tail_node</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span className="whitespace-pre">curr.next = new_node</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'delete' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span className="whitespace-pre"># Search Node 20</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span className="whitespace-pre">prev = node_before(20)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span className="whitespace-pre">prev.next = prev.next.next</span>
                    </div>
                  </div>
                )}

                {activeVisTab === 'reverse' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span className="whitespace-pre">prev = NULL, curr = HEAD</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span className="whitespace-pre">nxt = curr.next; curr.next = prev</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 9 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span className="whitespace-pre">HEAD = prev</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex flex-col justify-center items-center min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>HEAP MEMORY NODES</span>
              </div>

              {/* Graphical Nodes Row */}
              <div className="flex-1 flex items-center justify-center w-full py-12 overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-4 px-4">
                  {activeStepData.nodes.map((node, idx) => {
                    const isActive = activeStepData.activeIndex === idx;
                    const isHighlighted = activeStepData.highlightIndices?.includes(idx);
                    const pointerLabel = activeStepData.pointers?.find(p => p.index === idx)?.label;

                    let nodeStyle = 'border-border-default bg-bg-secondary text-text-secondary';
                    if (isActive) {
                      nodeStyle = 'border-accent-primary bg-accent-primary/15 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.2)]';
                    } else if (isHighlighted) {
                      nodeStyle = 'border-accent-secondary bg-accent-secondary/15 text-accent-secondary shadow-[0_0_12px_rgba(0,255,204,0.2)]';
                    }

                    return (
                      <div key={idx} className="flex items-center gap-2 sm:gap-4 relative">
                        {/* Connecting Arrow from predecessor */}
                        {idx > 0 && (
                          <div className="flex flex-col items-center justify-center text-text-muted select-none">
                            <ArrowRight size={20} className={isHighlighted ? "text-accent-secondary animate-pulse" : "text-text-muted/60"} />
                          </div>
                        )}

                        <div className="flex flex-col items-center gap-1 relative">
                          <motion.div
                            layout
                            className={`w-10 h-10 sm:w-12 sm:h-12 border rounded-xl flex items-center justify-center font-mono font-bold text-sm sm:text-base shadow-md transition-all ${nodeStyle}`}
                          >
                            {node.val}
                          </motion.div>
                          
                          <span className="text-[10px] text-text-muted font-mono mt-1 select-none">Node [{idx}]</span>

                          {/* Top Tag Label (new_node/prev/etc.) moved below the node */}
                          {node.label && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-2 py-0.5 bg-bg-secondary border border-border-default rounded text-[9px] font-mono font-bold uppercase whitespace-nowrap text-text-secondary select-none">
                              {node.label}
                            </div>
                          )}

                          {/* Pointer Label moved above the node */}
                          {pointerLabel && (
                            <div 
                              className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-5 bg-accent-primary text-bg-primary rounded-xl text-[13px] font-mono font-bold uppercase whitespace-nowrap shadow-md select-none leading-none"
                              style={{ padding: '0.5rem' }}
                            >
                              {pointerLabel}
                            </div>
                          )}
                        </div>
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
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Linked Lists Quiz
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-primary uppercase tracking-wider select-none">
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
                        optionStyle = "border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.15)]";
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
              <Award className="text-accent-primary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-primary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetryQuiz}
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
