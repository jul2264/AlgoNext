import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award, Bookmark
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  highlightedLine: number;
  // Node coordinates and state
  v1Nodes: { id: string; x: number; y: number; val: string | number; label?: string; active?: boolean; shared?: boolean }[];
  v1Edges: { from: string; to: string }[];
  v2Nodes: { id: string; x: number; y: number; val: string | number; label?: string; active?: boolean; shared?: boolean }[];
  v2Edges: { from: string; to: string }[];
}

const VIS_STEPS_PATH_COPYING: VisStep[] = [
  {
    step: 0,
    description: "Start BST insertion of 20 at root Node 10.",
    highlightedLine: 0,
    v1Nodes: [
      { id: '10', x: 140, y: 50, val: 10, label: "Root V1", active: true },
      { id: '5', x: 80, y: 120, val: 5 },
      { id: '15', x: 200, y: 120, val: 15 }
    ],
    v1Edges: [
      { from: '10', to: '5' },
      { from: '10', to: '15' }
    ],
    v2Nodes: [],
    v2Edges: []
  },
  {
    step: 1,
    description: "Since 20 > 10, copy root 10 to 10'. Node 10' reuses left child Node 5 (shared) and traverses right.",
    highlightedLine: 5,
    v1Nodes: [
      { id: '10', x: 140, y: 50, val: 10 },
      { id: '5', x: 80, y: 120, val: 5, shared: true },
      { id: '15', x: 200, y: 120, val: 15, active: true }
    ],
    v1Edges: [
      { from: '10', to: '5' },
      { from: '10', to: '15' }
    ],
    v2Nodes: [
      { id: '10_prime', x: 300, y: 50, val: "10'", label: "Root V2 (Copy)", active: true }
    ],
    v2Edges: [
      { from: '10_prime', to: '5' }
    ]
  },
  {
    step: 2,
    description: "Since 20 > 15, copy Node 15 to 15'. Node 15' traverses to its empty right child.",
    highlightedLine: 5,
    v1Nodes: [
      { id: '10', x: 140, y: 50, val: 10 },
      { id: '5', x: 80, y: 120, val: 5, shared: true },
      { id: '15', x: 200, y: 120, val: 15 }
    ],
    v1Edges: [
      { from: '10', to: '5' },
      { from: '10', to: '15' }
    ],
    v2Nodes: [
      { id: '10_prime', x: 300, y: 50, val: "10'", label: "Root V2 (Copy)" },
      { id: '15_prime', x: 360, y: 120, val: "15'", active: true }
    ],
    v2Edges: [
      { from: '10_prime', to: '5' },
      { from: '10_prime', to: '15_prime' }
    ]
  },
  {
    step: 3,
    description: "Reached null child. Allocate new Node 20.",
    highlightedLine: 2,
    v1Nodes: [
      { id: '10', x: 140, y: 50, val: 10 },
      { id: '5', x: 80, y: 120, val: 5, shared: true },
      { id: '15', x: 200, y: 120, val: 15 }
    ],
    v1Edges: [
      { from: '10', to: '5' },
      { from: '10', to: '15' }
    ],
    v2Nodes: [
      { id: '10_prime', x: 300, y: 50, val: "10'", label: "Root V2 (Copy)" },
      { id: '15_prime', x: 360, y: 120, val: "15'" },
      { id: '20', x: 420, y: 190, val: 20, active: true }
    ],
    v2Edges: [
      { from: '10_prime', to: '5' },
      { from: '10_prime', to: '15_prime' }
    ]
  },
  {
    step: 4,
    description: "Link 15' to 20, and 10' to 15'. Version 2 is now ready. Node 5 is shared!",
    highlightedLine: 6,
    v1Nodes: [
      { id: '10', x: 140, y: 50, val: 10, label: "Root V1" },
      { id: '5', x: 80, y: 120, val: 5, shared: true },
      { id: '15', x: 200, y: 120, val: 15 }
    ],
    v1Edges: [
      { from: '10', to: '5' },
      { from: '10', to: '15' }
    ],
    v2Nodes: [
      { id: '10_prime', x: 300, y: 50, val: "10'", label: "Root V2" },
      { id: '15_prime', x: 360, y: 120, val: "15'" },
      { id: '20', x: 420, y: 190, val: 20 }
    ],
    v2Edges: [
      { from: '10_prime', to: '5' },
      { from: '10_prime', to: '15_prime' },
      { from: '15_prime', to: '20' }
    ]
  }
];

const VIS_STEPS_SEGMENT_TREE: VisStep[] = [
  {
    step: 0,
    description: "Initial tree V1 (Sum = 16) for [2, 5, 1, 8]. We will update index 2 to 10.",
    highlightedLine: 0,
    v1Nodes: [
      { id: 'A', x: 180, y: 40, val: 16, label: "Root V1 [0..3]", active: true },
      { id: 'B', x: 100, y: 100, val: 7, label: "[0..1]" },
      { id: 'C', x: 260, y: 100, val: 9, label: "[2..3]" },
      { id: 'D', x: 60, y: 160, val: 2, label: "[0..0]" },
      { id: 'E', x: 140, y: 160, val: 5, label: "[1..1]" },
      { id: 'F', x: 220, y: 160, val: 1, label: "[2..2]" },
      { id: 'G', x: 300, y: 160, val: 8, label: "[3..3]" }
    ],
    v1Edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
      { from: 'C', to: 'F' }, { from: 'C', to: 'G' }
    ],
    v2Nodes: [],
    v2Edges: []
  },
  {
    step: 1,
    description: "Index 2 is in right half [2..3]. Copy root A to A', share left child B, and traverse right.",
    highlightedLine: 1,
    v1Nodes: [
      { id: 'A', x: 180, y: 40, val: 16, label: "Root V1 [0..3]" },
      { id: 'B', x: 100, y: 100, val: 7, label: "[0..1]", shared: true },
      { id: 'C', x: 260, y: 100, val: 9, label: "[2..3]", active: true },
      { id: 'D', x: 60, y: 160, val: 2, label: "[0..0]" },
      { id: 'E', x: 140, y: 160, val: 5, label: "[1..1]" },
      { id: 'F', x: 220, y: 160, val: 1, label: "[2..2]" },
      { id: 'G', x: 300, y: 160, val: 8, label: "[3..3]" }
    ],
    v1Edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
      { from: 'C', to: 'F' }, { from: 'C', to: 'G' }
    ],
    v2Nodes: [
      { id: 'A_prime', x: 420, y: 40, val: "25'", label: "Root V2 (Copy)", active: true }
    ],
    v2Edges: [
      { from: 'A_prime', to: 'B' }
    ]
  },
  {
    step: 2,
    description: "At [2..3], copy child C to C'. Share right leaf G and traverse left to index 2.",
    highlightedLine: 1,
    v1Nodes: [
      { id: 'A', x: 180, y: 40, val: 16, label: "Root V1 [0..3]" },
      { id: 'B', x: 100, y: 100, val: 7, label: "[0..1]", shared: true },
      { id: 'C', x: 260, y: 100, val: 9, label: "[2..3]" },
      { id: 'D', x: 60, y: 160, val: 2, label: "[0..0]" },
      { id: 'E', x: 140, y: 160, val: 5, label: "[1..1]" },
      { id: 'F', x: 220, y: 160, val: 1, label: "[2..2]", active: true },
      { id: 'G', x: 300, y: 160, val: 8, label: "[3..3]", shared: true }
    ],
    v1Edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
      { from: 'C', to: 'F' }, { from: 'C', to: 'G' }
    ],
    v2Nodes: [
      { id: 'A_prime', x: 420, y: 40, val: "25'", label: "Root V2 (Copy)" },
      { id: 'C_prime', x: 500, y: 100, val: "18'", label: "[2..3] (Copy)", active: true }
    ],
    v2Edges: [
      { from: 'A_prime', to: 'B' },
      { from: 'A_prime', to: 'C_prime' },
      { from: 'C_prime', to: 'G' }
    ]
  },
  {
    step: 3,
    description: "Reached index 2 leaf. Copy leaf F to F' and update value to 10.",
    highlightedLine: 4,
    v1Nodes: [
      { id: 'A', x: 180, y: 40, val: 16, label: "Root V1 [0..3]" },
      { id: 'B', x: 100, y: 100, val: 7, label: "[0..1]", shared: true },
      { id: 'C', x: 260, y: 100, val: 9, label: "[2..3]" },
      { id: 'D', x: 60, y: 160, val: 2, label: "[0..0]" },
      { id: 'E', x: 140, y: 160, val: 5, label: "[1..1]" },
      { id: 'F', x: 220, y: 160, val: 1, label: "[2..2]" },
      { id: 'G', x: 300, y: 160, val: 8, label: "[3..3]", shared: true }
    ],
    v1Edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
      { from: 'C', to: 'F' }, { from: 'C', to: 'G' }
    ],
    v2Nodes: [
      { id: 'A_prime', x: 420, y: 40, val: "25'", label: "Root V2 (Copy)" },
      { id: 'C_prime', x: 500, y: 100, val: "18'", label: "[2..3] (Copy)" },
      { id: 'F_prime', x: 460, y: 160, val: 10, label: "[2..2] (New)", active: true }
    ],
    v2Edges: [
      { from: 'A_prime', to: 'B' },
      { from: 'A_prime', to: 'C_prime' },
      { from: 'C_prime', to: 'G' }
    ]
  },
  {
    step: 4,
    description: "Recompute sums on return: C' = 10 + 8 = 18, A' = 7 + 18 = 25. Version 2 is now queryable.",
    highlightedLine: 8,
    v1Nodes: [
      { id: 'A', x: 180, y: 40, val: 16, label: "Root V1" },
      { id: 'B', x: 100, y: 100, val: 7, label: "[0..1]", shared: true },
      { id: 'C', x: 260, y: 100, val: 9, label: "[2..3]" },
      { id: 'D', x: 60, y: 160, val: 2, label: "[0..0]", shared: true },
      { id: 'E', x: 140, y: 160, val: 5, label: "[1..1]", shared: true },
      { id: 'F', x: 220, y: 160, val: 1, label: "[2..2]" },
      { id: 'G', x: 300, y: 160, val: 8, label: "[3..3]", shared: true }
    ],
    v1Edges: [
      { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
      { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
      { from: 'C', to: 'F' }, { from: 'C', to: 'G' }
    ],
    v2Nodes: [
      { id: 'A_prime', x: 420, y: 40, val: 25, label: "Root V2" },
      { id: 'C_prime', x: 500, y: 100, val: 18, label: "[2..3]" },
      { id: 'F_prime', x: 460, y: 160, val: 10, label: "[2..2]" }
    ],
    v2Edges: [
      { from: 'A_prime', to: 'B' },
      { from: 'A_prime', to: 'C_prime' },
      { from: 'C_prime', to: 'F_prime' },
      { from: 'C_prime', to: 'G' }
    ]
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUIZ_QUESTIONS_POOL: QuizQuestion[] = [
  {
    question: "What is the main advantage of a Persistent Tree?",
    options: [
      "Faster sorting",
      "Preserves previous versions",
      "Uses less memory than arrays",
      "Eliminates recursion"
    ],
    answer: 1,
    explanation: "Persistent trees maintain access to historical states by preserving versions instead of overwriting updates."
  },
  {
    question: "Persistent Trees are commonly used for:",
    options: [
      "Historical queries",
      "DFS only",
      "Heap operations",
      "Sorting"
    ],
    answer: 0,
    explanation: "By preserving old roots, persistent trees allow efficient 'time-travel' or historical queries."
  },
  {
    question: "What technique is commonly used to create new versions?",
    options: [
      "Heapify",
      "Path Copying",
      "Hashing",
      "BFS"
    ],
    answer: 1,
    explanation: "Path copying duplicates only the nodes along the insertion/update path from the root down to the leaf."
  },
  {
    question: "In path copying, what gets duplicated?",
    options: [
      "Entire tree",
      "Only modified path",
      "All leaf nodes",
      "Root only"
    ],
    answer: 1,
    explanation: "Only nodes directly affected by the traversal path are duplicated; others are shared."
  },
  {
    question: "Unaffected nodes are:",
    options: [
      "Deleted",
      "Shared between versions",
      "Rebuilt",
      "Compressed"
    ],
    answer: 1,
    explanation: "To optimize space, unmodified subtrees are linked directly to the new version's nodes."
  },
  {
    question: "Persistent Trees allow access to:",
    options: [
      "Current version only",
      "Previous versions only",
      "All versions",
      "Root only"
    ],
    answer: 2,
    explanation: "Every version corresponds to a unique root pointer, so you can traverse and query any historic state."
  },
  {
    question: "Which persistent structure is most common in competitive programming?",
    options: [
      "Persistent Segment Tree",
      "Persistent Queue",
      "Persistent Heap",
      "Persistent Trie only"
    ],
    answer: 0,
    explanation: "Persistent Segment Trees are highly useful for range updates, point queries, and kth smallest queries."
  },
  {
    question: "What is stored for each version?",
    options: [
      "Leaf array",
      "Root pointer/reference",
      "Queue index",
      "Hash value"
    ],
    answer: 1,
    explanation: "Since versions share subtrees, referencing the root of a specific version is sufficient to query it."
  },
  {
    question: "Persistent Tree insertion complexity is:",
    options: [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N²)"
    ],
    answer: 1,
    explanation: "We duplicate at most depth nodes, which is O(log N) in a balanced binary tree."
  },
  {
    question: "Persistent Trees are immutable.",
    options: [
      "True",
      "False"
    ],
    answer: 0,
    explanation: "Yes, because operations create new versions instead of mutating existing nodes in-place."
  },
  {
    question: "Which version remains available after an update?",
    options: [
      "Latest only",
      "Old version only",
      "Both old and new versions",
      "Neither"
    ],
    answer: 2,
    explanation: "Both versions remain fully queryable since the old nodes are unmodified."
  },
  {
    question: "Persistent Segment Trees support:",
    options: [
      "Historical range queries",
      "Heap sorting only",
      "DFS traversal only",
      "Graph coloring"
    ],
    answer: 0,
    explanation: "They enable range sum or range minimum/maximum queries on any historical version of the array."
  },
  {
    question: "What happens when an update occurs?",
    options: [
      "Entire tree copied",
      "Path copied and new version created",
      "Root deleted",
      "Memory reset"
    ],
    answer: 1,
    explanation: "Nodes on the lookup path are duplicated, while other child branches are shared."
  },
  {
    question: "Search complexity in a balanced persistent tree is:",
    options: [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N²)"
    ],
    answer: 1,
    explanation: "Standard binary tree traversal is used, taking O(log N) time for balanced trees."
  },
  {
    question: "Which field heavily uses version preservation concepts?",
    options: [
      "Version Control Systems",
      "Bubble Sort",
      "Binary Search",
      "BFS"
    ],
    answer: 0,
    explanation: "Git and other version control systems use DAGs and path sharing concepts to store commits efficiently."
  },
  {
    question: "Persistent Trees are useful for:",
    options: [
      "Time-travel queries",
      "Matrix multiplication",
      "Queue rotation",
      "Heap construction"
    ],
    answer: 0,
    explanation: "Time-travel queries look up tree values at historical version points."
  },
  {
    question: "Memory usage grows with:",
    options: [
      "Number of versions and updates",
      "DFS depth only",
      "Root value",
      "Tree color"
    ],
    answer: 0,
    explanation: "Each update adds O(log N) nodes to memory, so total space grows with the number of updates."
  },
  {
    question: "Which node is typically shared in path copying?",
    options: [
      "Modified node",
      "Unaffected node",
      "Root only",
      "Leaf only"
    ],
    answer: 1,
    explanation: "Any subtrees that do not lie on the path of modification are linked directly to the new nodes."
  },
  {
    question: "A Persistent Tree update destroys previous versions.",
    options: [
      "True",
      "False"
    ],
    answer: 1,
    explanation: "False. Previous versions remain fully intact and readable."
  },
  {
    question: "What makes Persistent Trees efficient?",
    options: [
      "Copying entire trees",
      "Sharing unchanged nodes between versions",
      "Eliminates updates",
      "Using arrays only"
    ],
    answer: 1,
    explanation: "Reusing unchanged subtrees prevents the O(N) overhead of full tree copying."
  }
];

export function PersistentTreesPage() {
  const navigate = useNavigate();

  // Completion states
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_persistent_trees');
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
      localStorage.setItem('dsa_progress_persistent_trees', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Visualizer Tab & States
  const [activeVisTab, setActiveVisTab] = useState<'bst' | 'segtree'>('bst');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<any>(null);

  const activeSteps = activeVisTab === 'bst' ? VIS_STEPS_PATH_COPYING : VIS_STEPS_SEGMENT_TREE;
  const activeStepData = activeSteps[visStep];

  useEffect(() => {
    setVisStep(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  }, [activeVisTab]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setVisStep((prev) => {
          if (prev < activeSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, activeSteps.length]);

  const handleReset = () => {
    setVisStep(0);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    if (visStep > 0) {
      setVisStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (visStep < activeSteps.length - 1) {
      setVisStep(prev => prev + 1);
    }
  };

  // Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
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
    const shuffled = [...QUIZ_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
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
            onClick={() => navigate('/dsa/trees')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">Persistent</span> Trees
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Path Copying & Versioned Tree Reconstitution
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
          {/* Tabs */}
          <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveVisTab('bst')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'bst' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Path Copying (BST Insert 20)
            </button>
            <button
              onClick={() => setActiveVisTab('segtree')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'segtree' 
                  ? 'border-accent-secondary text-accent-secondary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Persistent Segment Tree
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

                {/* Description Box */}
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode panel */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>

                  {activeVisTab === 'bst' ? (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>insert(node, value)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>  if node == null</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>    return new Node(value)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>  newNode = copy(node)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 4 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>  if value &lt; node.value</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 5 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">6</span>
                        <span>    newNode.left = insert(node.left, value)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 5 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">7</span>
                        <span>  else newNode.right = insert(node.right, value)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 6 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">8</span>
                        <span>  return newNode</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>update(node, index, value)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>  newNode = copy(node)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>  if leaf node:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 4 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>    newNode.value = value; return newNode</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 6 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>  // update affected child in segment tree...</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 8 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">6</span>
                        <span>  newNode.sum = recalculate(newNode.left, newNode.right)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.highlightedLine === 8 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">7</span>
                        <span>  return newNode</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer Area Column */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6 select-none">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                <Database size={14} className="opacity-70" />
                <span>PERSISTENT TREE GRAPH</span>
              </div>

              {/* Rendering shared tree visual using SVG */}
              <svg className="w-full h-[240px]" viewBox="0 0 540 240">
                {/* Arrow Markers for direction */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-text-muted)" opacity="0.5" />
                  </marker>
                </defs>

                {/* Render Version 1 Structure Lines */}
                {activeStepData.v1Edges.map((edge, idx) => {
                  const fromNode = activeStepData.v1Nodes.find(n => n.id === edge.from);
                  const toNode = activeStepData.v1Nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <line
                      key={`v1-edge-${idx}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="var(--color-border-default)"
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  );
                })}

                {/* Render Version 2 Structure Lines */}
                {activeStepData.v2Edges.map((edge, idx) => {
                  // Find in v2Nodes first, then v1Nodes (for shared nodes)
                  const fromNode = activeStepData.v2Nodes.find(n => n.id === edge.from) || activeStepData.v1Nodes.find(n => n.id === edge.from);
                  const toNode = activeStepData.v2Nodes.find(n => n.id === edge.to) || activeStepData.v1Nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <line
                      key={`v2-edge-${idx}`}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="var(--color-accent-secondary)"
                      strokeWidth="2"
                      opacity="0.85"
                    />
                  );
                })}

                {/* Render Nodes for Version 1 */}
                {activeStepData.v1Nodes.map((node) => {
                  let circleColor = "fill-accent-tertiary/10 stroke-accent-tertiary";
                  let textColor = "text-accent-tertiary font-bold";
                  if (node.active) {
                    circleColor = "fill-accent-secondary/15 stroke-accent-secondary";
                    textColor = "text-accent-secondary font-bold";
                  } else if (node.shared) {
                    circleColor = "fill-accent-primary/10 stroke-accent-primary stroke-dashed animate-pulse";
                    textColor = "text-accent-primary font-bold";
                  }

                  return (
                    <g key={`v1-node-${node.id}`}>
                      <circle cx={node.x} cy={node.y} r="18" className={`${circleColor} stroke-2 transition-all duration-300`} />
                      <text x={node.x} y={node.y + 5} fill="currentColor" textAnchor="middle" className={`text-xs font-mono ${textColor} transition-all duration-300`}>
                        {node.val}
                      </text>
                      {node.label && (
                        <text x={node.x} y={node.y - 24} textAnchor="middle" className="text-[10px] font-mono fill-text-muted uppercase font-bold">
                          {node.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Render Nodes for Version 2 */}
                {activeStepData.v2Nodes.map((node) => {
                  let circleColor = "fill-accent-secondary/10 stroke-accent-secondary";
                  let textColor = "text-accent-secondary font-bold";
                  if (node.active) {
                    circleColor = "fill-accent-secondary/20 stroke-accent-secondary shadow-[0_0_10px_rgba(0,255,204,0.3)]";
                  }

                  return (
                    <g key={`v2-node-${node.id}`}>
                      <circle cx={node.x} cy={node.y} r="18" className={`${circleColor} stroke-2 transition-all duration-300`} />
                      <text x={node.x} y={node.y + 5} fill="currentColor" textAnchor="middle" className={`text-xs font-mono ${textColor} transition-all duration-300`}>
                        {node.val}
                      </text>
                      {node.label && (
                        <text x={node.x} y={node.y - 24} textAnchor="middle" className="text-[10px] font-mono fill-accent-secondary uppercase font-bold">
                          {node.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Status and Legends */}
              <div className="flex gap-6 items-center text-xs font-mono text-text-muted mt-4 border-t border-border-default/20 pt-4 w-full justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-tertiary/20 border border-accent-tertiary"></div>
                  <span>V1 Only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-secondary/20 border border-accent-secondary"></div>
                  <span>V2 Copied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-primary/10 border border-accent-primary border-dashed animate-pulse"></div>
                  <span>Shared Nodes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUIZ */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Bookmark className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Persistent Trees Quiz
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
