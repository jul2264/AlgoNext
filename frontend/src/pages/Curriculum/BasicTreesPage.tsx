import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  SkipForward, 
  Play, 
  Pause, 
  AlertCircle, 
  Award, 
  CheckCircle2, 
  XCircle,
  Network,
  Layers
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface TreeNode {
  id: string;
  label: string;
  cx: number;
  cy: number;
  isRoot?: boolean;
  isLeaf?: boolean;
  highlighted?: boolean;
  isTraversed?: boolean;
  traverseOrder?: number;
}

interface TreeEdge {
  from: string;
  to: string;
  highlighted?: boolean;
  hasArrow?: boolean;
}

interface VisStep {
  title: string;
  description: string;
  conceptInfo: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  showOrder?: boolean;
  isRecursiveFlowchart?: boolean;
  line?: number;
}

const bstNodesBase = [
  { id: '50', label: '50', cx: 150, cy: 45, isRoot: true },
  { id: '30', label: '30', cx: 95, cy: 105 },
  { id: '70', label: '70', cx: 205, cy: 105 },
  { id: '20', label: '20', cx: 60, cy: 165 },
  { id: '40', label: '40', cx: 120, cy: 165 },
  { id: '60', label: '60', cx: 180, cy: 165 },
  { id: '80', label: '80', cx: 240, cy: 165 }
];

const bstEdgesBase = [
  { from: '50', to: '30' },
  { from: '50', to: '70' },
  { from: '30', to: '20' },
  { from: '30', to: '40' },
  { from: '70', to: '60' },
  { from: '70', to: '80' }
];

const getBstNodes = (highlightedIds: string[], include65 = false) => {
  const base = include65 
    ? [...bstNodesBase, { id: '65', label: '65', cx: 205, cy: 220, isLeaf: true }]
    : bstNodesBase;
  return base.map(node => ({
    ...node,
    highlighted: highlightedIds.includes(node.id)
  }));
};

const getBstEdges = (highlightedFromTo: [string, string][], include65 = false) => {
  const base = include65
    ? [...bstEdgesBase, { from: '60', to: '65' }]
    : bstEdgesBase;
  return base.map(edge => ({
    ...edge,
    highlighted: highlightedFromTo.some(([from, to]) => edge.from === from && edge.to === to),
    hasArrow: highlightedFromTo.some(([from, to]) => edge.from === from && edge.to === to)
  }));
};

const getTraversalNodes = (orderMap: Record<string, number>) =>
  bstNodesBase.map(node => ({
    ...node,
    isTraversed: true,
    traverseOrder: orderMap[node.id]
  }));

const VISUALIZATION_STEPS: Record<string, VisStep[]> = {
  anatomy: [
    {
      title: 'Root Node',
      description: 'Every tree begins from the root. It is the starting point of the structure and has no parent.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 70, isRoot: true, highlighted: true }
      ],
      edges: [],
      line: 1
    },
    {
      title: 'Parent & Child',
      description: 'Nodes are connected by edges. Parent nodes point to their children. Here, 10 is the parent of 20 and 30.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 90, cy: 120 },
        { id: '30', label: '30', cx: 210, cy: 120 }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true, hasArrow: true },
        { from: '10', to: '30', highlighted: true, hasArrow: true }
      ],
      line: 2
    },
    {
      title: 'Leaf Node',
      description: 'Leaf nodes are nodes at the very bottom of the tree that have no children. Here, 40, 50, and 30 are leaves.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true },
        { id: '20', label: '20', cx: 90, cy: 110 },
        { id: '30', label: '30', cx: 210, cy: 110, isLeaf: true, highlighted: true },
        { id: '40', label: '40', cx: 50, cy: 170, isLeaf: true, highlighted: true },
        { id: '50', label: '50', cx: 130, cy: 170, isLeaf: true, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20' },
        { from: '10', to: '30' },
        { from: '20', to: '40' },
        { from: '20', to: '50' }
      ],
      line: 3
    }
  ],
  bstSearch: [
    {
      title: 'BST Search - Check Node 50',
      description: 'Compare target 60 with root node 50. Since target is not found yet, proceed to comparisons.',
      conceptInfo: '',
      nodes: getBstNodes(['50']),
      edges: getBstEdges([]),
      line: 1
    },
    {
      title: 'BST Search - Comparison',
      description: 'Check if target 60 is less than node 50. It is not.',
      conceptInfo: '',
      nodes: getBstNodes(['50']),
      edges: getBstEdges([]),
      line: 2
    },
    {
      title: 'BST Search - Traverse Right',
      description: 'Since search target 60 > 50, recursively traverse to the right subtree (node 70).',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 5
    },
    {
      title: 'BST Search - Check Node 70',
      description: 'Compare target 60 with current node 70. They do not match.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 1
    },
    {
      title: 'BST Search - Comparison',
      description: 'Check if target 60 is less than node 70. Yes, it is.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 2
    },
    {
      title: 'BST Search - Traverse Left',
      description: 'Since search target 60 < 70, recursively traverse to the left subtree (node 60).',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 3
    },
    {
      title: 'BST Search - Target Found',
      description: 'Compare target 60 with current node 60. Values match! Target 60 has been found.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 1
    }
  ],
  bstInsertion: [
    {
      title: 'BST Insertion - Check Node 50',
      description: 'Check if current node is empty. Since it contains 50, proceed to BST search rules.',
      conceptInfo: '',
      nodes: getBstNodes(['50']),
      edges: getBstEdges([]),
      line: 1
    },
    {
      title: 'BST Insertion - Comparison',
      description: 'Check if insertion value 65 is less than 50. It is not.',
      conceptInfo: '',
      nodes: getBstNodes(['50']),
      edges: getBstEdges([]),
      line: 2
    },
    {
      title: 'BST Insertion - Traverse Right',
      description: 'Since insertion value 65 > 50, traverse to the right subtree (node 70).',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 5
    },
    {
      title: 'BST Insertion - Check Node 70',
      description: 'Check if current node 70 is empty. Since it contains 70, proceed.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 1
    },
    {
      title: 'BST Insertion - Comparison',
      description: 'Check if insertion value 65 is less than 70. Yes, it is.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70']),
      edges: getBstEdges([['50', '70']]),
      line: 2
    },
    {
      title: 'BST Insertion - Traverse Left',
      description: 'Since insertion value 65 < 70, traverse to the left subtree (node 60).',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 3
    },
    {
      title: 'BST Insertion - Check Node 60',
      description: 'Check if current node 60 is empty. Since it contains 60, proceed.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 1
    },
    {
      title: 'BST Insertion - Comparison',
      description: 'Check if insertion value 65 is less than 60. It is not.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 2
    },
    {
      title: 'BST Insertion - Traverse Right',
      description: 'Since insertion value 65 > 60, traverse to the right child of 60 (which is empty).',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60']),
      edges: getBstEdges([['50', '70'], ['70', '60']]),
      line: 5
    },
    {
      title: 'BST Insertion - Insert Node',
      description: 'The right child of 60 is empty. Insert value 65 as the new leaf node here.',
      conceptInfo: '',
      nodes: getBstNodes(['50', '70', '60', '65'], true),
      edges: getBstEdges([['50', '70'], ['70', '60'], ['60', '65']], true),
      line: 1
    }
  ],
  traversals: [
    {
      title: 'Inorder Traversal',
      description: 'Inorder traversal recursively visits the left subtree, then the root node, and then the right subtree. It yields sorted keys in a BST.',
      conceptInfo: '',
      nodes: getTraversalNodes({ '20': 1, '30': 2, '40': 3, '50': 4, '60': 5, '70': 6, '80': 7 }),
      edges: bstEdgesBase,
      showOrder: true,
      line: 0
    },
    {
      title: 'Preorder Traversal',
      description: 'Preorder traversal visits the root node first, then recursively traverses the left and right subtrees.',
      conceptInfo: '',
      nodes: getTraversalNodes({ '50': 1, '30': 2, '20': 3, '40': 4, '70': 5, '60': 6, '80': 7 }),
      edges: bstEdgesBase,
      showOrder: true,
      line: 1
    },
    {
      title: 'Postorder Traversal',
      description: 'Postorder traversal recursively traverses the left and right subtrees first, and visits the root node last.',
      conceptInfo: '',
      nodes: getTraversalNodes({ '20': 1, '40': 2, '30': 3, '60': 4, '80': 5, '70': 6, '50': 7 }),
      edges: bstEdgesBase,
      showOrder: true,
      line: 2
    },
    {
      title: 'Level Order Traversal',
      description: 'Level order traversal (BFS) visits nodes level by level from top to bottom, using a Queue.',
      conceptInfo: '',
      nodes: getTraversalNodes({ '50': 1, '30': 2, '70': 3, '20': 4, '40': 5, '60': 6, '80': 7 }),
      edges: bstEdgesBase,
      showOrder: true,
      line: 3
    }
  ],
  heightFlow: [
    {
      title: 'Tree Height - Call height(10)',
      description: 'Calculate the height of the root node 10. We recursively calculate the heights of its subtrees.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true }
      ],
      edges: [],
      line: 0
    },
    {
      title: 'Tree Height - Call height(20)',
      description: 'Traverse left to the child node 20. Call height(20) to find the left subtree\'s height.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 110, cy: 110, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true }
      ],
      line: 2
    },
    {
      title: 'Tree Height - Call height(30)',
      description: 'Traverse left to the leaf node 30. Call height(30) to compute the height of the deepest branch.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 110, cy: 110, highlighted: true },
        { id: '30', label: '30', cx: 70, cy: 170, isLeaf: true, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true },
        { from: '20', to: '30', highlighted: true }
      ],
      line: 2
    },
    {
      title: 'Tree Height - height(30) Returns 1',
      description: 'Leaf node 30 has no children. Left height = 0, right height = 0. It returns max(0, 0) + 1 = 1.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 110, cy: 110, highlighted: true },
        { id: '30', label: '30', cx: 70, cy: 170, isLeaf: true, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true },
        { from: '20', to: '30', highlighted: true }
      ],
      line: 4
    },
    {
      title: 'Tree Height - height(20) Returns 2',
      description: 'Node 20 has left subtree height = 1 and right subtree height = 0. It returns max(1, 0) + 1 = 2.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 110, cy: 110, highlighted: true },
        { id: '30', label: '30', cx: 70, cy: 170, isLeaf: true, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true },
        { from: '20', to: '30', highlighted: true }
      ],
      line: 4
    },
    {
      title: 'Tree Height - height(10) Returns 3',
      description: 'Root node 10 has left height = 2 and right height = 0. It returns max(2, 0) + 1 = 3. The tree height is 3.',
      conceptInfo: '',
      nodes: [
        { id: '10', label: '10', cx: 150, cy: 50, isRoot: true, highlighted: true },
        { id: '20', label: '20', cx: 110, cy: 110, highlighted: true },
        { id: '30', label: '30', cx: 70, cy: 170, isLeaf: true, highlighted: true }
      ],
      edges: [
        { from: '10', to: '20', highlighted: true },
        { from: '20', to: '30', highlighted: true }
      ],
      line: 4
    }
  ]
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const quizQuestionsPool: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the top-most node in a tree called?",
    options: ["Leaf", "Edge", "Root", "Child"],
    answer: "Root",
    explanation: "The root of a tree is the unique top-most starting node. It has no parents."
  },
  {
    id: 2,
    question: "Which node has no children?",
    options: ["Parent Node", "Root Node", "Leaf Node", "Internal Node"],
    answer: "Leaf Node",
    explanation: "Leaf nodes are the terminal nodes of a tree structure, meaning they have an out-degree of 0 (no children)."
  },
  {
    id: 3,
    question: "A Binary Tree allows a maximum of:",
    options: ["1 child", "2 children", "3 children", "Unlimited children"],
    answer: "2 children",
    explanation: "By definition, each node in a Binary Tree can have at most 2 children: a left child and a right child."
  },
  {
    id: 4,
    question: "BST rule is:",
    options: ["Left > Root > Right", "Left < Root < Right", "Root < Left < Right", "Right < Left < Root"],
    answer: "Left < Root < Right",
    explanation: "For any node in a Binary Search Tree (BST), the left child's value must be strictly smaller than the parent node, and the right child's value must be strictly larger."
  },
  {
    id: 5,
    question: "Average BST search complexity is:",
    options: ["O(N²)", "O(N)", "O(log N)", "O(1)"],
    answer: "O(log N)",
    explanation: "On average, a search in a BST splits the search space in half at each step, resulting in a time complexity of O(log N)."
  },
  {
    id: 6,
    question: "Which traversal follows Left → Root → Right?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    answer: "Inorder",
    explanation: "Inorder traversal visits the left subtree, then the current root node, and then the right subtree."
  },
  {
    id: 7,
    question: "Which traversal visits Root first?",
    options: ["Inorder", "Preorder", "Postorder", "BFS"],
    answer: "Preorder",
    explanation: "Preorder traversal visits the current node (root) first, before traversing its left and right subtrees."
  },
  {
    id: 8,
    question: "Which traversal uses a queue?",
    options: ["DFS", "Inorder", "Level Order", "Postorder"],
    answer: "Level Order",
    explanation: "Level order traversal visits nodes level-by-level (BFS) using a Queue data structure (FIFO) to track siblings."
  },
  {
    id: 9,
    question: "Trees are heavily based on:",
    options: ["Iteration only", "Dynamic arrays", "Recursion", "Hashing"],
    answer: "Recursion",
    explanation: "Trees are recursive data structures (subtrees are trees themselves), making recursive traversal methods highly intuitive and common."
  },
  {
    id: 10,
    question: "Which node connects parent and child?",
    options: ["Pointer", "Edge", "Height", "Heap"],
    answer: "Edge",
    explanation: "In graph theory and tree structures, an edge is the connection line or pointer between two adjacent nodes (e.g., parent to child)."
  },
  {
    id: 11,
    question: "What is the height of a tree?",
    options: ["Total nodes", "Longest root-to-leaf path", "Total edges only", "Leaf count"],
    answer: "Longest root-to-leaf path",
    explanation: "The height of a tree is defined as the maximum path length (number of levels or nodes/edges) from the root down to the deepest leaf node."
  },
  {
    id: 12,
    question: "Which tree type is optimized for searching?",
    options: ["Heap", "Trie", "Binary Search Tree", "Graph"],
    answer: "Binary Search Tree",
    explanation: "A Binary Search Tree is specifically structured so that search lookups can bypass entire subtrees, yielding optimized search times."
  },
  {
    id: 13,
    question: "Worst-case BST search becomes:",
    options: ["O(log N)", "O(1)", "O(N)", "O(N²)"],
    answer: "O(N)",
    explanation: "In a fully skewed BST (which behaves like a linked list), searching behaves like a linear scan, requiring O(N) comparisons."
  },
  {
    id: 14,
    question: "Which traversal visits children before root?",
    options: ["Postorder", "Preorder", "Inorder", "BFS"],
    answer: "Postorder",
    explanation: "Postorder traversal visits the left subtree and right subtree completely before returning to visit the root node."
  },
  {
    id: 15,
    question: "Which application uses trees heavily?",
    options: ["File Systems", "Queue Scheduling", "Linear Search", "Stack Overflow"],
    answer: "File Systems",
    explanation: "File systems organize directories and subdirectories hierarchically, which is naturally modeled as a tree structure."
  },
  {
    id: 16,
    question: "Which structure powers autocomplete systems?",
    options: ["Stack", "Trie", "Queue", "Heap"],
    answer: "Trie",
    explanation: "A Trie (prefix tree) is a specialized search tree used to store associative keys, making it highly efficient for prefix-based autocomplete searches."
  },
  {
    id: 17,
    question: "Which tree is self-balancing?",
    options: ["Heap", "AVL Tree", "Trie", "Graph"],
    answer: "AVL Tree",
    explanation: "An AVL tree is a self-balancing binary search tree that maintains height balances to ensure O(log N) operations in all cases."
  },
  {
    id: 18,
    question: "Which traversal produces sorted output in BST?",
    options: ["Preorder", "Postorder", "Inorder", "BFS"],
    answer: "Inorder",
    explanation: "An inorder traversal (Left → Root → Right) visits BST elements in strictly increasing order."
  },
  {
    id: 19,
    question: "Which tree structure is used in databases?",
    options: ["Stack Tree", "Linked Tree", "B/B+ Trees", "Circular Tree"],
    answer: "B/B+ Trees",
    explanation: "B-Trees and B+ Trees are multi-way search trees optimized for reading and writing large blocks of data, making them perfect for file systems and database indices."
  },
  {
    id: 20,
    question: "Why are trees efficient?",
    options: ["Sequential traversal only", "Hierarchical organization and fast searching", "Contiguous memory storage", "Constant-time sorting"],
    answer: "Hierarchical organization and fast searching",
    explanation: "Trees provide a structured, hierarchical layout that enables operations (like search, insertion, deletion) to run in logarithmic O(log N) time."
  }
];

export function BasicTreesPage() {
  const navigate = useNavigate();
  const [activeVisTab, setActiveVisTab] = useState<'anatomy' | 'bstSearch' | 'bstInsertion' | 'traversals' | 'heightFlow'>('anatomy');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef<any>(null);

  // Section completion state
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_basic_trees');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load basic trees progress:', e);
    }
    return { 1: false, 2: false };
  });

  useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Quiz state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    // Select 5 random questions from pool
    const shuffled = [...quizQuestionsPool].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  // Sync section completions to localStorage
  const completeSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: true };
      localStorage.setItem('dsa_progress_basic_trees', JSON.stringify(updated));
      return updated;
    });
  };

  const activeSteps = VISUALIZATION_STEPS[activeVisTab];
  const activeStepData = activeSteps[visStep];

  const handleTabChange = (tab: 'anatomy' | 'bstSearch' | 'bstInsertion' | 'traversals' | 'heightFlow') => {
    setActiveVisTab(tab);
    setVisStep(0);
    setIsPlaying(false);
  };

  // Visualizer controls
  const handleReset = () => {
    setVisStep(0);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setVisStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (visStep === activeSteps.length - 1) {
      setIsPlaying(false);
      completeSection(1); // Mark visualizer section completed
      return;
    }
    setVisStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setVisStep((prev) => {
          if (prev === activeSteps.length - 1) {
            setIsPlaying(false);
            completeSection(1);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }

    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, activeSteps]);

  // Quiz Handlers
  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    const currentQ = activeQuestions[currentQuizQuestion];
    const isCorrect = currentQ.options[selectedOption] === currentQ.answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuizQuestion === activeQuestions.length - 1) {
      setShowQuizResult(true);
      completeSection(2); // Mark quiz section completed
    } else {
      setCurrentQuizQuestion((prev) => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...quizQuestionsPool].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
    setCurrentQuizQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizScore(0);
    setShowQuizResult(false);
  };

  return (
    <div 
      className="w-full mx-auto pt-16 pb-10 min-h-[calc(100vh-4rem)] flex flex-col gap-4"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dsa/trees')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
              Basic Trees
            </h1>
            <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
              1. Interactive Visualization
            </p>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* SECTION 1: VISUALIZER */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center gap-2">
              <Layers className="text-accent-secondary opacity-70" size={24} />
              <h2 className="text-2xl font-bold font-display text-text-primary">
                1. Interactive Visualization
              </h2>
            </div>
          </div>

          <div className="neon-card neon-card-cyan flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '2.5rem', paddingRight: '1.5rem' }}>
            {/* Operations switch tabs */}
            <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
              <button
                onClick={() => handleTabChange('anatomy')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'anatomy' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Tree Anatomy
              </button>
              <button
                onClick={() => handleTabChange('bstSearch')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'bstSearch' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                BST Search
              </button>
              <button
                onClick={() => handleTabChange('bstInsertion')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'bstInsertion' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                BST Insertion
              </button>
              <button
                onClick={() => handleTabChange('traversals')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'traversals' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Tree Traversals
              </button>
              <button
                onClick={() => handleTabChange('heightFlow')}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                  activeVisTab === 'heightFlow' 
                    ? 'border-accent-secondary text-accent-secondary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                Height & Flow
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls panel */}
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

                {/* Description Card - styled exactly like queues page */}
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
                  <AlertCircle className="text-accent-secondary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode Box */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>
                  
                  {activeVisTab === 'anatomy' && (
                    <div className="space-y-1 text-sm font-mono select-none whitespace-pre">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span className="whitespace-pre">class TreeNode:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span className="whitespace-pre">  root = Node(10)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span className="whitespace-pre">  root.left = 20; root.right = 30</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span className="whitespace-pre">  leaf_nodes = [40, 50, 30]</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'bstSearch' && (
                    <div className="space-y-1 text-sm font-mono select-none whitespace-pre">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span className="whitespace-pre">search(node, target):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span className="whitespace-pre">  if node == null or node.val == target: return node</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span className="whitespace-pre">  if target &lt; node.val:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span className="whitespace-pre">    return search(node.left, target)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span className="whitespace-pre">  else:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">6</span>
                        <span className="whitespace-pre">    return search(node.right, target)</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'bstInsertion' && (
                    <div className="space-y-1 text-sm font-mono select-none whitespace-pre">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span className="whitespace-pre">insert(node, val):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span className="whitespace-pre">  if node == null: return Node(val)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span className="whitespace-pre">  if val &lt; node.val:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span className="whitespace-pre">    node.left = insert(node.left, val)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span className="whitespace-pre">  else:</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">6</span>
                        <span className="whitespace-pre">    node.right = insert(node.right, val)</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'traversals' && (
                    <div className="space-y-1 text-sm font-mono select-none whitespace-pre">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-success font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span className="whitespace-pre">inorder(node): left &rarr; root &rarr; right</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-success font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span className="whitespace-pre">preorder(node): root &rarr; left &rarr; right</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-success font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span className="whitespace-pre">postorder(node): left &rarr; right &rarr; root</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-success font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span className="whitespace-pre">levelorder(root): BFS using queue</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'heightFlow' && (
                    <div className="space-y-1 text-sm font-mono select-none whitespace-pre">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 0 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span className="whitespace-pre">height(node):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span className="whitespace-pre">  if node == null: return 0</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span className="whitespace-pre">  left_h = height(node.left)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span className="whitespace-pre">  right_h = height(node.right)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-secondary/10 border-l-2 border-accent-secondary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span className="whitespace-pre">  return max(left_h, right_h) + 1</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer Area Column */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Network size={14} className="opacity-70 text-accent-secondary" />
                <span>TREE STACK BUFFER</span>
              </div>

              {activeStepData.isRecursiveFlowchart ? (
                /* Flowchart Visualization */
                <div className="flex flex-col items-center justify-center p-4 bg-bg-secondary rounded-xl border border-border-default/50 max-w-[21rem] mx-auto w-full gap-2 font-mono text-sm select-none">
                  <div className="p-3 bg-accent-secondary/15 border border-accent-secondary text-accent-secondary rounded-lg text-center font-bold w-full shadow-[0_0_12px_rgba(0,255,204,0.15)]">
                    Visit Current Node
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className="p-3 bg-bg-primary border border-border-default/40 text-text-secondary rounded-lg text-center w-full">
                    Traverse Left Subtree
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className="p-3 bg-bg-primary border border-border-default/40 text-text-secondary rounded-lg text-center w-full">
                    Traverse Right Subtree
                  </div>
                  <div className="text-[10px] text-text-muted/75 mt-2 text-center uppercase tracking-wide">
                    Uses Recursion Stack
                  </div>
                </div>
              ) : (
                /* SVG Tree Visualization */
                <svg className="w-full h-full max-h-[250px] max-w-sm mt-4 select-none" viewBox="0 0 300 240">
                  <style>{`
                    @keyframes nodePop {
                      0% {
                        transform: scale(0);
                        opacity: 0;
                      }
                      100% {
                        transform: scale(1);
                        opacity: 1;
                      }
                    }
                    @keyframes edgeDraw {
                      0% {
                        stroke-dashoffset: 100;
                      }
                      100% {
                        stroke-dashoffset: 0;
                      }
                    }
                    .node-animate {
                      animation: nodePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                    }
                    .edge-animate {
                      stroke-dasharray: 100;
                      stroke-dashoffset: 100;
                      animation: edgeDraw 0.5s ease-in-out forwards;
                    }
                  `}</style>

                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="20"
                      refY="5"
                      markerWidth="2.5"
                      markerHeight="2.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2.5 L 10 5 L 0 7.5 z" fill="var(--color-border-default)" className="opacity-40" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="20"
                      refY="5"
                      markerWidth="2.5"
                      markerHeight="2.5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2.5 L 10 5 L 0 7.5 z" fill="var(--color-accent-secondary)" />
                    </marker>
                  </defs>

                  {/* Draw Edges */}
                  {activeStepData.edges.map((edge) => {
                    const fromNode = activeStepData.nodes.find(n => n.id === edge.from);
                    const toNode = activeStepData.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <line
                        key={`edge-${activeVisTab}-${edge.from}-${edge.to}`}
                        x1={fromNode.cx}
                        y1={fromNode.cy}
                        x2={toNode.cx}
                        y2={toNode.cy}
                        stroke={edge.highlighted ? "var(--color-accent-secondary)" : "var(--color-border-default)"}
                        strokeWidth={edge.highlighted ? 3 : 2}
                        className={`edge-animate transition-all duration-300 ${edge.highlighted ? '' : 'opacity-40'}`}
                        style={{ animationDelay: '0.1s' }}
                        markerEnd={edge.hasArrow ? (edge.highlighted ? "url(#arrow-active)" : "url(#arrow)") : undefined}
                      />
                    );
                  })}

                  {/* Draw Nodes */}
                  {activeStepData.nodes.map((node) => (
                    <g 
                      key={`node-${activeVisTab}-${node.id}`} 
                      className="node-animate transition-all duration-300"
                      style={{ 
                        transformOrigin: `${node.cx}px ${node.cy}px`,
                        animationDelay: node.isRoot ? '0s' : '0.25s'
                      }}
                    >
                      {/* Node Circle */}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={16}
                        fill="var(--color-bg-secondary)"
                        stroke={
                          node.highlighted 
                            ? "var(--color-accent-secondary)" 
                            : node.isRoot 
                            ? "var(--color-border-default)" 
                            : "var(--color-border-default)"
                        }
                        strokeWidth={node.highlighted ? 3 : 1.5}
                        className={`transition-all duration-300 ${
                          node.highlighted 
                            ? 'shadow-[0_0_12px_rgba(0,255,204,0.3)] filter drop-shadow-[0_0_6px_rgba(0,255,204,0.15)]' 
                            : 'opacity-90'
                        }`}
                      />
                      {/* Node Text Label */}
                      <text
                        x={node.cx}
                        y={node.cy + 4}
                        textAnchor="middle"
                        className={`font-mono text-[11px] font-bold select-none transition-all duration-300 fill-text-primary ${
                          node.highlighted ? 'fill-accent-secondary font-extrabold' : ''
                        }`}
                      >
                        {node.label}
                      </text>

                      {/* Optional Traversal Order Tag */}
                      {activeStepData.showOrder && node.isTraversed && node.traverseOrder && (
                        <g>
                          <circle
                            cx={node.cx + 12}
                            cy={node.cy - 12}
                            r={7.5}
                            className="fill-accent-secondary stroke-bg-primary stroke-1"
                          />
                          <text
                            x={node.cx + 12}
                            y={node.cy - 9.5}
                            textAnchor="middle"
                            className="font-mono text-[8px] font-extrabold fill-bg-primary select-none"
                          >
                            {node.traverseOrder}
                          </text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>
              )}

              {activeVisTab === 'traversals' && (
                <div 
                  className="w-full max-w-sm bg-bg-secondary rounded-xl border border-border-default/50 flex flex-col gap-1 select-none animate-fadeIn"
                  style={{ marginTop: '-1.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}
                >
                  <div className="text-[10px] text-text-muted/75 font-mono font-bold uppercase tracking-wider">
                    Traversal Sequence Output
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-lg font-bold text-success">
                    {[...activeStepData.nodes]
                      .filter(n => n.traverseOrder !== undefined)
                      .sort((a, b) => (a.traverseOrder || 0) - (b.traverseOrder || 0))
                      .map((node, index) => (
                        <Fragment key={node.id}>
                          {index > 0 && <span className="text-text-muted/65">&rarr;</span>}
                          <span>{node.label}</span>
                        </Fragment>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

        {/* SECTION 2: QUIZ */}
        {activeQuestions.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center gap-2">
                <Award className="text-accent-secondary opacity-70" size={24} />
                <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
                  2. Basic Trees Quiz
                </h2>
              </div>
            </div>

            {showQuizResult ? (
              /* Quiz Finished Summary */
              <div className="neon-card neon-card-cyan flex flex-col items-center justify-center p-8 text-center gap-4">
                <Award className="text-accent-secondary animate-bounce" size={48} />
                <h3 className="text-2xl font-bold text-text-primary font-display">Quiz Completed!</h3>
                <p className="text-text-secondary max-w-sm">
                  You scored <span className="text-accent-secondary font-bold text-lg">{quizScore}</span> out of <span className="font-bold text-lg">{activeQuestions.length}</span>.
                </p>
                
                <div className="w-full max-w-xs bg-bg-secondary h-2.5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div 
                    className="bg-accent-secondary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(quizScore / activeQuestions.length) * 100}%` }} 
                  />
                </div>

                <div className="flex gap-4 w-full max-w-xs mt-6">
                  <button
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 bg-transparent border border-accent-secondary text-accent-secondary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-accent-secondary/10 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dsa/trees')}
                    className="flex-1 py-3 bg-accent-secondary text-bg-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              /* MCQ Active Question Display */
              <div className="neon-card neon-card-cyan" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
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
                        const isSelected = selectedOption === idx;
                        let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                        if (isSelected) {
                          if (isAnswered) {
                            optionStyle = option === activeQuestions[currentQuizQuestion].answer
                              ? "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                              : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
                          } else {
                            optionStyle = "border border-accent-secondary bg-accent-secondary/10 text-accent-secondary shadow-[0_0_12px_rgba(0,255,204,0.15)]";
                          }
                        } else if (isAnswered && option === activeQuestions[currentQuizQuestion].answer) {
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
                    /* Question Answer Feedback */
                    <div className="flex flex-col gap-4 bg-bg-primary/50 border border-border-default rounded-xl p-4 transition-all duration-300 mt-6 font-sans">
                      <div className="flex items-center gap-2">
                        {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? (
                          <CheckCircle2 className="text-success" size={20} />
                        ) : (
                          <XCircle className="text-error" size={20} />
                        )}
                        <span className={`text-sm font-bold uppercase tracking-wider ${activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'text-success' : 'text-error'}`}>
                          {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
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
                    /* Answer Submit Option Button */
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        disabled={selectedOption === null}
                        onClick={handleAnswerSubmit}
                        className={`w-full py-4 bg-transparent border font-mono font-bold text-base tracking-wider uppercase rounded-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer ${
                          selectedOption === null 
                            ? 'border-accent-secondary text-accent-secondary hover:bg-accent-secondary/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.2)] disabled:opacity-40' 
                            : 'border-success text-success hover:bg-success/10 hover:shadow-[0_0_15px_rgba(0,255,204,0.3)] shadow-[0_0_10px_rgba(0,255,204,0.15)]'
                        }`}
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
