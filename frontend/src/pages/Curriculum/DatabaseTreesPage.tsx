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

const VISUALIZATION_STEPS: Record<'btree' | 'bplustree' | 'lsmtree', VisStep[]> = {
  btree: [
    {
      step: 0,
      description: "Query key 40 in B-Tree. Compare with root [30]. Since 40 > 30, traverse to right child.",
      line: 1
    },
    {
      step: 1,
      description: "In the right child node [40 | 50], scan keys. Found 40 at index 0. Search success!",
      line: 2
    },
    {
      step: 2,
      description: "We want to insert 60. Locate leaf child by traversing right child of root [30] -> [40 | 50].",
      line: 1
    },
    {
      step: 3,
      description: "Insert 60 into leaf node [40 | 50] in sorted order. Leaf becomes [40 | 50 | 60].",
      line: 2
    },
    {
      step: 4,
      description: "Insert 70 into [40 | 50 | 60]. Leaf becomes [40 | 50 | 60 | 70]. Overflow occurs!",
      line: 3
    },
    {
      step: 5,
      description: "Split node: middle key 60 moves up. Leaf splits into [40 | 50] and [70].",
      line: 4
    }
  ],
  bplustree: [
    {
      step: 0,
      description: "Search 40. Start at root index [30]. Since 40 >= 30, traverse to right leaf [40 | 50].",
      line: 1
    },
    {
      step: 1,
      description: "In B+ Tree leaf [40 | 50], scan keys. Found key 40. Data resides only at leaf level!",
      line: 2
    },
    {
      step: 2,
      description: "Range Query [20..50]: First locate key 20. Traversal points to left leaf [10 | 20].",
      line: 5
    },
    {
      step: 3,
      description: "Output 20. Follow linked pointer from [10 | 20] to next leaf [30]. Output 30.",
      line: 6
    },
    {
      step: 4,
      description: "Follow next link to [40 | 50]. Output 40 and 50. Range Scan complete!",
      line: 7
    }
  ],
  lsmtree: [
    {
      step: 0,
      description: "Write key 'User123' to memory-resident MemTable buffer. RAM writes are fast.",
      line: 2
    },
    {
      step: 1,
      description: "MemTable fills up. Flush sorted elements to disk as immutable SSTable 1.",
      line: 4
    },
    {
      step: 2,
      description: "Subsequent writes flush to disk, creating SSTable 2 and SSTable 3. Disk layout is fragmented.",
      line: 4
    },
    {
      step: 3,
      description: "Trigger Compaction: merge SSTables 1, 2, and 3. Deduplicate keys and produce a larger SSTable.",
      line: 5
    }
  ]
};

const QUIZ_QUESTIONS = [
  {
    question: "Why are Database Trees used?",
    options: ["Graphics", "Efficient Disk Access", "DFS Traversal", "Sorting"],
    answer: 1,
    explanation: "Database Trees minimize disk access operations by grouping multiple keys per node, reducing tree height."
  },
  {
    question: "Which tree stores multiple keys per node?",
    options: ["BST", "B-Tree", "Trie", "Heap"],
    answer: 1,
    explanation: "B-Trees are multi-way search trees designed to store multiple keys and child pointers per node."
  },
  {
    question: "B-Trees reduce:",
    options: ["Memory allocation", "Disk reads", "Sorting complexity", "Recursion"],
    answer: 1,
    explanation: "By storing hundreds of keys per node, the tree height is small, which minimizes disk read operations."
  },
  {
    question: "Which operation may cause a node split?",
    options: ["Search", "Traversal", "Insertion", "DFS"],
    answer: 2,
    explanation: "Inserting a new key into a full node causes it to exceed the maximum key limit, triggering a split."
  },
  {
    question: "When a B-Tree node overflows:",
    options: ["Delete node", "Split node", "Merge node", "Rotate node"],
    answer: 1,
    explanation: "An overflow is resolved by splitting the node into two and promoting the median key to the parent node."
  },
  {
    question: "B-Trees are:",
    options: ["Self-balancing", "Unbalanced", "Randomized", "Static"],
    answer: 0,
    explanation: "B-Trees automatically maintain balance during insertions and deletions, ensuring all leaf nodes remain at the same level."
  },
  {
    question: "In a B+ Tree, actual data is stored in:",
    options: ["Root", "Internal Nodes", "Leaf Nodes", "All Nodes"],
    answer: 2,
    explanation: "B+ Trees store all actual data records or pointers to records in the leaf nodes; internal nodes only store search keys."
  },
  {
    question: "Internal nodes in B+ Trees contain:",
    options: ["Data Records", "Keys and Pointers", "Arrays", "Hashes"],
    answer: 1,
    explanation: "Internal nodes in B+ Trees serve strictly as router indices, holding keys and pointers to guide searches down to the leaves."
  },
  {
    question: "Which tree is most common in relational databases?",
    options: ["AVL Tree", "Trie", "B+ Tree", "Heap"],
    answer: 2,
    explanation: "B+ Trees are highly efficient for range scans and sequential accesses, making them the standard choice for DB indexing."
  },
  {
    question: "Why are B+ Trees excellent for range queries?",
    options: ["Recursion", "Linked Leaves", "Rotations", "Heapification"],
    answer: 1,
    explanation: "Leaf nodes in a B+ Tree are linked sequentially, allowing range queries to scan values in order without backtracking up the tree."
  },
  {
    question: "Which operation follows linked leaf nodes?",
    options: ["Point Search", "Range Query", "Insertion", "Deletion"],
    answer: 1,
    explanation: "A range query first locates the lower bound in a leaf, and then traverses linked leaf pointers sequentially."
  },
  {
    question: "LSM Trees are optimized for:",
    options: ["Reads Only", "Heavy Writes", "DFS", "Sorting"],
    answer: 1,
    explanation: "LSM Trees write updates sequentially to memory and flush them to disk, optimizing write throughput by avoiding random I/O."
  },
  {
    question: "New writes in LSM Trees first go to:",
    options: ["SSTable", "Heap", "MemTable", "Disk Index"],
    answer: 2,
    explanation: "Writes are first stored in the fast memory-resident MemTable before being flushed to disk."
  },
  {
    question: "What happens when MemTable becomes full?",
    options: ["Delete data", "Flush to SSTable", "Rebalance tree", "Rotate nodes"],
    answer: 1,
    explanation: "When the MemTable reaches its capacity, its sorted contents are flushed to disk as an immutable SSTable file."
  },
  {
    question: "SSTable stands for:",
    options: ["Sorted String Table", "Simple Search Tree", "Segment Storage Tree", "Static Sorted Tree"],
    answer: 0,
    explanation: "SSTable stands for Sorted String Table, which stores a set of key-value pairs sorted by key on disk."
  },
  {
    question: "Compaction in LSM Trees:",
    options: ["Splits data", "Merges SSTables", "Deletes roots", "Rebuilds indexes"],
    answer: 1,
    explanation: "Compaction merges separate SSTables, deduplicates keys, discards deleted records, and writes a unified sorted SSTable."
  },
  {
    question: "Which database uses LSM Trees?",
    options: ["MySQL InnoDB", "Cassandra", "Oracle B-Tree only", "TreeMap"],
    answer: 1,
    explanation: "Apache Cassandra utilizes LSM Tree structures to handle massive write-heavy analytical workloads."
  },
  {
    question: "Which structure is better for heavy write workloads?",
    options: ["B+ Tree", "BST", "LSM Tree", "AVL Tree"],
    answer: 2,
    explanation: "LSM Trees run writes in-memory, avoiding random disk seeks, making them significantly faster for write-intensive workloads."
  },
  {
    question: "Which database structure supports fast range scans?",
    options: ["Queue", "Heap", "B+ Tree", "Stack"],
    answer: 2,
    explanation: "B+ Trees support fast O(log N) point search followed by sequential O(1) leaf-level link traversals for range scans."
  },
  {
    question: "The primary goal of Database Trees is:",
    options: ["Reduce recursion", "Optimize storage and retrieval on disk", "Eliminate indexing", "Replace hashing"],
    answer: 1,
    explanation: "Database Trees are designed to optimize storage block reads/writes on slow disk systems."
  }
];

type VisTab = 'btree' | 'bplustree' | 'lsmtree';

export function DatabaseTreesPage() {
  const navigate = useNavigate();

  // Completed sections progress tracker
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_database_trees');
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
      localStorage.setItem('dsa_progress_database_trees', JSON.stringify(updated));
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
        localStorage.setItem('dsa_progress_database_trees', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // Visualizer state
  const [activeVisTab, setActiveVisTab] = useState<VisTab>('btree');
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
  const renderBTreeVisual = () => {
    // Coordinates
    // Root at (250, 45)
    // Left at (130, 135)
    // Right at (370, 135)
    const rootVal = '[30]';
    let leftVal = '[10 | 20]';
    let rightVal = '[40 | 50]';
    
    let isSplit = false;
    let isOverflow = false;

    if (visStep === 3) {
      rightVal = '[40 | 50 | 60]';
    } else if (visStep === 4) {
      rightVal = '[40|50|60|70]';
      isOverflow = true;
    } else if (visStep === 5) {
      isSplit = true;
    }

    const getRootStyle = () => {
      if (visStep === 0 || visStep === 2) return 'stroke-accent-tertiary fill-accent-tertiary/10 text-accent-tertiary';
      if (visStep === 5) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      return 'stroke-border-default fill-bg-secondary text-text-secondary';
    };

    const getRightStyle = () => {
      if (visStep === 1) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      if (visStep === 3) return 'stroke-accent-tertiary fill-accent-tertiary/15 text-accent-tertiary';
      if (isOverflow) return 'stroke-error fill-error/15 text-error animate-pulse';
      return 'stroke-border-default fill-bg-secondary text-text-secondary';
    };

    if (isSplit) {
      return (
        <svg className="w-full h-[320px]" viewBox="0 0 500 320">
          {/* Root to three children */}
          <line x1="250" y1="45" x2="110" y2="155" className="stroke-text-muted/30" strokeWidth="2.5" />
          <line x1="250" y1="45" x2="250" y2="155" className="stroke-text-muted/30" strokeWidth="2.5" />
          <line x1="250" y1="45" x2="390" y2="155" className="stroke-text-muted/30" strokeWidth="2.5" />

          {/* Root node */}
          <g transform="translate(205, 25)">
            <rect width="90" height="34" rx="6" className={`stroke-2 ${getRootStyle()}`} />
            <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[30 | 60]</text>
            <text x="45" y="-8" textAnchor="middle" fontSize="10" className="font-mono fill-text-muted font-bold">SPLIT ROOT</text>
          </g>

          {/* Child 1 (Left) */}
          <g transform="translate(65, 155)">
            <rect width="90" height="34" rx="6" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
            <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[10 | 20]</text>
          </g>

          {/* Child 2 (Middle) */}
          <g transform="translate(205, 155)">
            <rect width="90" height="34" rx="6" className="stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary stroke-2" />
            <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[40 | 50]</text>
            <text x="45" y="48" textAnchor="middle" fontSize="10" className="font-mono fill-accent-tertiary font-bold">LEFT SPLIT</text>
          </g>

          {/* Child 3 (Right) */}
          <g transform="translate(345, 155)">
            <rect width="90" height="34" rx="6" className="stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary stroke-2" />
            <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[70]</text>
            <text x="45" y="48" textAnchor="middle" fontSize="10" className="font-mono fill-accent-tertiary font-bold">RIGHT SPLIT</text>
          </g>
        </svg>
      );
    }

    return (
      <svg className="w-full h-[320px]" viewBox="0 0 500 320">
        {/* Draw Connectors */}
        <line x1="250" y1="45" x2="130" y2="135" className="stroke-text-muted/30" strokeWidth="2.5" />
        <line x1="250" y1="45" x2="370" y2="135" className="stroke-text-muted/30" strokeWidth="2.5" />

        {/* Root Node */}
        <g transform="translate(205, 25)">
          <rect width="90" height="34" rx="6" className={`stroke-2 ${getRootStyle()}`} />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">{rootVal}</text>
          <text x="45" y="-8" textAnchor="middle" fontSize="10" className="font-mono fill-text-muted font-bold">ROOT NODE</text>
        </g>

        {/* Left Leaf Node */}
        <g transform="translate(85, 135)">
          <rect width="90" height="34" rx="6" className="stroke-border-default fill-bg-secondary text-text-secondary stroke-2" />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">{leftVal}</text>
        </g>

        {/* Right Leaf Node */}
        <g transform="translate(325, 135)">
          <rect width={isOverflow ? "110" : "90"} height="34" rx="6" className={`stroke-2 ${getRightStyle()}`} />
          <text x={isOverflow ? "55" : "45"} y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">{rightVal}</text>
          {isOverflow && (
            <text x="55" y="48" textAnchor="middle" fontSize="10" className="font-mono fill-error font-bold">OVERFLOW (KEYS &gt; 3)</text>
          )}
        </g>
      </svg>
    );
  };

  const renderBPlusTreeVisual = () => {
    // Leaf Level Link
    // Root at (250, 45)
    // Leaves at (60, 160), (195, 160), (330, 160)
    const getLeafStyle = (idx: number) => {
      if (visStep === 0 && idx === 2) return 'stroke-accent-tertiary fill-accent-tertiary/15 text-accent-tertiary';
      if (visStep === 1 && idx === 2) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      if (visStep === 2 && idx === 0) return 'stroke-accent-tertiary fill-accent-tertiary/15 text-accent-tertiary';
      
      if (visStep === 3) {
        if (idx === 0) return 'stroke-accent-tertiary/30 fill-accent-tertiary/5 text-accent-tertiary opacity-70';
        if (idx === 1) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      }
      
      if (visStep === 4) {
        if (idx === 0 || idx === 1) return 'stroke-accent-tertiary/30 fill-accent-tertiary/5 text-accent-tertiary opacity-70';
        if (idx === 2) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      }

      return 'stroke-border-default fill-bg-secondary text-text-secondary';
    };

    const getLinkStyle = (linkIdx: number) => {
      if (visStep === 3 && linkIdx === 0) return 'stroke-accent-tertiary stroke-[2.5]';
      if (visStep === 4 && linkIdx === 1) return 'stroke-accent-tertiary stroke-[2.5]';
      return 'stroke-text-muted/40';
    };

    return (
      <svg className="w-full h-[320px]" viewBox="0 0 500 320">
        {/* Draw Connectors */}
        <line x1="250" y1="45" x2="110" y2="160" className="stroke-text-muted/20" strokeWidth="2" />
        <line x1="250" y1="45" x2="250" y2="160" className="stroke-text-muted/20" strokeWidth="2" />
        <line x1="250" y1="45" x2="380" y2="160" className="stroke-text-muted/20" strokeWidth="2" />

        {/* Root Router Index */}
        <g transform="translate(205, 25)">
          <rect width="90" height="34" rx="6" className={`stroke-2 ${visStep === 0 || visStep === 2 ? 'stroke-accent-tertiary fill-accent-tertiary/10 text-accent-tertiary' : 'stroke-border-default fill-bg-secondary text-text-secondary'}`} />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[30]</text>
          <text x="45" y="-8" textAnchor="middle" fontSize="10" className="font-mono fill-text-muted font-bold">ROUTER INDEX</text>
        </g>

        {/* Leaf 0 [10|20] */}
        <g transform="translate(65, 160)">
          <rect width="90" height="34" rx="6" className={`stroke-2 ${getLeafStyle(0)}`} />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[10 | 20]</text>
        </g>

        {/* Leaf 1 [30] */}
        <g transform="translate(205, 160)">
          <rect width="90" height="34" rx="6" className={`stroke-2 ${getLeafStyle(1)}`} />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[30]</text>
        </g>

        {/* Leaf 2 [40|50] */}
        <g transform="translate(345, 160)">
          <rect width="90" height="34" rx="6" className={`stroke-2 ${getLeafStyle(2)}`} />
          <text x="45" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">[40 | 50]</text>
        </g>

        {/* Leaf Links (Bi-directional Linked Leaf Level) */}
        <path d="M 155 172 Q 185 160 205 172" fill="none" className={`${getLinkStyle(0)} stroke-2`} markerEnd="url(#arrow)" />
        <path d="M 295 172 Q 325 160 345 172" fill="none" className={`${getLinkStyle(1)} stroke-2`} markerEnd="url(#arrow)" />

        <text x="250" y="250" textAnchor="middle" fontSize="11" className="font-mono fill-accent-tertiary font-bold tracking-widest uppercase">
          {visStep >= 2 ? "LEAF LINKS EMPOWER O(1) RANGE SCANS" : "DATA RESIDES EXCLUSIVELY AT LEAF LEVEL"}
        </text>
      </svg>
    );
  };

  const renderLSMTreeVisual = () => {
    // LSM Write buffer vs SSTable files on disk
    // MemTable box at top
    // SSTable blocks at bottom
    
    const getMemTableStyle = () => {
      if (visStep === 0) return 'stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary';
      if (visStep === 1) return 'stroke-accent-tertiary fill-accent-tertiary/5 text-text-muted/60 animate-pulse';
      return 'stroke-border-default fill-bg-secondary/40 text-text-muted';
    };

    return (
      <svg className="w-full h-[320px]" viewBox="0 0 500 320">
        {/* Render Memory Boundary */}
        <rect x="25" y="20" width="450" height="90" rx="8" fill="none" className="stroke-border-default/20 stroke-dashed" />
        <text x="35" y="38" fontSize="10" className="font-mono fill-accent-tertiary font-bold tracking-wider">MEMTABLE (RAM BUFFER)</text>

        {/* MemTable Content Box */}
        <g transform="translate(180, 50)">
          <rect width="140" height="34" rx="6" className={`stroke-2 ${getMemTableStyle()}`} />
          <text x="70" y="21" fill="currentColor" textAnchor="middle" fontSize="13" className="font-mono font-bold">
            {visStep === 0 ? "[User123]" : "Empty"}
          </text>
        </g>

        {/* Flush Arrow Indicator */}
        {visStep === 1 && (
          <g>
            <path d="M 250 84 L 250 145" className="stroke-accent-tertiary stroke-2 fill-none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
            <text x="260" y="120" fontSize="10" className="font-mono fill-accent-tertiary font-bold">FLUSHING...</text>
          </g>
        )}

        {/* Disk Boundary */}
        <rect x="25" y="150" width="450" height="150" rx="8" fill="none" className="stroke-border-default/20 stroke-dashed" />
        <text x="35" y="168" fontSize="10" className="font-mono fill-text-muted font-bold tracking-wider">DISK SSTABLES</text>

        {/* SSTables Display depending on step */}
        {visStep === 1 && (
          <g transform="translate(180, 200)">
            <rect width="140" height="38" rx="6" className="stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary stroke-2" />
            <text x="70" y="23" fill="currentColor" textAnchor="middle" fontSize="12" className="font-mono font-bold text-accent-tertiary">SSTable 1: [User123]</text>
          </g>
        )}

        {visStep === 2 && (
          <g transform="translate(32, 200)">
            {/* SSTable 1 */}
            <g transform="translate(0, 0)">
              <rect width="135" height="38" rx="6" className="stroke-accent-tertiary/50 fill-none stroke-2" />
              <text x="67.5" y="23" fill="currentColor" textAnchor="middle" fontSize="11" className="font-mono font-bold text-accent-tertiary">SSTable 1: [User123]</text>
            </g>
            {/* SSTable 2 */}
            <g transform="translate(150, 0)">
              <rect width="135" height="38" rx="6" className="stroke-accent-tertiary/50 fill-none stroke-2" />
              <text x="67.5" y="23" fill="currentColor" textAnchor="middle" fontSize="11" className="font-mono font-bold text-accent-tertiary">SSTable 2: [User456]</text>
            </g>
            {/* SSTable 3 */}
            <g transform="translate(300, 0)">
              <rect width="135" height="38" rx="6" className="stroke-accent-tertiary/50 fill-none stroke-2" />
              <text x="67.5" y="23" fill="currentColor" textAnchor="middle" fontSize="10" className="font-mono font-bold text-accent-tertiary">SSTable 3: [User123 (v2)]</text>
            </g>
          </g>
        )}

        {visStep === 3 && (
          <g>
            <g transform="translate(150, 210)">
              <rect width="200" height="42" rx="6" className="stroke-accent-tertiary fill-accent-tertiary/20 text-accent-tertiary stroke-2 animate-pulse" />
              <text x="100" y="19" fill="currentColor" textAnchor="middle" fontSize="12" className="font-mono font-bold text-accent-tertiary">COMPACTED SSTABLE</text>
              <text x="100" y="31" fill="currentColor" textAnchor="middle" fontSize="9" className="font-mono opacity-80 text-accent-tertiary">[User123 (v2), User456]</text>
            </g>
            <text x="250" y="185" textAnchor="middle" fontSize="10" className="font-mono fill-accent-tertiary font-bold">COMPACTION REMOVES DELETED/DUPLICATED KEYS</text>
          </g>
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
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-tertiary hover:text-accent-tertiary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-accent-tertiary drop-shadow-[0_0_2px_rgba(255,224,74,0.3)]">Database Trees</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              B-Trees, B+ Trees, and Log-Structured Merge Trees for Storage block I/O
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Database className="text-accent-tertiary opacity-70" size={24} />
            <h2 className="text-2xl font-bold font-display text-text-primary">
              1. Interactive Visualization
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Operations switch tabs */}
          <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
            <button
              onClick={() => handleTabChange('btree')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'btree' 
                  ? 'border-accent-tertiary text-accent-tertiary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              B-Tree
            </button>
            <button
              onClick={() => handleTabChange('bplustree')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'bplustree' 
                  ? 'border-accent-tertiary text-accent-tertiary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              B+ Tree
            </button>
            <button
              onClick={() => handleTabChange('lsmtree')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'lsmtree' 
                  ? 'border-accent-tertiary text-accent-tertiary' 
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              LSM Tree
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
                  <AlertCircle className="text-accent-tertiary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {/* Pseudocode panel */}
                <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                  <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1 select-none">
                    pseudocode
                  </div>

                  {activeVisTab === 'btree' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>search(node, key): traverse child ranges</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>insert(key): insert into leaf in-order</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>&nbsp;&nbsp;if node keys &gt; MAX_KEYS (overflow):</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;split(node) & promote middle key up</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'bplustree' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>search(key): navigate routers to leaf</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;scan leaf keys for direct matches</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>range_query(L, R): find leaf of L</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 6 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">4</span>
                        <span>&nbsp;&nbsp;while current_key &lt;= R: output value</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 7 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">5</span>
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;move to next leaf using level links</span>
                      </div>
                    </div>
                  )}

                  {activeVisTab === 'lsmtree' && (
                    <div className="space-y-1 text-sm font-mono select-none">
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">1</span>
                        <span>insert(key, value): write to MemTable (RAM)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">2</span>
                        <span>&nbsp;&nbsp;if full: flush sorted to SSTable (Disk)</span>
                      </div>
                      <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-tertiary/10 border-l-2 border-accent-tertiary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                        <span className="text-text-muted select-none w-3 text-right">3</span>
                        <span>compact(SSTables): merge & remove duplicates</span>
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
                {activeVisTab === 'btree' && renderBTreeVisual()}
                {activeVisTab === 'bplustree' && renderBPlusTreeVisual()}
                {activeVisTab === 'lsmtree' && renderLSMTreeVisual()}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Database Trees Quiz
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-yellow" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
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
                    let optionStyle = "border border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary";
                    if (selectedOption === idx) {
                      if (isAnswered) {
                        optionStyle = idx === activeQuestions[currentQuizQuestion].answer
                          ? "border border-success bg-success/10 text-success shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                          : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,224,74,0.15)]";
                      } else {
                        optionStyle = "border border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary shadow-[0_0_12px_rgba(255,224,74,0.15)]";
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
                      className="w-full py-4 bg-accent-tertiary text-bg-primary font-mono font-bold text-xl tracking-wider uppercase rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,224,74,0.25)] hover:shadow-[0_0_25px_rgba(255,224,74,0.45)] cursor-pointer"
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
              <Award className="text-accent-tertiary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-tertiary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleRetryQuiz}
                  className="px-14 py-4 bg-bg-secondary border border-border-default text-text-primary font-mono font-bold text-base tracking-wider uppercase rounded-lg hover:border-accent-tertiary/50 hover:text-accent-tertiary transition-all cursor-pointer"
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
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent-tertiary" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
