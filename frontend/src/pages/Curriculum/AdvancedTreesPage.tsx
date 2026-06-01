import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Award
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  line: number;
}

const VISUALIZATION_STEPS: Record<'hld' | 'linkcut' | 'euler' | 'centroid' | 'wavelet' | 'veb', VisStep[]> = {
  hld: [
    {
      step: 0,
      description: "Query path from Node 4 to Node 5. Initialize u = 4, v = 5.",
      line: 0
    },
    {
      step: 1,
      description: "Since head[5] (5) is deeper than head[4] (1), query range [5, 5] on Segment Tree.",
      line: 3
    },
    {
      step: 2,
      description: "Move v to its parent's chain head parent[head[5]] = 2. Path endpoints are now 4 and 2.",
      line: 4
    },
    {
      step: 3,
      description: "Since head[4] == head[2] == 1, query path range [pos[2], pos[4]] on Segment Tree. Complete!",
      line: 5
    }
  ],
  linkcut: [
    {
      step: 0,
      description: "Initial forest with separate trees: Tree A {1, 2} and Tree B {3, 4}. Link Node 3 to Node 1.",
      line: 0
    },
    {
      step: 1,
      description: "Access and splay Node 3 to make it the root of its representational tree.",
      line: 3
    },
    {
      step: 2,
      description: "Set parent pointer parent[3] = 1. Component trees are merged.",
      line: 4
    }
  ],
  euler: [
    {
      step: 0,
      description: "Start DFS at root Node 1. Append 1 to tour.",
      line: 1
    },
    {
      step: 1,
      description: "Traverse to left child Node 2. Append 2 to tour.",
      line: 3
    },
    {
      step: 2,
      description: "Node 2 is a leaf. Return to parent Node 1 and append 1 to tour.",
      line: 4
    },
    {
      step: 3,
      description: "Traverse to right child Node 3. Append 3 to tour.",
      line: 3
    },
    {
      step: 4,
      description: "Node 3 is a leaf. Return to root Node 1 and append 1 to tour. Complete!",
      line: 4
    }
  ],
  centroid: [
    {
      step: 0,
      description: "Calculate subtree sizes. Sizes: Node 1 (sz=6), Node 4 (sz=3), others (sz=1).",
      line: 0
    },
    {
      step: 1,
      description: "Check Node 1: max neighbor size is 3 <= N/2 (3). Node 1 is the centroid.",
      line: 1
    },
    {
      step: 2,
      description: "Remove centroid Node 1. Split tree into components {2}, {3}, and {4, 5, 6}.",
      line: 2
    },
    {
      step: 3,
      description: "Find component sub-centroids recursively (centroid of {4, 5, 6} is Node 4) and link them.",
      line: 4
    },
    {
      step: 4,
      description: "Decomposition Complete! Render the Centroid Tree showing O(log N) depth.",
      line: 5
    }
  ],
  wavelet: [
    {
      step: 0,
      description: "Represent [2, 1, 5, 4, 3] on [1..5]. Mid = 3. Bitvector: 0 if <= 3, 1 if > 3.",
      line: 3
    },
    {
      step: 1,
      description: "Divide array elements: those with bit 0 go left [2, 1, 3], those with bit 1 go right [5, 4].",
      line: 4
    },
    {
      step: 2,
      description: "Process left child [2, 1, 3] on range [1..3]. Mid = 2. Bitvector: 0 if <= 2, 1 if > 2.",
      line: 5
    },
    {
      step: 3,
      description: "Process right child [5, 4] on range [4..5]. Mid = 4. Bitvector: 0 if <= 4, 1 if > 4.",
      line: 6
    }
  ],
  veb: [
    {
      step: 0,
      description: "Query successor of 5. Since 5 < V.max (13), successor exists.",
      line: 1
    },
    {
      step: 1,
      description: "Compute cluster index c = high(5) = 1 and pos = low(5) = 1. Check cluster 1.",
      line: 4
    },
    {
      step: 2,
      description: "Check cluster 1 for keys > 1. Max in cluster 1 is 1, so no successor exists here.",
      line: 5
    },
    {
      step: 3,
      description: "Query summary tree for next non-empty cluster after c = 1, which is cluster 2.",
      line: 7
    },
    {
      step: 4,
      description: "Retrieve min of cluster 2 (which is 1). Successor key index = 2 * 4 + 1 = 9.",
      line: 8
    }
  ]
};

const QUIZ_QUESTIONS = [
  {
    question: "What is the main purpose of Heavy-Light Decomposition (HLD)?",
    options: ["Answer path queries on trees efficiently", "Sort elements in linear time", "Represent graphs as matrices", "Find shortest paths in DAGs"],
    answer: 0,
    explanation: "HLD partitions tree edges into heavy and light chains, allowing path queries to be executed in O(log^2 N) using data structures like Segment Trees."
  },
  {
    question: "In Heavy-Light Decomposition, how is a heavy edge defined?",
    options: ["The edge to the child with the maximum subtree size", "The edge with the highest weight value", "The first edge visited in DFS", "Any edge connecting to a leaf node"],
    answer: 0,
    explanation: "A heavy edge connects a node to its child that has the largest subtree size (breaking ties arbitrarily)."
  },
  {
    question: "What is the maximum number of light edges on any path from the root to a leaf in a tree of size N?",
    options: ["O(log N)", "O(sqrt N)", "O(N)", "O(1)"],
    answer: 0,
    explanation: "Since traversing a light edge reduces the subtree size by at least half, there can be at most O(log N) light edges on any root-to-leaf path."
  },
  {
    question: "Link-Cut Trees are designed to maintain which type of structures?",
    options: ["A forest of dynamic trees", "Static cyclic graphs", "Multi-dimensional grids", "Bipartite matchings"],
    answer: 0,
    explanation: "Link-Cut Trees support dynamic changes to tree structures (adding/removing edges) and path queries in O(log N) amortized time."
  },
  {
    question: "Which balanced binary search tree representation is internally used by Link-Cut Trees to represent preferred paths?",
    options: ["Splay Trees", "AVL Trees", "Red-Black Trees", "Treaps"],
    answer: 0,
    explanation: "Link-Cut Trees represent each preferred path (called an auxiliary tree) using a Splay Tree keyed by depth."
  },
  {
    question: "What is the amortized time complexity of operations (like link, cut, findRoot) in a Link-Cut Tree?",
    options: ["O(log N)", "O(N)", "O(1)", "O(sqrt N)"],
    answer: 0,
    explanation: "Using splaying operations, Link-Cut Tree queries and updates run in amortized O(log N) time."
  },
  {
    question: "What representation does an Euler Tour Tree produce for tree structures?",
    options: ["A linear sequence representation", "A matrix product structure", "An associative list of ancestors", "A heap-ordered array"],
    answer: 0,
    explanation: "An Euler Tour Tree records the entry and exit of nodes during a DFS traversal, converting tree operations into range updates on a sequence."
  },
  {
    question: "What is the primary advantage of Centroid Decomposition on a tree of size N?",
    options: ["It creates a balanced tree of depth O(log N)", "It flattens the tree into a single array", "It reduces all path weights to zero", "It finds the tree diameter in O(1) time"],
    answer: 0,
    explanation: "Centroid Decomposition recursively splits a tree at its centroid, producing a tree of centroids with height bounded by O(log N)."
  },
  {
    question: "A centroid of a tree of size N is a node whose removal splits the tree into components of size at most:",
    options: ["N / 2", "N / 3", "sqrt(N)", "log N"],
    answer: 0,
    explanation: "By definition, removing a centroid leaves no connected component with a size strictly greater than N / 2."
  },
  {
    question: "What is the time complexity of finding a centroid in a tree of size N?",
    options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
    answer: 0,
    explanation: "A simple DFS traversal can compute subtree sizes and locate the centroid in linear O(N) time."
  },
  {
    question: "Which queries are Wavelet Trees primarily used for?",
    options: ["Range quantile and rank queries", "Shortest path in weighted graphs", "Dynamic connectivity in forests", "Predecessor queries in integer universes"],
    answer: 0,
    explanation: "Wavelet Trees partition values of an array hierarchically, supporting range rank and range quantile queries in O(log |Sigma|) time."
  },
  {
    question: "What does each node in a Wavelet Tree store to route range queries?",
    options: ["A bitvector", "A priority queue", "A hash table", "A pointer list of size N"],
    answer: 0,
    explanation: "Each node stores a bitvector indicating whether elements in the active range are routed to the left child (0) or right child (1)."
  },
  {
    question: "What is the space complexity of a Wavelet Tree for an array of size N over an alphabet Sigma?",
    options: ["O(N log |Sigma|) bits", "O(N |Sigma|) words", "O(N^2) bits", "O(log N) words"],
    answer: 0,
    explanation: "A Wavelet Tree has height O(log |Sigma|), and each level contains N bits, yielding a total space complexity of O(N log |Sigma|) bits."
  },
  {
    question: "What is the time complexity of successor/predecessor queries in a Van Emde Boas (vEB) tree of universe size U?",
    options: ["O(log log U)", "O(log U)", "O(sqrt U)", "O(1)"],
    answer: 0,
    explanation: "vEB trees divide the universe recursively into sqrt(U) clusters of size sqrt(U), reducing query times to O(log log U)."
  },
  {
    question: "In a Van Emde Boas tree, how is the cluster index of an element x computed?",
    options: ["high(x) = x / sqrt(U)", "low(x) = x % U", "index(x) = x * U", "hash(x) = x mod P"],
    answer: 0,
    explanation: "The high(x) operation computes which of the sqrt(U) clusters element x belongs to, defined as floor(x / sqrt(U))."
  },
  {
    question: "What is stored in the 'summary' structure of a Van Emde Boas Tree?",
    options: ["Which clusters are non-empty", "The maximum element of each cluster", "The hash codes of all active keys", "The count of elements in the tree"],
    answer: 0,
    explanation: "The summary is a smaller vEB tree of universe size sqrt(U) that tracks which of the child clusters contain at least one element."
  },
  {
    question: "Why does a Van Emde Boas tree achieve O(1) time for checking the minimum or maximum element?",
    options: ["They are explicitly stored at each node", "They are searched using binary search", "They are updated using a lazy queue", "They are stored in a global variable"],
    answer: 0,
    explanation: "Each vEB tree node explicitly stores its minimum and maximum elements, allowing O(1) time access to these values."
  },
  {
    question: "Which tree decomposition is best suited for computing path aggregates (e.g., path sum, max) on static trees?",
    options: ["Heavy-Light Decomposition", "Link-Cut Tree", "Van Emde Boas Tree", "Suffix Tree"],
    answer: 0,
    explanation: "For static trees, HLD combined with a Segment Tree is the standard, simple, and highly efficient choice."
  },
  {
    question: "What is the relationship between the number of vertices in a tree and its centroid decomposition tree?",
    options: ["They have the exact same number of nodes", "The centroid tree has fewer nodes", "The centroid tree is a binary tree", "The centroid tree contains cycles"],
    answer: 0,
    explanation: "Centroid decomposition rearranges all N nodes of the original tree into a hierarchical tree of centroids, containing the exact same N nodes."
  },
  {
    question: "In a Link-Cut tree, which operation must be called before querying or modifying a path between u and v?",
    options: ["access(u)", "splay(u)", "findRoot(u)", "link(u, v)"],
    answer: 0,
    explanation: "The access(u) operation builds a preferred path from the root of the tree to node u, allowing subsequent splay and path operations."
  }
];

type VisTab = 'hld' | 'linkcut' | 'euler' | 'centroid' | 'wavelet' | 'veb';

export function AdvancedTreesPage() {
  const navigate = useNavigate();

  // Completed sections progress tracker
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_advanced_trees');
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
      localStorage.setItem('dsa_progress_advanced_trees', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    // Update global progress trigger
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Mark Section 1 as complete on load since visualization is viewed
  useEffect(() => {
    if (!completedSections[1]) {
      setCompletedSections(prev => {
        const updated = { ...prev, 1: true };
        localStorage.setItem('dsa_progress_advanced_trees', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Visualizer state
  const [activeVisTab, setActiveVisTab] = useState<VisTab>('hld');
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
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSteps.length]);

  const handleTabChange = (tab: VisTab) => {
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

  // Custom visualizer renderers
  const renderHLDVisual = () => {
    const nodes = [
      { id: 1, x: 200, y: 60, label: '1 (head:1)' },
      { id: 2, x: 120, y: 140, label: '2 (head:1)' },
      { id: 3, x: 280, y: 140, label: '3 (head:3)' },
      { id: 4, x: 70, y: 220, label: '4 (head:1)' },
      { id: 5, x: 170, y: 220, label: '5 (head:5)' },
    ];

    const getCircleStyle = (id: number) => {
      if (visStep === 0) {
        if (id === 4 || id === 5) return 'stroke-accent-secondary fill-accent-secondary/15 text-accent-secondary';
      } else if (visStep === 1) {
        if (id === 5) return 'stroke-accent-primary fill-accent-primary/20 text-accent-primary';
        if (id === 4) return 'stroke-accent-secondary fill-accent-secondary/15 text-accent-secondary';
      } else if (visStep === 2) {
        if (id === 4 || id === 2) return 'stroke-accent-secondary fill-accent-secondary/15 text-accent-secondary';
      } else if (visStep === 3) {
        if (id === 4 || id === 2) return 'stroke-accent-primary fill-accent-primary/20 text-accent-primary';
      }
      return 'stroke-border-default fill-bg-secondary text-text-secondary';
    };

    const getEdgeColor = (from: number, to: number) => {
      // heavy path: 1-2, 2-4
      if ((from === 1 && to === 2) || (from === 2 && to === 4)) {
        return 'stroke-accent-primary';
      }
      return 'stroke-text-muted/40';
    };

    const getEdgeStyle = (from: number, to: number) => {
      // light path: 1-3, 2-5
      if ((from === 1 && to === 3) || (from === 2 && to === 5)) {
        return '5,5';
      }
      return '0';
    };

    return (
      <svg className="w-full h-[280px]" viewBox="0 0 400 280">
        {/* Render Edges */}
        <line x1="200" y1="60" x2="120" y2="140" className={`${getEdgeColor(1, 2)}`} strokeWidth={getEdgeColor(1, 2) === 'stroke-accent-primary' ? "4" : "2"} strokeDasharray={getEdgeStyle(1, 2)} />
        <line x1="200" y1="60" x2="280" y2="140" className={`${getEdgeColor(1, 3)}`} strokeWidth="2" strokeDasharray={getEdgeStyle(1, 3)} />
        <line x1="120" y1="140" x2="70" y2="220" className={`${getEdgeColor(2, 4)}`} strokeWidth={getEdgeColor(2, 4) === 'stroke-accent-primary' ? "4" : "2"} strokeDasharray={getEdgeStyle(2, 4)} />
        <line x1="120" y1="140" x2="170" y2="220" className={`${getEdgeColor(2, 5)}`} strokeWidth="2" strokeDasharray={getEdgeStyle(2, 5)} />

        {/* Render Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle 
              cx={node.x} 
              cy={node.y} 
              r="20" 
              className={`stroke-2 transition-colors duration-300 ${getCircleStyle(node.id)}`} 
            />
            <text 
              x={node.x} 
              y={node.y + 5} 
              fill="currentColor" 
              textAnchor="middle" 
              className="text-xs font-mono font-bold"
            >
              {node.id}
            </text>
            <text 
              x={node.x} 
              y={node.y - 26} 
              textAnchor="middle" 
              className="text-[9px] font-mono fill-text-muted"
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* Legend */}
        <g transform="translate(10, 260)" className="text-[10px] font-mono fill-text-muted">
          <line x1="0" y1="0" x2="20" y2="0" className="stroke-accent-primary" strokeWidth="4" />
          <text x="25" y="4">Heavy Edges (Segment Tree Linear Chains)</text>
          <line x1="250" y1="0" x2="270" y2="0" className="stroke-text-muted/40" strokeWidth="2" strokeDasharray="3,3" />
          <text x="275" y="4">Light Edges</text>
        </g>
      </svg>
    );
  };

  const renderLinkCutVisual = () => {
    // Step 0 & 1: Forest of {1-2} and {3-4}
    // Step 2: Linked tree
    if (visStep < 2) {
      return (
        <svg className="w-full h-[280px]" viewBox="0 0 400 280">
          {/* Tree A: 1-2 */}
          <line x1="130" y1="80" x2="130" y2="160" className="stroke-text-muted/40" strokeWidth="2" />
          <g>
            <circle cx="130" cy="80" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
            <text x="130" y="85" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">1</text>
            <text x="130" y="52" textAnchor="middle" className="text-[9px] font-mono fill-text-muted">Tree A Root</text>
          </g>
          <g>
            <circle cx="130" cy="160" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
            <text x="130" y="165" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">2</text>
          </g>

          {/* Tree B: 3-4 */}
          <line x1="270" y1="80" x2="270" y2="160" className="stroke-text-muted/40" strokeWidth="2" />
          <g>
            <circle 
              cx="270" 
              cy="80" 
              r="20" 
              className={`stroke-2 transition-colors duration-300 ${visStep === 1 ? 'stroke-accent-primary fill-accent-primary/20 text-accent-primary' : 'stroke-border-default fill-bg-secondary text-text-secondary'}`} 
            />
            <text x="270" y="85" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">3</text>
            <text x="270" y="52" textAnchor="middle" className={`text-[9px] font-mono uppercase font-bold ${visStep === 1 ? 'fill-accent-primary' : 'fill-text-muted'}`}>Tree B Root</text>
          </g>
          <g>
            <circle cx="270" cy="160" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
            <text x="270" y="165" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">4</text>
          </g>
        </svg>
      );
    }

    // Step 2: Linked
    return (
      <svg className="w-full h-[280px]" viewBox="0 0 400 280">
        <line x1="200" y1="60" x2="120" y2="140" className="stroke-text-muted/40" strokeWidth="2" />
        <line x1="200" y1="60" x2="280" y2="140" className="stroke-accent-primary animate-pulse" strokeWidth="3" />
        <line x1="280" y1="140" x2="280" y2="220" className="stroke-text-muted/40" strokeWidth="2" />

        <g>
          <circle cx="200" cy="60" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
          <text x="200" y="65" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">1</text>
          <text x="200" y="32" textAnchor="middle" className="text-[9px] font-mono fill-text-muted">Tree A Root</text>
        </g>
        <g>
          <circle cx="120" cy="140" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
          <text x="120" y="145" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">2</text>
        </g>
        <g>
          <circle cx="280" cy="140" r="20" className="stroke-accent-primary fill-accent-primary/20 text-accent-primary stroke-2" />
          <text x="280" y="145" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">3</text>
          <text x="280" y="112" textAnchor="middle" className="text-[9px] font-mono fill-accent-primary font-bold">LINKED ROOT</text>
        </g>
        <g>
          <circle cx="280" cy="220" r="20" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
          <text x="280" y="225" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">4</text>
        </g>
      </svg>
    );
  };

  const renderEulerTourVisual = () => {
    const nodes = [
      { id: 1, x: 200, y: 70 },
      { id: 2, x: 120, y: 160 },
      { id: 3, x: 280, y: 160 },
    ];

    // Array values based on steps
    const tourArray = [1, 2, 1, 3, 1];

    const getCursorPos = () => {
      switch (visStep) {
        case 0: return { x: 200, y: 70 };
        case 1: return { x: 120, y: 160 };
        case 2: return { x: 200, y: 70 };
        case 3: return { x: 280, y: 160 };
        case 4: return { x: 200, y: 70 };
        default: return { x: 200, y: 70 };
      }
    };

    const cursor = getCursorPos();

    return (
      <svg className="w-full h-[280px]" viewBox="0 0 400 280">
        {/* Draw Tree */}
        <line x1="200" y1="70" x2="120" y2="160" className="stroke-text-muted/40" strokeWidth="2" />
        <line x1="200" y1="70" x2="280" y2="160" className="stroke-text-muted/40" strokeWidth="2" />

        {/* Nodes */}
        {nodes.map(n => {
          const isActive = cursor.x === n.x && cursor.y === n.y;
          return (
            <g key={n.id}>
              <circle 
                cx={n.x} 
                cy={n.y} 
                r="20" 
                className={`stroke-2 transition-colors duration-300 ${isActive ? 'stroke-accent-primary fill-accent-primary/20 text-accent-primary shadow-[0_0_10px_rgba(255,45,120,0.3)]' : 'stroke-border-default fill-bg-secondary text-text-secondary'}`} 
              />
              <text x={n.x} y={n.y + 5} fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">{n.id}</text>
            </g>
          );
        })}

        {/* Active Traversing Arrow */}
        <circle cx={cursor.x} cy={cursor.y} r="28" fill="none" className="stroke-accent-primary/60 stroke-2 stroke-dashed animate-spin" style={{ transformOrigin: `${cursor.x}px ${cursor.y}px` }} />

        {/* Euler Tour Sequence Area */}
        <g transform="translate(100, 230)">
          <text x="-80" y="15" className="text-xs font-bold font-mono fill-text-muted">TOUR ARRAY:</text>
          {tourArray.map((val, idx) => {
            const isFilled = idx <= visStep;
            return (
              <g key={idx} transform={`translate(${idx * 40}, 0)`}>
                <rect 
                  width="32" 
                  height="26" 
                  rx="6" 
                  className={`stroke-2 transition-all duration-300 ${isFilled ? 'stroke-accent-primary fill-accent-primary/10 text-accent-primary' : 'stroke-border-default fill-bg-secondary/40 text-text-muted'}`}
                />
                <text x="16" y="18" fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">{val}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const renderCentroidVisual = () => {
    if (visStep < 4) {
      // Steps 0, 1, 2, 3: Decomposing original structure
      const nodes = [
        { id: 1, x: 200, y: 50, val: '1', sz: 'sz: 6', isCentroid: visStep >= 1 },
        { id: 2, x: 80, y: 130, val: '2', sz: 'sz: 1', isCentroid: visStep >= 3 },
        { id: 3, x: 150, y: 130, val: '3', sz: 'sz: 1', isCentroid: visStep >= 3 },
        { id: 4, x: 260, y: 130, val: '4', sz: 'sz: 3', isCentroid: visStep >= 3 },
        { id: 5, x: 220, y: 210, val: '5', sz: 'sz: 1', isCentroid: false },
        { id: 6, x: 300, y: 210, val: '6', sz: 'sz: 1', isCentroid: false },
      ];

      return (
        <svg className="w-full h-[280px]" viewBox="0 0 400 280">
          {/* Edges - only if not split in Step 2 */}
          {visStep !== 2 && (
            <>
              <line x1="200" y1="50" x2="80" y2="130" className="stroke-text-muted/30" strokeWidth="2" />
              <line x1="200" y1="50" x2="150" y2="130" className="stroke-text-muted/30" strokeWidth="2" />
              <line x1="200" y1="50" x2="260" y2="130" className="stroke-text-muted/30" strokeWidth="2" />
            </>
          )}
          {/* Subtree edges (always show, unless split is deep) */}
          <line x1="260" y1="130" x2="220" y2="210" className="stroke-text-muted/30" strokeWidth="2" />
          <line x1="260" y1="130" x2="300" y2="210" className="stroke-text-muted/30" strokeWidth="2" />

          {/* Nodes */}
          {nodes.map(n => {
            let style = 'stroke-border-default fill-bg-secondary text-text-secondary';
            if (n.isCentroid) {
              style = 'stroke-accent-primary fill-accent-primary/20 text-accent-primary';
            }
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="18" className={`stroke-2 ${style}`} />
                <text x={n.x} y={n.y + 5} fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">{n.val}</text>
                {visStep === 0 && (
                  <text x={n.x} y={n.y - 22} textAnchor="middle" className="text-[8px] font-mono fill-accent-secondary font-bold">{n.sz}</text>
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    // Step 4: Decomposed Centroid Tree
    const centroidNodes = [
      { id: 1, x: 200, y: 50, val: '1', level: 'Level 0' },
      { id: 2, x: 90, y: 130, val: '2', level: 'Level 1' },
      { id: 3, x: 170, y: 130, val: '3', level: 'Level 1' },
      { id: 4, x: 270, y: 130, val: '4', level: 'Level 1' },
      { id: 5, x: 230, y: 210, val: '5', level: 'Level 2' },
      { id: 6, x: 310, y: 210, val: '6', level: 'Level 2' },
    ];

    return (
      <svg className="w-full h-[280px]" viewBox="0 0 400 280">
        {/* Draw Centroid Tree Edges */}
        <line x1="200" y1="50" x2="90" y2="130" className="stroke-accent-primary/50" strokeWidth="2.5" />
        <line x1="200" y1="50" x2="170" y2="130" className="stroke-accent-primary/50" strokeWidth="2.5" />
        <line x1="200" y1="50" x2="270" y2="130" className="stroke-accent-primary/50" strokeWidth="2.5" />
        <line x1="270" y1="130" x2="230" y2="210" className="stroke-accent-primary/30" strokeWidth="2" />
        <line x1="270" y1="130" x2="310" y2="210" className="stroke-accent-primary/30" strokeWidth="2" />

        {/* Nodes */}
        {centroidNodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="18" className="stroke-accent-primary fill-accent-primary/20 text-accent-primary stroke-2" />
            <text x={n.x} y={n.y + 5} fill="currentColor" textAnchor="middle" className="text-xs font-mono font-bold">{n.val}</text>
            <text x={n.x} y={n.y - 22} textAnchor="middle" className="text-[8px] font-mono fill-text-muted font-bold">{n.level}</text>
          </g>
        ))}
      </svg>
    );
  };

  const renderWaveletVisual = () => {
    // Array boxes rendering hierarchy
    const layout = [
      { id: 'root', x: 250, y: 48, arr: '[2, 1, 5, 4, 3]', bv: '[0, 0, 1, 1, 0]', range: 'Range [1..5]', activeSteps: [0] },
      { id: 'left', x: 135, y: 138, arr: '[2, 1, 3]', bv: '[1, 0, 1]', range: 'Range [1..3]', activeSteps: [1, 2] },
      { id: 'right', x: 365, y: 138, arr: '[5, 4]', bv: '[1, 0]', range: 'Range [4..5]', activeSteps: [1, 3] },
      { id: 'll', x: 65, y: 228, arr: '[1]', bv: '', range: '[1..1]', activeSteps: [2] },
      { id: 'lr', x: 195, y: 228, arr: '[2, 3]', bv: '', range: '[2..3]', activeSteps: [2] },
      { id: 'rl', x: 305, y: 228, arr: '[4]', bv: '', range: '[4..4]', activeSteps: [3] },
      { id: 'rr', x: 425, y: 228, arr: '[5]', bv: '', range: '[5..5]', activeSteps: [3] },
    ];

    const getBoxStyle = (nodeActiveSteps: number[]) => {
      if (nodeActiveSteps.includes(visStep)) {
        return 'stroke-accent-primary fill-accent-primary/20 text-accent-primary';
      }
      return 'stroke-border-default fill-bg-secondary/40 text-text-secondary';
    };

    return (
      <svg className="w-full h-[320px]" viewBox="0 0 500 320">
        {/* Draw Connectors */}
        <line x1="250" y1="48" x2="135" y2="138" className="stroke-text-muted/20" strokeWidth="2.5" />
        <line x1="250" y1="48" x2="365" y2="138" className="stroke-text-muted/20" strokeWidth="2.5" />
        <line x1="135" y1="138" x2="65" y2="228" className="stroke-text-muted/20" strokeWidth="2" />
        <line x1="135" y1="138" x2="195" y2="228" className="stroke-text-muted/20" strokeWidth="2" />
        <line x1="365" y1="138" x2="305" y2="228" className="stroke-text-muted/20" strokeWidth="2" />
        <line x1="365" y1="138" x2="425" y2="228" className="stroke-text-muted/20" strokeWidth="2" />

        {/* Render Blocks */}
        {layout.map(node => {
          const style = getBoxStyle(node.activeSteps);
          const hasBv = node.bv !== '';
          const boxWidth = 84;
          const boxHeight = hasBv ? 46 : 34;
          return (
            <g key={node.id} transform={`translate(${node.x - boxWidth / 2}, ${node.y - boxHeight / 2})`}>
              <rect width={boxWidth} height={boxHeight} rx="6" className={`stroke-2 ${style}`} />
              <text x={boxWidth / 2} y="14" fill="currentColor" textAnchor="middle" fontSize="11" className="font-mono font-bold">{node.arr}</text>
              {hasBv && (
                <text x={boxWidth / 2} y="26" fill="currentColor" textAnchor="middle" fontSize="9" className="font-mono font-medium opacity-85">B: {node.bv}</text>
              )}
              <text x={boxWidth / 2} y={hasBv ? "38" : "26"} textAnchor="middle" fontSize="8" className="font-mono fill-text-muted select-none">{node.range}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderVEBVisual = () => {
    // vEB universe 16 Successor 5
    // Summary array size 4 at top
    // Clusters 4 arrays size 4 at bottom
    const summary = [
      { val: '1', active: visStep === 3 },
      { val: '1', active: visStep === 1 || visStep === 3 },
      { val: '1', active: visStep === 3 || visStep === 4 },
      { val: '1', active: false },
    ];

    const clusters = [
      ['-', '-', '2', '-'], // c0
      ['-', '5', '-', '-'], // c1
      ['-', '9', '-', '-'], // c2
      ['-', '13', '-', '-'], // c3
    ];

    const getSummaryStyle = (active: boolean) => {
      return active 
        ? 'stroke-accent-primary fill-accent-primary/20 text-accent-primary font-extrabold'
        : 'stroke-border-default fill-bg-secondary text-text-muted';
    };

    const getCellStyle = (clusterIdx: number, _itemIdx: number, val: string) => {
      if (val === '-') return 'stroke-border-default/40 fill-transparent text-text-muted/30';
      
      if (visStep === 0 && val === '5') {
        return 'stroke-accent-secondary fill-accent-secondary/15 text-accent-secondary font-bold';
      }
      if (visStep === 1 && clusterIdx === 1 && val === '5') {
        return 'stroke-accent-primary fill-accent-primary/20 text-accent-primary font-bold';
      }
      if (visStep === 2 && clusterIdx === 1) {
        return 'stroke-accent-primary/30 fill-accent-primary/5 text-accent-primary';
      }
      if (visStep === 4 && clusterIdx === 2 && val === '9') {
        return 'stroke-accent-primary fill-accent-primary/20 text-accent-primary font-bold';
      }
      return 'stroke-border-default fill-bg-secondary text-text-secondary';
    };

    return (
      <svg className="w-full h-[320px]" viewBox="0 0 500 320">
        {/* Render Summary Header */}
        <text x="250" y="24" textAnchor="middle" fontSize="13" className="font-mono fill-text-muted font-bold tracking-wider">
          SUMMARY CLUSTER MAP [0..3]
        </text>
        
        {/* Summary boxes centered */}
        <g transform="translate(183, 38)">
          {summary.map((cell, idx) => (
            <g key={idx} transform={`translate(${idx * 36}, 0)`}>
              <rect width="28" height="24" rx="4" className={`stroke-2 ${getSummaryStyle(cell.active)}`} />
              <text x="14" y="17" fill="currentColor" textAnchor="middle" fontSize="14" className="font-mono font-bold">{cell.val}</text>
              <text x="14" y="38" textAnchor="middle" fontSize="10" className="font-mono fill-text-muted font-bold">c{idx}</text>
            </g>
          ))}
        </g>

        {/* Render Clusters Header - Pushed down to avoid overlap */}
        <text x="250" y="125" textAnchor="middle" fontSize="13" className="font-mono fill-text-muted font-bold tracking-wider">
          CLUSTERS (Universe Size 16)
        </text>
        
        {/* Clusters centered */}
        {clusters.map((cluster, cIdx) => (
          <g key={cIdx} transform={`translate(${cIdx * 105 + 50}, 175)`}>
            <text x="38" y="-12" textAnchor="middle" fontSize="11" className="font-mono fill-text-muted font-bold">
              Cluster {cIdx} [{cIdx * 4}..{cIdx * 4 + 3}]
            </text>
            <rect width="76" height="28" rx="4" fill="none" className="stroke-border-default/20" />
            {cluster.map((val, idx) => (
              <g key={idx} transform={`translate(${idx * 19}, 0)`}>
                <rect width="19" height="28" rx="2" className={`stroke-2 ${getCellStyle(cIdx, idx, val)}`} />
                <text x="9.5" y="18" fill="currentColor" textAnchor="middle" fontSize="12" className="font-mono font-bold">{val}</text>
              </g>
            ))}
          </g>
        ))}

        {/* Connection pointers adjusted to new coordinates */}
        {visStep === 1 && (
          <path d="M 233 62 L 202 155" className="stroke-accent-primary stroke-2 fill-none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
        )}
        {visStep === 3 && (
          <path d="M 269 62 L 298 155" className="stroke-accent-primary stroke-2 fill-none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
        )}
        {visStep === 4 && (
          <>
            <path d="M 269 62 L 298 155" className="stroke-accent-primary stroke-2 fill-none" strokeDasharray="3,3" />
            <path d="M 298 125 L 298 160" className="stroke-accent-primary stroke-2 fill-none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
          </>
        )}
      </svg>
    );
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
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-primary hover:text-accent-primary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-accent-primary drop-shadow-[0_0_2px_rgba(255,45,120,0.3)]">Advanced Trees</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Specialized structures, path decompositions, and static-dynamic trees
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Database className="text-accent-primary opacity-70" size={24} />
            <h2 className="text-2xl font-bold font-display text-text-primary">
              1. Interactive Visualization
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Operations switch tabs */}
          <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
            <button
              onClick={() => handleTabChange('hld')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'hld' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Heavy-Light Decomposition
            </button>
            <button
              onClick={() => handleTabChange('linkcut')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'linkcut' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Link-Cut Trees
            </button>
            <button
              onClick={() => handleTabChange('euler')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'euler' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Euler Tour Trees
            </button>
            <button
              onClick={() => handleTabChange('centroid')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'centroid' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Centroid Decomposition
            </button>
            <button
              onClick={() => handleTabChange('wavelet')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'wavelet' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Wavelet Trees
            </button>
            <button
              onClick={() => handleTabChange('veb')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'veb' 
                  ? 'border-accent-primary text-accent-primary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Van Emde Boas Trees
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
                  <AlertCircle className="text-accent-primary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode panel */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>

                  {activeVisTab === 'hld' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>query(u, v):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;while head[u] != head[v]:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;if depth[head[u]] &lt; depth[head[v]]: swap(u, v)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;query_segment_tree(pos[head[u]], pos[u]); u = parent[head[u]]</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>&nbsp;&nbsp;query_segment_tree(min(pos[u], pos[v]), max(pos[u], pos[v]))</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'linkcut' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>link(u, v):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;makeRoot(u) // accesses and splays node u</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;u.parent = v // joins to representational forest</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'euler' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>euler_tour(u):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;tour.append(u)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;for each child v of u:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;euler_tour(v); tour.append(u)</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'centroid' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>decompose(tree):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;c = get_centroid(tree)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;remove c from tree</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;for each component:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;add_edge(c, decompose(component))</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'wavelet' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>wavelet_tree(L, R, arr):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;mid = (L + R) / 2</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;bitvector = [x &gt; mid for x in arr]</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;wavelet_tree(L, mid, left_half); wavelet_tree(mid+1, R, right_half)</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'veb' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>successor(V, x):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right font-mono">2</span>
                        <span>&nbsp;&nbsp;c = high(x); p = low(x)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;if p &lt; V.cluster[c].max:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 7 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;return index(c, successor(V.cluster[c], p))</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 8 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>&nbsp;&nbsp;succ_c = successor(V.summary, c); return index(succ_c, V.cluster[succ_c].min)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer Area Column */}
            <div className="flex flex-col justify-center items-center min-h-[380px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>{activeVisTab.toUpperCase()} VISUALIZATION</span>
              </div>

              {/* SVG Canvas */}
              <div className="w-full flex items-center justify-center mt-4">
                {activeVisTab === 'hld' && renderHLDVisual()}
                {activeVisTab === 'linkcut' && renderLinkCutVisual()}
                {activeVisTab === 'euler' && renderEulerTourVisual()}
                {activeVisTab === 'centroid' && renderCentroidVisual()}
                {activeVisTab === 'wavelet' && renderWaveletVisual()}
                {activeVisTab === 'veb' && renderVEBVisual()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Advanced Trees Quiz
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
                      className="w-full py-4 bg-accent-primary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,45,120,0.25)] hover:shadow-[0_0_25px_rgba(255,45,120,0.45)] cursor-pointer"
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
      
      {/* Markers definition for SVGs */}
      <svg className="absolute w-0 h-0">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent-primary" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
