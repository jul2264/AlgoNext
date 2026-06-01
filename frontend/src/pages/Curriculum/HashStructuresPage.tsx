import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  hashDetails?: string;
  tableData: { index: number; value: string; chain?: string[] }[];
  highlightIndex?: number;
  flowActiveStep?: number;
}

// Visualizer steps configuration
const VISUALIZATION_STEPS: Record<
  'basic' | 'search' | 'collision' | 'chaining' | 'open-addressing' | 'map' | 'set' | 'flow',
  VisStep[]
> = {
  basic: [
    {
      step: 0,
      description: 'Let\'s insert the key "APPLE" into our Hash Table. First, we compute its index using the Hash Function.',
      hashDetails: 'hash("APPLE") = 3',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ]
    },
    {
      step: 1,
      description: 'Now, we jump directly to the generated index 3 in O(1) time and write the value "APPLE" to the slot.',
      hashDetails: 'table[3] = "APPLE"',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    }
  ],
  search: [
    {
      step: 0,
      description: 'We want to search for "APPLE" in the Hash Table. First, we run "APPLE" through the Hash Function.',
      hashDetails: 'hash("APPLE") = 3',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ]
    },
    {
      step: 1,
      description: 'We go directly to bucket index 3 in O(1) time, bypassing all other slots.',
      hashDetails: 'Go directly to: table[3]',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    },
    {
      step: 2,
      description: 'The element stored at index 3 matches our key "APPLE". The search is successful!',
      hashDetails: 'Result: APPLE found',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    }
  ],
  collision: [
    {
      step: 0,
      description: 'Suppose the key "APPLE" is already stored in the hash table at index 3.',
      hashDetails: 'hash("APPLE") = 3',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ]
    },
    {
      step: 1,
      description: 'Now, we want to insert "MANGO". We run it through our Hash Function, which also generates index 3.',
      hashDetails: 'hash("MANGO") = 3',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    },
    {
      step: 2,
      description: 'Since index 3 is already occupied, inserting "MANGO" here triggers a Collision.',
      hashDetails: 'Collision! Two keys map to index 3.',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'Collision!' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    }
  ],
  chaining: [
    {
      step: 0,
      description: 'Separate Chaining solves collisions by storing multiple keys in a Linked List at that bucket index.',
      hashDetails: 'Index 3 stores values dynamically',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE', chain: [] },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ]
    },
    {
      step: 1,
      description: 'When "MANGO" collides at index 3, it is appended to the linked list chain at table[3].',
      hashDetails: 'APPLE → MANGO',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE', chain: ['MANGO'] },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    },
    {
      step: 2,
      description: 'If "BANANA" also hashes to index 3, it is appended next. Multiple values occupy index 3.',
      hashDetails: 'APPLE → MANGO → BANANA',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE', chain: ['MANGO', 'BANANA'] },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    }
  ],
  'open-addressing': [
    {
      step: 0,
      description: 'Open Addressing finds a collision, and searches for the next available slot (Linear Probing).',
      hashDetails: 'hash("MANGO") = 3 (occupied by "APPLE")',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 3
    },
    {
      step: 1,
      description: 'Since index 3 is occupied, we search the next slot (index 4) for an empty position.',
      hashDetails: '3 occupied → try index 4',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 4
    },
    {
      step: 2,
      description: 'Index 4 is empty, so we store "MANGO" here. The conflict is resolved.',
      hashDetails: 'table[4] = "MANGO"',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: 'APPLE' },
        { index: 4, value: 'MANGO' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 4
    }
  ],
  map: [
    {
      step: 0,
      description: 'A Hash Map structures information in Key-Value pairs: { "name": "John", "age": 20 }.',
      hashDetails: 'Storage layout mapping',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: '-' },
        { index: 2, value: '-' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ]
    },
    {
      step: 1,
      description: 'We store Key "name". hash("name") yields index 1. table[1] stores Key-Value pair [name: John].',
      hashDetails: 'hash("name") → bucket 1',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: 'name: John' },
        { index: 2, value: '-' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 1
    },
    {
      step: 2,
      description: 'We store Key "age". hash("age") yields index 4. table[4] stores Key-Value pair [age: 20].',
      hashDetails: 'hash("age") → bucket 4',
      tableData: [
        { index: 0, value: '-' },
        { index: 1, value: 'name: John' },
        { index: 2, value: '-' },
        { index: 3, value: '-' },
        { index: 4, value: 'age: 20' },
        { index: 5, value: '-' }
      ],
      highlightIndex: 4
    }
  ],
  set: [
    {
      step: 0,
      description: 'A Hash Set stores unique elements: {10, 20, 30}. Key-value mapping is unused.',
      hashDetails: 'Set elements stored at hashed slots',
      tableData: [
        { index: 0, value: '30' },
        { index: 1, value: '-' },
        { index: 2, value: '10' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '20' }
      ]
    },
    {
      step: 1,
      description: 'We try to insert 20 again. Hashing 20 maps to index 5, which already contains 20.',
      hashDetails: 'hash(20) = 5 (Occupied)',
      tableData: [
        { index: 0, value: '30' },
        { index: 1, value: '-' },
        { index: 2, value: '10' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '20' }
      ],
      highlightIndex: 5
    },
    {
      step: 2,
      description: 'Because the value 20 is already present in the set, the duplicate insertion is ignored.',
      hashDetails: 'Insert 20 again → ignored',
      tableData: [
        { index: 0, value: '30' },
        { index: 1, value: '-' },
        { index: 2, value: '10' },
        { index: 3, value: '-' },
        { index: 4, value: '-' },
        { index: 5, value: '20' }
      ],
      highlightIndex: 5
    }
  ],
  flow: [
    {
      step: 0,
      description: 'Key Entered: The user enters a key search parameter (e.g. "APPLE").',
      hashDetails: 'Key: "APPLE"',
      tableData: [],
      flowActiveStep: 0
    },
    {
      step: 1,
      description: 'Hash Function: The entered key passes into the hashing algorithm.',
      hashDetails: 'hash("APPLE")',
      tableData: [],
      flowActiveStep: 1
    },
    {
      step: 2,
      description: 'Generate Index: The hash function maps the string key into a specific array slot index.',
      hashDetails: 'Index = 3',
      tableData: [],
      flowActiveStep: 2
    },
    {
      step: 3,
      description: 'Direct Bucket Access: The algorithm references bucket 3 in memory instantly (O(1)).',
      hashDetails: 'table[3] accessed directly',
      tableData: [],
      flowActiveStep: 3
    }
  ]
};

// Quiz questions setup (20 MCQs)
const QUIZ_QUESTIONS = [
  {
    question: "What is hashing primarily used for?",
    options: ["Sorting", "Fast data retrieval", "Graph traversal", "Matrix multiplication"],
    answer: 1,
    explanation: "Hashing maps keys to indices directly, enabling constant-time fast data retrieval."
  },
  {
    question: "What does a hash function generate?",
    options: ["Linked List", "Tree Node", "Index/Bucket", "Queue"],
    answer: 2,
    explanation: "A hash function maps keys to a specific integer index or bucket inside a hash table."
  },
  {
    question: "Which structure stores key-value pairs?",
    options: ["Stack", "Queue", "Hash Map", "Trie"],
    answer: 2,
    explanation: "A Hash Map associates unique keys with specific values via hash functions."
  },
  {
    question: "Which structure stores only unique values?",
    options: ["Array", "Hash Set", "Stack", "Heap"],
    answer: 1,
    explanation: "A Hash Set uses hashing internally to check for duplicates and stores unique elements only."
  },
  {
    question: "Average-case hash lookup complexity is:",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Direct index mapping resolves lookups in constant O(1) time on average."
  },
  {
    question: "What is a collision in hashing?",
    options: ["Duplicate array", "Two keys mapping to same index", "Stack overflow", "Queue underflow"],
    answer: 1,
    explanation: "A collision happens when two distinct keys yield the same index output from the hash function."
  },
  {
    question: "Which collision method uses linked lists?",
    options: ["DFS", "Chaining", "Heapify", "Recursion"],
    answer: 1,
    explanation: "Separate Chaining appends colliding elements to a linked list attached to the bucket index."
  },
  {
    question: "Which collision method searches for another empty slot?",
    options: ["Chaining", "Open Addressing", "Binary Search", "DFS"],
    answer: 1,
    explanation: "Open Addressing (such as Linear Probing) searches sequentially for the next vacant slot when a collision occurs."
  },
  {
    question: "Hashing avoids:",
    options: ["Memory allocation", "Sequential searching", "Recursion", "Sorting"],
    answer: 1,
    explanation: "By computing indices directly, hashing avoids O(N) sequential searches across the collection."
  },
  {
    question: "Which application uses hashing heavily?",
    options: ["Caching", "DFS only", "AVL Rotation", "Binary Trees only"],
    answer: 0,
    explanation: "Caches rely on hash tables to store and retrieve temporary data instantly."
  },
  {
    question: "Which structure powers dictionaries in Python?",
    options: ["Stack", "Queue", "Hash Map", "Heap"],
    answer: 2,
    explanation: "Python dictionaries (dicts) are built internally using Hash Maps."
  },
  {
    question: "What is stored inside a hash table bucket?",
    options: ["Keys/Values", "Trees only", "Graphs only", "Queues only"],
    answer: 0,
    explanation: "Buckets store the key-value structures mapped to that particular hash index."
  },
  {
    question: "Which operation is fastest in hash tables?",
    options: ["Linear Traversal", "Binary Search", "Direct Lookup", "DFS"],
    answer: 2,
    explanation: "Direct lookup using computed hash indices runs instantly, taking O(1) time."
  },
  {
    question: "Worst-case hashing complexity occurs because of:",
    options: ["Trees", "Collisions", "Arrays", "Sorting"],
    answer: 1,
    explanation: "Severe collisions can degrade performance to O(N) if many elements map to a single index."
  },
  {
    question: "Which structure helps detect duplicates efficiently?",
    options: ["Stack", "Queue", "Hash Set", "Linked List"],
    answer: 2,
    explanation: "A Hash Set searches for the element using hashing, allowing O(1) duplicate checks."
  },
  {
    question: "Which field commonly uses cryptographic hashing?",
    options: ["Blockchain", "BFS", "Heap Sort", "Segment Trees"],
    answer: 0,
    explanation: "Cryptographic hash functions connect ledger transaction blocks securely in blockchains."
  },
  {
    question: "What maps keys to indices?",
    options: ["Queue", "Hash Function", "Stack Pointer", "DFS"],
    answer: 1,
    explanation: "The Hash Function is the mathematical mapping logic converting keys to indexes."
  },
  {
    question: "Which structure internally supports session storage?",
    options: ["Trie", "Hash Maps", "AVL Trees", "Segment Trees"],
    answer: 1,
    explanation: "Session storages store session tokens mapping to user profiles using Hash Maps."
  },
  {
    question: "Which probabilistic structure uses hashing?",
    options: ["Heap", "Trie", "Bloom Filter", "BST"],
    answer: 2,
    explanation: "A Bloom Filter uses multiple hash functions to check element set membership probabilistically."
  },
  {
    question: "Why is hashing efficient?",
    options: ["Uses recursion", "Avoids direct memory access", "Maps keys directly to buckets", "Uses linked traversal"],
    answer: 2,
    explanation: "Hashing computes the bucket address directly from the key, removing traversal search requirements."
  }
];

export function HashStructuresPage() {
  const navigate = useNavigate();

  // Completed sections progress tracker
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_hash_structures');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { 1: false, 2: false };
  });

  const [progressPercent, setProgressPercent] = useState(0);

  // Toggle completed state of a section
  const toggleSection = (sectionId: number) => {
    setCompletedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      localStorage.setItem('dsa_progress_hash_structures', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const SECTION_WEIGHTS: Record<number, number> = { 1: 50, 2: 50 };
    const score = Object.entries(completedSections)
      .filter(([, done]) => done)
      .reduce((sum, [k]) => sum + (SECTION_WEIGHTS[Number(k)] || 0), 0);
    setProgressPercent(score);
    window.dispatchEvent(new Event('storage'));
  }, [completedSections]);

  // Visualizer state
  const [activeVisTab, setActiveVisTab] = useState<'basic' | 'search' | 'collision' | 'chaining' | 'open-addressing' | 'map' | 'set' | 'flow'>('basic');
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

  const handleTabChange = (tab: typeof activeVisTab) => {
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
  const [quizScore, setQuizScore] = useState(0);
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
      setQuizScore(prev => prev + 1);
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
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader 
        centerContent={
          <div className="flex flex-col gap-2 w-full select-none">
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-text-muted">PROGRESS</span>
              <span className="text-accent-tertiary font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2.5 bg-bg-primary rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-accent-tertiary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,224,74,0.3)]" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/dsa')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-tertiary hover:text-accent-tertiary transition-colors group"
          >
            <ChevronLeft size={24} className="opacity-70 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              <span className="text-accent-tertiary drop-shadow-[0_0_2px_rgba(255,224,74,0.3)]">Hash Structures</span> in <span className="text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Fast key-value mapping and index hashing
            </p>
          </div>
        </div>
      </PageHeader>

      {/* SECTION 1: VISUALIZER */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Layers className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[1] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              1. Interactive Visualization
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(1)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[1] 
                ? 'bg-accent-tertiary border-accent-tertiary text-bg-primary shadow-[0_0_15px_rgba(255,224,74,0.35)]' 
                : 'bg-bg-secondary/40 border-accent-tertiary/35 text-accent-tertiary/50 shadow-[0_0_8px_rgba(255,224,74,0.1)] hover:border-accent-tertiary hover:text-accent-tertiary'
            }`}
            title={completedSections[1] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[1] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-yellow flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Tabs */}
          <div className="flex border-b border-border-default/20 gap-4 overflow-x-auto">
            <button
              onClick={() => handleTabChange('basic')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'basic' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Basic Hash Table
            </button>
            <button
              onClick={() => handleTabChange('search')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'search' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => handleTabChange('collision')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'collision' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Collision
            </button>
            <button
              onClick={() => handleTabChange('chaining')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'chaining' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Chaining
            </button>
            <button
              onClick={() => handleTabChange('open-addressing')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'open-addressing' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Open Addressing
            </button>
            <button
              onClick={() => handleTabChange('map')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'map' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Hash Map
            </button>
            <button
              onClick={() => handleTabChange('set')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'set' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Hash Set
            </button>
            <button
              onClick={() => handleTabChange('flow')}
              className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeVisTab === 'flow' ? 'border-accent-tertiary text-accent-tertiary' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}
            >
              Lookup Flow
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold font-mono text-text-secondary uppercase">
                    Step {visStep + 1} of {activeSteps.length}
                  </span>

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

                <div className="bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3" style={{ marginTop: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
                  <AlertCircle className="text-accent-tertiary shrink-0 mt-0.5 opacity-70" size={18} />
                  <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
                </div>

                {activeStepData.hashDetails && (
                  <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-hidden" style={{ marginTop: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
                    <div className="text-[11px] text-text-muted/80 uppercase font-mono font-bold tracking-widest mb-2 border-b border-border-default/45 pb-1.5 select-none">
                      hashing details
                    </div>
                    <div className="text-accent-tertiary font-bold">{activeStepData.hashDetails}</div>
                  </div>
                )}

                {activeVisTab === 'basic' && (
                  <div className="bg-bg-primary border border-border-default/50 rounded-xl font-mono text-sm text-text-muted flex flex-col gap-3 select-none" style={{ marginTop: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
                    <div className="font-bold text-accent-tertiary uppercase text-[11px] tracking-widest border-b border-border-default/30 pb-1.5">
                      Key-Value Storage Concept
                    </div>
                    <div className="flex justify-between items-center py-1 text-base font-semibold">
                      <span className="text-text-primary">"John"</span>
                      <span className="text-text-muted/60">&rarr;</span>
                      <span className="text-accent-tertiary">hash()</span>
                      <span className="text-text-muted/60">&rarr;</span>
                      <span className="text-accent-tertiary">Index 2</span>
                    </div>
                    <div className="text-center bg-bg-secondary/45 py-2 rounded-lg border border-border-default/30 text-text-secondary">
                      Stored at: <span className="text-text-primary font-bold">table[2] = "John"</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex flex-col justify-center items-center min-h-[320px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted select-none">
                <Database size={14} className="opacity-70" />
                <span>HASH TABLE BUFFER</span>
              </div>

              {activeVisTab === 'flow' ? (
                <div className="flex flex-col items-center justify-center p-4 bg-bg-secondary rounded-xl border border-border-default/50 max-w-[18rem] mx-auto w-full gap-1.5 font-mono text-xs select-none">
                  <div className={`py-[3px] px-1 rounded-lg border text-center transition-all duration-300 w-full ${activeStepData.flowActiveStep === 0 ? 'bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary shadow-[0_0_12px_rgba(255,224,74,0.15)] font-bold' : 'border-border-default/40 text-text-secondary'}`}>
                    Key Entered ("APPLE")
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className={`py-[3px] px-1 rounded-lg border text-center transition-all duration-300 w-full ${activeStepData.flowActiveStep === 1 ? 'bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary shadow-[0_0_12px_rgba(255,224,74,0.15)] font-bold' : 'border-border-default/40 text-text-secondary'}`}>
                    Hash Function: hash()
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className={`py-[3px] px-1 rounded-lg border text-center transition-all duration-300 w-full ${activeStepData.flowActiveStep === 2 ? 'bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary shadow-[0_0_12px_rgba(255,224,74,0.15)] font-bold' : 'border-border-default/40 text-text-secondary'}`}>
                    Generate Index (3)
                  </div>
                  <div className="text-text-muted text-xs leading-none">&darr;</div>
                  <div className={`py-[3px] px-1 rounded-lg border text-center transition-all duration-300 w-full ${activeStepData.flowActiveStep === 3 ? 'bg-accent-tertiary/20 border-accent-tertiary text-accent-tertiary shadow-[0_0_12px_rgba(255,224,74,0.15)] font-bold' : 'border-border-default/40 text-text-secondary'}`}>
                    Direct Bucket Access
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full max-w-xs mx-auto mt-4">
                  <div className="grid grid-cols-6 border-b border-border-default/40 text-xs font-mono font-bold text-text-muted pb-2 uppercase tracking-wider select-none text-center">
                    <div className="col-span-2">Index</div>
                    <div className="col-span-4">Value</div>
                  </div>
                  {activeStepData.tableData.map((row) => (
                    <div 
                      key={row.index} 
                      className={`grid grid-cols-6 items-center border rounded-lg p-2 font-mono text-sm transition-all duration-300 ${
                        activeStepData.highlightIndex === row.index 
                          ? 'bg-accent-tertiary/10 border-accent-tertiary text-accent-tertiary shadow-[0_0_10px_rgba(255,224,74,0.15)]' 
                          : 'bg-bg-secondary border-border-default/50 text-text-secondary'
                      }`}
                    >
                      <div className="col-span-2 font-bold text-center border-r border-border-default/30">
                        {row.index}
                      </div>
                      <div className="col-span-4 pl-4 flex items-center justify-between">
                        <span>{row.value}</span>
                        {row.chain && row.chain.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-accent-primary ml-2 shrink-0">
                            <span>&rarr;</span>
                            {row.chain.map((cVal, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 bg-accent-primary/10 border border-accent-primary/30 rounded font-bold text-[10px]">{cVal}</span>
                                {cIdx < row.chain!.length - 1 && <span>&rarr;</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUIZ */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Award className="text-accent-tertiary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Hash Structures Quiz
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
                          : "border border-error bg-error/10 text-error shadow-[0_0_12px_rgba(255,45,120,0.15)]";
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
                  You scored <span className="text-accent-tertiary font-bold font-mono">{quizScore}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
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
    </div>
  );
}
