import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  RotateCcw, 
  SkipForward, 
  Play, 
  Pause, 
  Award, 
  Layers,
  AlertCircle,
  Activity
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  title: string;
  description: string;
  line: number;
  // Step-specific states
  activeIndex?: number;
  prefixVals?: (number | string)[];
  bitVals?: (number | string)[];
  activeNodes?: string[];
  treeVals?: Record<string, number>;
  queryState?: {
    L: number;
    R: number;
    k?: number;
    sum?: number;
    index?: number;
    resolved?: boolean;
    ans?: number;
    updating?: boolean;
  };
  stVals?: {
    row0: (number | string)[];
    row1: (number | string)[];
    row2: (number | string)[];
  };
  highlightRows?: {
    row: number;
    col: number;
  }[];
}

const PSEUDOCODE_MAP: Record<string, string[]> = {
  prefix: [
    "prefix[0] = arr[0]",
    "for i = 1 to n-1",
    "    prefix[i] = prefix[i-1] + arr[i]",
    "// Query rangeSum(L, R)",
    "if L == 0",
    "    return prefix[R]",
    "return prefix[R] - prefix[L-1]"
  ],
  fenwick: [
    "// Update: BIT[idx] += val",
    "while index <= n",
    "    BIT[index] += value",
    "    index += index & -index",
    "// Query: query(idx)",
    "sum = 0",
    "while index > 0",
    "    sum += BIT[index]",
    "    index -= index & -index"
  ],
  segment: [
    "// Query: L > end or R < start: return 0",
    "if L <= start and end <= R: return tree[node]",
    "mid = (start + end) / 2",
    "return leftQuery + rightQuery",
    "// Update leaf & parents",
    "if start == end: tree[node] = val; return",
    "mid = (start + end) / 2; updateChild()",
    "tree[node] = tree[left] + tree[right]"
  ],
  sparse: [
    "for i = 0 to n-1: ST[0][i] = arr[i]",
    "for j = 1 to K:",
    "    for i = 0 to n - 2^j:",
    "        ST[j][i] = min(ST[j-1][i], ST[j-1][i+2^(j-1)])",
    "// Query min(L, R)",
    "len = R - L + 1",
    "k = floor(log2(len))",
    "return min(ST[k][L], ST[k][R - 2^k + 1])"
  ]
};

const VISUALIZATION_STEPS: Record<string, VisStep[]> = {
  prefix: [
    {
      title: "Initial Array",
      description: "Initial Array: [2, 5, 1, 8, 4] with indices 0 to 4. We want to construct a Prefix Sum array.",
      line: 0,
      prefixVals: ["?", "?", "?", "?", "?"]
    },
    {
      title: "Initialize prefix[0]",
      description: "Set the first prefix element to match the first element of the array: prefix[0] = arr[0] = 2.",
      line: 1,
      prefixVals: [2, "?", "?", "?", "?"]
    },
    {
      title: "Compute prefix[1]",
      description: "Compute prefix[1] = prefix[0] + arr[1] = 2 + 5 = 7.",
      line: 3,
      activeIndex: 1,
      prefixVals: [2, 7, "?", "?", "?"]
    },
    {
      title: "Compute prefix[2]",
      description: "Compute prefix[2] = prefix[1] + arr[2] = 7 + 1 = 8.",
      line: 3,
      activeIndex: 2,
      prefixVals: [2, 7, 8, "?", "?"]
    },
    {
      title: "Compute prefix[3]",
      description: "Compute prefix[3] = prefix[2] + arr[3] = 8 + 8 = 16.",
      line: 3,
      activeIndex: 3,
      prefixVals: [2, 7, 8, 16, "?"]
    },
    {
      title: "Compute prefix[4]",
      description: "Compute prefix[4] = prefix[3] + arr[4] = 16 + 4 = 20. The prefix sum array is now complete.",
      line: 3,
      activeIndex: 4,
      prefixVals: [2, 7, 8, 16, 20]
    },
    {
      title: "Query rangeSum(1, 3)",
      description: "Let's find the sum from L = 1 to R = 3. Check if L == 0. Since 1 != 0, we branch to the else-clause.",
      line: 5,
      prefixVals: [2, 7, 8, 16, 20],
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query rangeSum(1, 3) - Result",
      description: "Return prefix[3] - prefix[0] = 16 - 2 = 14. This matches the direct sum: 5 + 1 + 8 = 14.",
      line: 7,
      prefixVals: [2, 7, 8, 16, 20],
      queryState: { L: 1, R: 3, resolved: true, ans: 14 }
    }
  ],
  fenwick: [
    {
      title: "Fenwick Tree Structure",
      description: "A Fenwick Tree (Binary Indexed Tree) stores prefix sums in a 1-indexed array. Each index i is responsible for range ending at i. Precomputed BIT array is [2, 7, 1, 16, 4].",
      line: 0,
      bitVals: [2, 7, 1, 16, 4]
    },
    {
      title: "Query Prefix Sum(4) - Setup",
      description: "Query prefix sum up to index 4 (1-indexed). Initialize sum = 0 and index = 4.",
      line: 6,
      bitVals: [2, 7, 1, 16, 4],
      queryState: { L: 0, R: 4, sum: 0, index: 4 }
    },
    {
      title: "Query Prefix Sum(4) - Add BIT[4]",
      description: "Index 4 is > 0. Add BIT[4] (16) to sum. sum becomes 16. Then, index -= index & -index.",
      line: 8,
      bitVals: [2, 7, 1, 16, 4],
      queryState: { L: 0, R: 4, sum: 16, index: 4 },
      activeIndex: 4
    },
    {
      title: "Query Prefix Sum(4) - Move index",
      description: "Compute index & -index: 4 & -4 = 4. New index = 4 - 4 = 0. The next query loop will check index > 0.",
      line: 9,
      bitVals: [2, 7, 1, 16, 4],
      queryState: { L: 0, R: 4, sum: 16, index: 0 }
    },
    {
      title: "Query Prefix Sum(4) - Terminate",
      description: "Since index is 0, the loop terminates. Return total sum = 16. (Elements 2 + 5 + 1 + 8 = 16).",
      line: 7,
      bitVals: [2, 7, 1, 16, 4],
      queryState: { L: 0, R: 4, sum: 16, index: 0, resolved: true }
    },
    {
      title: "Update(3, +10) - Start",
      description: "Now let's perform update(3, 10) to add 10 to index 3. Start loop with index = 3.",
      line: 2,
      bitVals: [2, 7, 1, 16, 4],
      queryState: { L: 0, R: 3, index: 3, updating: true }
    },
    {
      title: "Update(3, +10) - Add value",
      description: "Add 10 to BIT[3]. BIT[3] becomes 1 + 10 = 11. Move to index += index & -index.",
      line: 3,
      bitVals: [2, 7, 11, 16, 4],
      queryState: { L: 0, R: 3, index: 3, updating: true },
      activeIndex: 3
    },
    {
      title: "Update(3, +10) - Jump to index 4",
      description: "Compute index & -index: 3 & -3 = 1. New index = 3 + 1 = 4. Since 4 <= 5, loop continues.",
      line: 4,
      bitVals: [2, 7, 11, 16, 4],
      queryState: { L: 0, R: 3, index: 4, updating: true }
    },
    {
      title: "Update(3, +10) - Add value to BIT[4]",
      description: "Add 10 to BIT[4]. BIT[4] becomes 16 + 10 = 26. Move to index += index & -index.",
      line: 3,
      bitVals: [2, 7, 11, 26, 4],
      queryState: { L: 0, R: 3, index: 4, updating: true },
      activeIndex: 4
    },
    {
      title: "Update(3, +10) - Terminate",
      description: "Compute index & -index: 4 & -4 = 4. New index = 4 + 4 = 8. Since 8 > 5, loop terminates. Update complete!",
      line: 2,
      bitVals: [2, 7, 11, 26, 4],
      queryState: { L: 0, R: 3, index: 8, updating: true, resolved: true }
    }
  ],
  segment: [
    {
      title: "Segment Tree Construction",
      description: "Segment Tree for array [2, 5, 1, 8]. The root node [0..3] stores the total sum 16.",
      line: 0,
      activeNodes: [],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 }
    },
    {
      title: "Query Sum(1, 3) - Root Node",
      description: "Find sum in range [1..3]. Start query at root [0..3]. Since [1..3] overlaps with [0..3] but is not fully inside, we split.",
      line: 3,
      activeNodes: ["0-3"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query Sum(1, 3) - Visit Left Child [0..1]",
      description: "Visit left child [0..1]. Since [1..3] partially overlaps with [0..1] (specifically index 1), we split to children.",
      line: 3,
      activeNodes: ["0-1"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query Sum(1, 3) - Visit [0..0] (Outside)",
      description: "Visit [0..0]. Since range [0..0] is completely outside [1..3], return 0.",
      line: 1,
      activeNodes: ["0-0"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query Sum(1, 3) - Visit [1..1] (Inside)",
      description: "Visit [1..1]. Since range [1..1] is fully inside query range [1..3], return its value 5.",
      line: 2,
      activeNodes: ["1-1"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query Sum(1, 3) - Visit Right Child [2..3] (Inside)",
      description: "Visit right child [2..3]. Since [2..3] is fully inside query range [1..3], return its value 9 directly without going deeper.",
      line: 2,
      activeNodes: ["2-3"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3 }
    },
    {
      title: "Query Sum(1, 3) - Compute Sum",
      description: "Combine the results from child queries: leftQuery (5) + rightQuery (9) = 14.",
      line: 4,
      activeNodes: ["0-3"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 1, "3-3": 8 },
      queryState: { L: 1, R: 3, resolved: true, ans: 14 }
    },
    {
      title: "Update index 2 with 10 - Leaf Node",
      description: "Perform update(2, 10). Traversal goes down to leaf [2..2] representing index 2. Set value to 10.",
      line: 6,
      activeNodes: ["2-2"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 9, "0-0": 2, "1-1": 5, "2-2": 10, "3-3": 8 }
    },
    {
      title: "Update parent [2..3]",
      description: "Recalculate parent [2..3] from children [2..2] (10) and [3..3] (8). Value is now 10 + 8 = 18.",
      line: 8,
      activeNodes: ["2-3"],
      treeVals: { "0-3": 16, "0-1": 7, "2-3": 18, "0-0": 2, "1-1": 5, "2-2": 10, "3-3": 8 }
    },
    {
      title: "Update root [0..3]",
      description: "Recalculate root [0..3] from children [0..1] (7) and [2..3] (18). Value is now 7 + 18 = 25. Update complete.",
      line: 8,
      activeNodes: ["0-3"],
      treeVals: { "0-3": 25, "0-1": 7, "2-3": 18, "0-0": 2, "1-1": 5, "2-2": 10, "3-3": 8 }
    }
  ],
  sparse: [
    {
      title: "Sparse Table Precomputation",
      description: "A Sparse Table precomputes query answers for all intervals of length 2^j. Array: [2, 5, 1, 8, 4].",
      line: 0,
      stVals: {
        row0: ["?", "?", "?", "?", "?"],
        row1: ["?", "?", "?", "?"],
        row2: ["?", "?"]
      }
    },
    {
      title: "Precomputation - Length 1",
      description: "Compute ST[0][i] = arr[i]. ST[0] = [2, 5, 1, 8, 4].",
      line: 1,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: ["?", "?", "?", "?"],
        row2: ["?", "?"]
      }
    },
    {
      title: "Precomputation - Length 2",
      description: "Compute ST[1][i] = min(ST[0][i], ST[0][i+1]). ST[1] = [2, 1, 1, 4] (min(2,5)=2, min(5,1)=1, min(1,8)=1, min(8,4)=4).",
      line: 4,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: [2, 1, 1, 4],
        row2: ["?", "?"]
      }
    },
    {
      title: "Precomputation - Length 4",
      description: "Compute ST[2][i] = min(ST[1][i], ST[1][i+2]). ST[2] = [1, 1] (min(ST[1][0], ST[1][2])=1, min(ST[1][1], ST[1][3])=1).",
      line: 4,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: [2, 1, 1, 4],
        row2: [1, 1]
      }
    },
    {
      title: "Query Minimum(1, 4)",
      description: "Find range minimum between L = 1 and R = 4 (values [5, 1, 8, 4]). Range length is 4 - 1 + 1 = 4.",
      line: 6,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: [2, 1, 1, 4],
        row2: [1, 1]
      },
      queryState: { L: 1, R: 4 }
    },
    {
      title: "Query Minimum(1, 4) - Calculate k",
      description: "Find largest power of 2 that fits: k = floor(log2(4)) = 2.",
      line: 7,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: [2, 1, 1, 4],
        row2: [1, 1]
      },
      queryState: { L: 1, R: 4, k: 2 }
    },
    {
      title: "Query Minimum(1, 4) - Overlapping Minimum",
      description: "Return min(ST[2][1], ST[2][4-4+1]) = min(ST[2][1], ST[2][1]) = min(1, 1) = 1.",
      line: 8,
      stVals: {
        row0: [2, 5, 1, 8, 4],
        row1: [2, 1, 1, 4],
        row2: [1, 1]
      },
      queryState: { L: 1, R: 4, k: 2, resolved: true, ans: 1 },
      highlightRows: [{ row: 2, col: 1 }]
    }
  ]
};

const TABS = [
  { id: 'prefix', label: 'Prefix Sum' },
  { id: 'fenwick', label: 'Fenwick Tree (BIT)' },
  { id: 'segment', label: 'Segment Tree' },
  { id: 'sparse', label: 'Sparse Table' }
];

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the main purpose of Range Trees?",
    options: ["Sorting", "Range Queries", "Graph Traversal", "Hashing"],
    answer: "Range Queries",
    explanation: "Range Trees and range query structures are specifically designed to perform queries (like sum, minimum, maximum) over segments of an array efficiently."
  },
  {
    question: "Which structure answers range sums in O(1) after preprocessing?",
    options: ["Segment Tree", "Prefix Sum", "Fenwick Tree", "Heap"],
    answer: "Prefix Sum",
    explanation: "A Prefix Sum array allows range sum queries to be answered in O(1) time using the formula prefix[R] - prefix[L-1]."
  },
  {
    question: "Prefix Sum update complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: "O(N)",
    explanation: "Updating an element in a Prefix Sum array requires updating all subsequent prefix elements, which takes O(N) time."
  },
  {
    question: "Fenwick Tree is also called:",
    options: ["AVL Tree", "Binary Indexed Tree", "Red-Black Tree", "Trie"],
    answer: "Binary Indexed Tree",
    explanation: "Fenwick Tree is widely known as the Binary Indexed Tree (BIT)."
  },
  {
    question: "Fenwick Tree query complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: "O(log N)",
    explanation: "Both query and update operations in a Fenwick Tree run in O(log N) time."
  },
  {
    question: "Which operation does index & -index help perform?",
    options: ["DFS", "BIT Traversal", "Sorting", "Heapify"],
    answer: "BIT Traversal",
    explanation: "The expression `index & -index` extracts the lowest set bit of index, which is used to traverse parents/children in a Binary Indexed Tree (BIT)."
  },
  {
    question: "Segment Trees divide arrays into:",
    options: ["Nodes only", "Segments", "Hash Buckets", "Levels"],
    answer: "Segments",
    explanation: "Segment Trees work by dividing the array recursively into smaller segments."
  },
  {
    question: "Segment Tree query complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: "O(log N)",
    explanation: "Range queries in a Segment Tree take O(log N) time because we only visit at most 4 nodes per level."
  },
  {
    question: "Segment Tree updates affect:",
    options: ["Entire tree", "Relevant path only", "Root only", "Leaves only"],
    answer: "Relevant path only",
    explanation: "When a single element is updated, only the path from that leaf node up to the root needs to be recalculated, which takes O(log N) time."
  },
  {
    question: "Sparse Tables are best for:",
    options: ["Dynamic updates", "Static queries", "Graph traversal", "DFS"],
    answer: "Static queries",
    explanation: "Sparse Tables are designed for static arrays where no updates occur, as any update would require rebuilding the table."
  },
  {
    question: "Sparse Table query complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: "O(1)",
    explanation: "Sparse Tables can answer range queries (like minimum/maximum) in O(1) constant time after O(N log N) preprocessing."
  },
  {
    question: "Sparse Tables support updates efficiently.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Sparse Tables do not support efficient updates; any update requires O(N log N) time to recompute the table."
  },
  {
    question: "Which structure is simplest for static range sums?",
    options: ["Prefix Sum", "Segment Tree", "Fenwick Tree", "Trie"],
    answer: "Prefix Sum",
    explanation: "Prefix Sum is the simplest and most memory-efficient structure for static range sum queries."
  },
  {
    question: "Which structure stores sums in parent nodes?",
    options: ["Hash Map", "Segment Tree", "Queue", "Stack"],
    answer: "Segment Tree",
    explanation: "In a sum Segment Tree, each parent node stores the sum of the values of its children."
  },
  {
    question: "Fenwick Trees are generally more memory efficient than Segment Trees.",
    options: ["True", "False"],
    answer: "True",
    explanation: "Fenwick Trees require only O(N) auxiliary space (equal to the size of the array), whereas Segment Trees typically require O(4N) space."
  },
  {
    question: "Which structure is commonly used in competitive programming for range updates?",
    options: ["Segment Tree", "Queue", "Trie", "Heap"],
    answer: "Segment Tree",
    explanation: "Segment Trees are widely used for range updates and lazy propagation."
  },
  {
    question: "Prefix Sum preprocessing complexity is:",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: "O(N)",
    explanation: "Building a prefix sum array requires a single pass over the original array, running in O(N) time."
  },
  {
    question: "Which structure is best for dynamic range sum queries?",
    options: ["Segment Tree", "Prefix Sum", "Array", "Linked List"],
    answer: "Segment Tree",
    explanation: "Segment Trees support both range sum queries and point updates in O(log N) time, making them ideal for dynamic scenarios."
  },
  {
    question: "Segment Trees are implemented using:",
    options: ["Recursive tree structure", "Graphs", "Queues only", "Hashing"],
    answer: "Recursive tree structure",
    explanation: "Segment Trees are naturally built and traversed using recursion."
  },
  {
    question: "Which structure provides the fastest static query performance?",
    options: ["Sparse Table", "Fenwick Tree", "Segment Tree", "BST"],
    answer: "Sparse Table",
    explanation: "Sparse Table answers range minimum/maximum queries in O(1) time, which is faster than the O(log N) of Fenwick or Segment Trees."
  }
];

export function RangeTreesPage() {
  const navigate = useNavigate();

  // Completion trackers
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('dsa_progress_range_trees');
    return saved ? JSON.parse(saved) : { 1: false, 2: false };
  });

  useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Visualizer Tab & Steps
  const [activeVisTab, setActiveVisTab] = useState<string>('prefix');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  const activeSteps = VISUALIZATION_STEPS[activeVisTab] || [];
  const activeStepData = activeSteps[currentStep] || { title: '', description: '', line: 0 };
  const activeStepPseudocode = PSEUDOCODE_MAP[activeVisTab] || [];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, [activeVisTab]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < activeSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (playIntervalRef.current) clearInterval(playIntervalRef.current);
            return prev;
          }
        });
      }, 2500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, activeSteps]);

  const handlePlayPause = () => {
    if (currentStep === activeSteps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Quiz state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  useEffect(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    const currentQ = activeQuestions[currentQuizQuestion];
    if (currentQ.options[selectedOption] === currentQ.answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuizQuestion === activeQuestions.length - 1) {
      setShowQuizResult(true);
      setCompletedSections(prev => {
        const updated = { ...prev, 1: true, 2: true };
        localStorage.setItem('dsa_progress_range_trees', JSON.stringify(updated));
        return updated;
      });
    } else {
      setCurrentQuizQuestion(prev => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dsa/trees')}
              className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-tertiary hover:text-accent-tertiary transition-colors group cursor-pointer"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold font-display text-text-primary tracking-tight capitalize">
                <span className="text-accent-tertiary">Range</span> Trees
              </h1>
              <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
                Prefix Sums, Segment Trees & Binary Indexed Trees
              </p>
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-8 flex-1">
        {/* SECTION 1: VISUALIZATION */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center gap-2">
              <Layers className="text-accent-tertiary opacity-70" size={24} />
              <h2 className="text-2xl font-bold font-display text-text-primary">
                1. Interactive Visualization
              </h2>
            </div>
          </div>

          <div className="neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            {/* Visualizer Custom Tabs */}
            <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveVisTab(tab.id)}
                  className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeVisTab === tab.id
                      ? 'border-accent-tertiary text-accent-tertiary'
                      : 'border-transparent text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column: Visualizer Controls & Description & Pseudocode */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-text-secondary uppercase select-none">
                    Step {currentStep + 1} of {activeSteps.length}
                  </span>
                  
                  {/* Playback Control Icons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={handleStepBackward}
                      disabled={currentStep === 0}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Previous Step"
                    >
                      <SkipForward size={16} className="rotate-180" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="p-1.5 hover:text-text-primary text-text-muted transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Auto Play"}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={handleStepForward}
                      disabled={currentStep === activeSteps.length - 1}
                      className="p-1.5 hover:text-text-primary text-text-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Next Step"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Description Text Box with AlertCircle */}
                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <AlertCircle className="text-accent-tertiary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">
                    {activeStepData.description}
                  </p>
                </div>

                {/* Highlighted Pseudocode Box */}
                {activeStepPseudocode.length > 0 && (
                  <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                    <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                      Pseudocode
                    </div>
                    <div className="space-y-1 text-sm font-mono select-none">
                      {activeStepPseudocode.map((codeLine, idx) => {
                        const lineNum = idx + 1;
                        const isLineHighlighted = activeStepData.line === lineNum;
                        return (
                          <div 
                            key={idx}
                            className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${
                              isLineHighlighted 
                                ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' 
                                : 'border-l-2 border-transparent text-text-secondary'
                            }`}
                          >
                            <span className="text-text-muted select-none w-3 text-right">{lineNum}</span>
                            <span className="whitespace-pre">{codeLine}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visualization Board */}
              <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                  <Activity size={14} className="opacity-70 text-accent-tertiary" />
                  <span>Range Buffer Representation</span>
                </div>

                {/* Dynamic visual renderings per Tab */}
                
                {/* 1. Prefix Sum Tab */}
                {activeVisTab === 'prefix' && (
                  <div className="flex flex-col gap-6 w-full max-w-sm mt-4 select-none">
                    {/* Original Array */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Original Array (arr)</span>
                      <div className="flex gap-2">
                        {[2, 5, 1, 8, 4].map((val, idx) => {
                          const isQueryElement = activeStepData.queryState && idx >= activeStepData.queryState.L && idx <= activeStepData.queryState.R;
                          const isCurrentActive = activeStepData.activeIndex === idx;
                          
                          let bgClass = "bg-bg-secondary border-border-default text-text-secondary";
                          if (isCurrentActive) {
                            bgClass = "bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]";
                          } else if (isQueryElement) {
                            bgClass = "bg-accent-tertiary/10 border-accent-tertiary/60 text-text-primary font-semibold";
                          }
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className={`w-11 h-11 border rounded-lg flex items-center justify-center font-mono text-sm transition-all duration-300 ${bgClass}`}>
                                {val}
                              </div>
                              <span className="text-[10px] text-text-muted font-mono mt-0.5">{idx}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prefix Sum Array */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider font-semibold">Prefix Sum Array (prefix)</span>
                      <div className="flex gap-2">
                        {(activeStepData.prefixVals || ["?", "?", "?", "?", "?"]).map((val, idx) => {
                          const isQueryLMinus1 = activeStepData.queryState && activeStepData.queryState.L > 0 && idx === activeStepData.queryState.L - 1;
                          const isQueryR = activeStepData.queryState && idx === activeStepData.queryState.R;
                          const isCurrentActive = activeStepData.activeIndex === idx;

                          let bgClass = "bg-bg-secondary border-border-default text-text-secondary";
                          if (isCurrentActive) {
                            bgClass = "bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]";
                          } else if (isQueryR) {
                            bgClass = "bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                          } else if (isQueryLMinus1) {
                            bgClass = "bg-bg-secondary border-accent-tertiary/50 text-accent-tertiary/90 border-dashed";
                          } else if (val !== "?") {
                            bgClass = "bg-bg-secondary border-border-default text-text-primary";
                          }
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className={`w-11 h-11 border rounded-lg flex items-center justify-center font-mono text-sm transition-all duration-300 ${bgClass}`}>
                                {val}
                              </div>
                              <span className="text-[10px] text-text-muted font-mono mt-0.5">{idx}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Query details */}
                    {activeStepData.queryState && (
                      <div className="bg-bg-secondary/40 border border-border-default/45 p-3 rounded-lg text-center font-mono text-xs text-text-secondary">
                        {activeStepData.queryState.resolved ? (
                          <div>
                            <span className="text-accent-tertiary font-bold">Query rangeSum({activeStepData.queryState.L}, {activeStepData.queryState.R})</span>
                            <div className="mt-1 text-text-primary text-sm font-semibold">
                              prefix[{activeStepData.queryState.R}] - prefix[{activeStepData.queryState.L - 1}] = {activeStepData.queryState.ans}
                            </div>
                          </div>
                        ) : (
                          <div>
                            Querying rangeSum({activeStepData.queryState.L}, {activeStepData.queryState.R})
                            <div className="text-text-muted mt-1">L &gt; 0, compute prefix[R] - prefix[L-1]</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Fenwick Tree Tab */}
                {activeVisTab === 'fenwick' && (
                  <div className="flex flex-col gap-6 w-full max-w-sm mt-4 select-none">
                    {/* Original Array */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Original Array (1-Indexed)</span>
                      <div className="flex gap-2">
                        {[2, 5, 1, 8, 4].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center">
                            <div className="w-10 h-10 border border-border-default bg-bg-secondary/50 text-text-muted rounded-lg flex items-center justify-center font-mono text-xs">
                              {val}
                            </div>
                            <span className="text-[9px] text-text-muted font-mono mt-0.5">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BIT Array */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Fenwick Array (BIT)</span>
                      <div className="flex gap-2">
                        {(activeStepData.bitVals || [2, 7, 1, 16, 4]).map((val, idx) => {
                          const isQueryIdx = activeStepData.queryState && activeStepData.queryState.index === (idx + 1);
                          const isModified = activeStepData.activeIndex === (idx + 1);
                          
                          let bgClass = "bg-bg-secondary border-border-default text-text-primary";
                          if (isQueryIdx) {
                            bgClass = "bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]";
                          } else if (isModified) {
                            bgClass = "bg-accent-tertiary/15 border-accent-tertiary text-accent-tertiary font-extrabold animate-bounce";
                          }
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                              <div className={`w-10 h-10 border rounded-lg flex items-center justify-center font-mono text-xs transition-all duration-300 ${bgClass}`}>
                                {val}
                              </div>
                              <span className="text-[9px] text-text-muted font-mono mt-0.5">{idx + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* BIT variables */}
                    {activeStepData.queryState && (() => {
                      const qState = activeStepData.queryState;
                      const qIndex = qState.index ?? 0;
                      return (
                        <div className="bg-bg-secondary/40 border border-border-default/45 p-3 rounded-lg text-center font-mono text-xs text-text-secondary flex flex-col gap-1">
                          {qState.updating ? (
                            <>
                              <span className="text-accent-tertiary font-bold">update(3, +10)</span>
                              <div className="text-text-primary mt-1">
                                index = {qIndex} {qState.resolved ? '(terminates as index > 5)' : `(adds value at BIT[${qIndex}])`}
                              </div>
                              {!qState.resolved && (
                                <div className="text-text-muted text-[10px]">
                                  Next: index += (index &amp; -index) = {qIndex} + {qIndex & -qIndex}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-accent-tertiary font-bold">query(4)</span>
                              <div className="text-text-primary mt-1">
                                sum = {qState.sum} | index = {qIndex}
                              </div>
                              {!qState.resolved && qIndex > 0 && (
                                <div className="text-text-muted text-[10px]">
                                  Next: index -= (index &amp; -index) = {qIndex} - {qIndex & -qIndex}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. Segment Tree Tab */}
                {activeVisTab === 'segment' && (
                  <div className="w-full h-full flex flex-col items-center mt-2 select-none">
                    <svg className="w-full h-[220px]" viewBox="0 0 320 220">
                      <style>{`
                        @keyframes segmentPop {
                          0% { transform: scale(0); opacity: 0; }
                          80% { transform: scale(1.1); }
                          100% { transform: scale(1); opacity: 1; }
                        }
                        .node-segment {
                          animation: segmentPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                        }
                      `}</style>

                      {/* Connectors */}
                      {/* Root to Left/Right */}
                      <line x1="160" y1="35" x2="80" y2="85" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />
                      <line x1="160" y1="35" x2="240" y2="85" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />

                      {/* Left to LL/LR */}
                      <line x1="80" y1="85" x2="40" y2="145" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />
                      <line x1="80" y1="85" x2="120" y2="145" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />

                      {/* Right to RL/RR */}
                      <line x1="240" y1="85" x2="200" y2="145" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />
                      <line x1="240" y1="85" x2="280" y2="145" stroke="var(--color-border-default)" strokeWidth="1.5" className="opacity-40" />

                      {/* Nodes */}
                      {[
                        { id: "0-3", label: "[0..3]", cx: 160, cy: 35 },
                        { id: "0-1", label: "[0..1]", cx: 80, cy: 85 },
                        { id: "2-3", label: "[2..3]", cx: 240, cy: 85 },
                        { id: "0-0", label: "[0..0]", cx: 40, cy: 145 },
                        { id: "1-1", label: "[1..1]", cx: 120, cy: 145 },
                        { id: "2-2", label: "[2..2]", cx: 200, cy: 145 },
                        { id: "3-3", label: "[3..3]", cx: 280, cy: 145 }
                      ].map((node) => {
                        const val = activeStepData.treeVals ? activeStepData.treeVals[node.id] : 0;
                        const isNodeActive = activeStepData.activeNodes?.includes(node.id);
                        
                        let fillVal = "var(--color-bg-secondary)";
                        let strokeVal = "var(--color-border-default)";
                        let textCol = "var(--color-text-secondary)";

                        if (isNodeActive) {
                          fillVal = "rgba(245, 158, 11, 0.15)";
                          strokeVal = "var(--color-accent-tertiary)";
                          textCol = "var(--color-accent-tertiary)";
                        }

                        return (
                          <g 
                            key={node.id} 
                            className="node-segment"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          >
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r="18"
                              fill={fillVal}
                              stroke={strokeVal}
                              strokeWidth={isNodeActive ? 2.5 : 1.5}
                              className="transition-all duration-300"
                            />
                            {/* Segment Range Tag */}
                            <text
                              x={node.cx}
                              y={node.cy - 3}
                              textAnchor="middle"
                              className="font-mono text-[7px] font-bold select-none fill-text-muted"
                            >
                              {node.label}
                            </text>
                            {/* Segment Value */}
                            <text
                              x={node.cx}
                              y={node.cy + 7}
                              textAnchor="middle"
                              className="font-mono text-[10px] font-extrabold select-none"
                              fill={textCol}
                            >
                              {val}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Segment query state summary */}
                    {activeStepData.queryState && (
                      <div className="bg-bg-secondary/40 border border-border-default/45 p-2 rounded-lg text-center font-mono text-[11px] text-text-secondary mt-1">
                        Query rangeSum({activeStepData.queryState.L}, {activeStepData.queryState.R})
                        {activeStepData.queryState.resolved && (
                          <div className="text-accent-tertiary font-bold mt-0.5 text-xs">
                            Resolved sum = {activeStepData.queryState.ans}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Sparse Table Tab */}
                {activeVisTab === 'sparse' && (
                  <div className="flex flex-col gap-4 w-full max-w-sm mt-4 select-none">
                    <span className="text-xs text-text-muted font-bold font-mono uppercase tracking-wider">Static Sparse Table (RMQ)</span>
                    
                    {/* ST columns representation */}
                    <div className="flex flex-col gap-2.5 font-mono text-xs">
                      {/* Row 0 (Length 1) */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] text-text-muted font-bold">j=0 (len 1)</span>
                        <div className="flex-1 flex gap-2">
                          {(activeStepData.stVals?.row0 || ["?", "?", "?", "?", "?"]).map((val, idx) => (
                            <div key={idx} className="flex-1 h-8 border border-border-default bg-bg-secondary/40 rounded flex items-center justify-center text-text-primary text-xs">
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 1 (Length 2) */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] text-text-muted font-bold">j=1 (len 2)</span>
                        <div className="flex-1 flex gap-2">
                          {(activeStepData.stVals?.row1 || ["?", "?", "?", "?"]).map((val, idx) => (
                            <div key={idx} className="flex-1 h-8 border border-border-default bg-bg-secondary/40 rounded flex items-center justify-center text-text-primary text-xs">
                              {val}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row 2 (Length 4) */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] text-text-muted font-bold">j=2 (len 4)</span>
                        <div className="flex-1 flex gap-2">
                          {(activeStepData.stVals?.row2 || ["?", "?", "?", "?", "?", "?", "?", "?"].slice(0, 2)).map((val, idx) => {
                            const isQueryCell = activeStepData.highlightRows?.some(h => h.row === 2 && h.col === idx);
                            
                            let cellClass = "border-border-default bg-bg-secondary/40 text-text-primary";
                            if (isQueryCell) {
                              cellClass = "border-accent-tertiary bg-accent-tertiary/20 text-accent-tertiary font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]";
                            }
                            return (
                              <div key={idx} className={`w-[93px] h-8 border rounded flex items-center justify-center text-xs transition-all duration-300 ${cellClass}`}>
                                {val}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Query Info Box */}
                    {activeStepData.queryState && (
                      <div className="bg-bg-secondary/40 border border-border-default/45 p-3 rounded-lg text-center font-mono text-xs text-text-secondary mt-1">
                        Query rangeMin({activeStepData.queryState.L}, {activeStepData.queryState.R})
                        {activeStepData.queryState.k !== undefined && (
                          <div className="mt-1">
                            Length = {activeStepData.queryState.R - activeStepData.queryState.L + 1} | power k = {activeStepData.queryState.k}
                          </div>
                        )}
                        {activeStepData.queryState.resolved && (
                          <div className="text-accent-tertiary font-bold mt-1 text-sm">
                            min(ST[2][1], ST[2][1]) = {activeStepData.queryState.ans}
                          </div>
                        )}
                      </div>
                    )}
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
                <Award className="text-accent-tertiary opacity-70" size={24} />
                <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
                  2. Range Trees Quiz
                </h2>
              </div>
            </div>

            {showQuizResult ? (
              /* Quiz Finished Summary */
              <div className="neon-card neon-card-yellow flex flex-col items-center justify-center p-8 text-center gap-4">
                <Award className="text-accent-tertiary animate-bounce" size={48} />
                <h3 className="text-2xl font-bold text-text-primary font-display">Quiz Completed!</h3>
                <p className="text-text-secondary max-w-sm">
                  You scored <span className="text-accent-tertiary font-bold text-lg">{quizScore}</span> out of <span className="font-bold text-lg">{activeQuestions.length}</span>.
                </p>
                
                <div className="w-full max-w-xs bg-bg-secondary h-2.5 rounded-full overflow-hidden border border-white/5 mt-2">
                  <div 
                    className="bg-accent-tertiary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(quizScore / activeQuestions.length) * 100}%` }} 
                  />
                </div>

                <div className="flex gap-4 w-full max-w-xs mt-6">
                  <button
                    onClick={handleRestartQuiz}
                    className="flex-1 py-3 bg-transparent border border-accent-tertiary text-accent-tertiary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:bg-accent-tertiary/10 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dsa/trees')}
                    className="flex-1 py-3 bg-accent-tertiary text-bg-primary font-mono font-bold text-sm tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    Finish
                  </button>
                </div>
              </div>
            ) : (
              /* MCQ Active Question Display */
              <div className="neon-card neon-card-yellow" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-start items-center">
                    <span className="text-xl font-mono text-accent-tertiary uppercase tracking-wider select-none">
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
                              ? "border border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                              : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                          } else {
                            optionStyle = "border border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                          }
                        } else if (isAnswered && option === activeQuestions[currentQuizQuestion].answer) {
                          optionStyle = "border border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary shadow-[0_0_12px_rgba(245,158,11,0.15)]";
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
                        <span className={`text-sm font-bold uppercase tracking-wider ${activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'text-accent-tertiary' : 'text-error'}`}>
                          {activeQuestions[currentQuizQuestion].options[selectedOption!] === activeQuestions[currentQuizQuestion].answer ? 'Correct Answer!' : 'Incorrect Answer'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {activeQuestions[currentQuizQuestion].explanation}
                      </p>
                      
                      <div className="pt-6 mt-4 border-t border-border-default/20">
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-4 bg-accent-tertiary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] cursor-pointer"
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
                            ? 'border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-40' 
                            : 'border-accent-tertiary text-accent-tertiary hover:bg-accent-tertiary/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] shadow-[0_0_10px_rgba(245,158,11,0.15)]'
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
