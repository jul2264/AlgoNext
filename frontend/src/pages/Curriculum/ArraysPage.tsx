import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Layers, Play, Pause, SkipForward, RotateCcw, 
  Award 
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface VisStep {
  step: number;
  description: string;
  array: (number | null)[];
  activeIndex?: number;
  pointers?: { label: string; index: number; }[];
  highlightIndices?: number[];
  newArray?: (number | null)[] | null;
  line: number;
}

// Visualizer steps configuration
const VISUALIZATION_STEPS: Record<'traversal' | 'insertion' | 'deletion' | 'growth', VisStep[]> = {
  traversal: [
    {
      step: 0,
      description: 'Initial state of the array. The array is stored contiguously in memory with indices 0 to 3.',
      array: [5, 10, 15, 20],
      activeIndex: -1,
      pointers: [],
      line: 0
    },
    {
      step: 1,
      description: 'Accessing index 0: element value is 5.',
      array: [5, 10, 15, 20],
      activeIndex: 0,
      pointers: [{ label: 'i = 0', index: 0 }],
      line: 2
    },
    {
      step: 2,
      description: 'Accessing index 1: element value is 10.',
      array: [5, 10, 15, 20],
      activeIndex: 1,
      pointers: [{ label: 'i = 1', index: 1 }],
      line: 2
    },
    {
      step: 3,
      description: 'Accessing index 2: element value is 15.',
      array: [5, 10, 15, 20],
      activeIndex: 2,
      pointers: [{ label: 'i = 2', index: 2 }],
      line: 2
    },
    {
      step: 4,
      description: 'Accessing index 3: element value is 20.',
      array: [5, 10, 15, 20],
      activeIndex: 3,
      pointers: [{ label: 'i = 3', index: 3 }],
      line: 2
    },
    {
      step: 5,
      description: 'Linear array traversal is now complete.',
      array: [5, 10, 15, 20],
      activeIndex: -1,
      pointers: [],
      line: 0
    }
  ],
  insertion: [
    {
      step: 0,
      description: 'Initial array of size 4 inside a block with space. Target: Insert 25 at index 2.',
      array: [10, 20, 30, 40, null],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [],
      line: 1
    },
    {
      step: 1,
      description: 'Shift elements to the right starting from the end. Shift 40 from index 3 to index 4.',
      array: [10, 20, 30, null, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [3, 4],
      line: 3
    },
    {
      step: 2,
      description: 'Shift 30 from index 2 to index 3. This opens up index 2.',
      array: [10, 20, null, 30, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [2, 3],
      line: 3
    },
    {
      step: 3,
      description: 'Insert value 25 at the newly vacated index 2.',
      array: [10, 20, 25, 30, 40],
      activeIndex: 2,
      pointers: [{ label: 'Insert', index: 2 }],
      highlightIndices: [2],
      line: 4
    },
    {
      step: 4,
      description: 'Insertion complete. Array is now [10, 20, 25, 30, 40].',
      array: [10, 20, 25, 30, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [],
      line: 0
    }
  ],
  deletion: [
    {
      step: 0,
      description: 'Initial array. Target: Delete element at index 1 (value 20).',
      array: [10, 20, 30, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [],
      line: 1
    },
    {
      step: 1,
      description: 'Remove element at index 1. This creates a hole.',
      array: [10, null, 30, 40],
      activeIndex: 1,
      pointers: [{ label: 'Delete', index: 1 }],
      highlightIndices: [1],
      line: 2
    },
    {
      step: 2,
      description: 'Shift element at index 2 (30) left to index 1.',
      array: [10, 30, null, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [1, 2],
      line: 3
    },
    {
      step: 3,
      description: 'Shift element at index 3 (40) left to index 2.',
      array: [10, 30, 40, null],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [2, 3],
      line: 3
    },
    {
      step: 4,
      description: 'Deletion complete. The size is reduced, resulting in [10, 30, 40].',
      array: [10, 30, 40],
      activeIndex: -1,
      pointers: [],
      highlightIndices: [],
      line: 0
    }
  ],
  growth: [
    {
      step: 0,
      description: 'The dynamic array is full. Capacity = 4, Elements = 4.',
      array: [1, 2, 3, 4],
      newArray: null,
      pointers: [],
      highlightIndices: [],
      line: 1
    },
    {
      step: 1,
      description: 'Allocate a new larger memory block. Typically double the capacity (Capacity = 8).',
      array: [1, 2, 3, 4],
      newArray: [null, null, null, null, null, null, null, null],
      pointers: [],
      highlightIndices: [],
      line: 3
    },
    {
      step: 2,
      description: 'Copy all elements from the old array into the new array.',
      array: [1, 2, 3, 4],
      newArray: [1, 2, 3, 4, null, null, null, null],
      pointers: [],
      highlightIndices: [0, 1, 2, 3],
      line: 4
    },
    {
      step: 3,
      description: 'Free old memory. Point the array reference to the new block.',
      array: [1, 2, 3, 4, null, null, null, null],
      newArray: null,
      pointers: [],
      highlightIndices: [],
      line: 5
    }
  ]
};

// MCQ Quiz Database
const QUIZ_QUESTIONS = [
  {
    question: "Arrays store elements in:",
    options: ["Random memory locations", "Tree structures", "Contiguous memory", "Graph nodes"],
    answer: 2,
    explanation: "Arrays store elements adjacent to each other in a continuous block of memory, allowing index-based offset calculations."
  },
  {
    question: "What is the time complexity of array index access?",
    options: ["O(N)", "O(log N)", "O(1)", "O(N²)"],
    answer: 2,
    explanation: "Accessing an array element by index is a constant-time O(1) operation because the memory address is calculated directly via Address = Base + (Index × Element Size)."
  },
  {
    question: "Which operation may require shifting elements?",
    options: ["Traversal", "Access", "Insertion", "Search"],
    answer: 2,
    explanation: "Inserting an element in the middle or at the beginning of an array requires shifting subsequent elements to the right to create an empty slot."
  },
  {
    question: "What is the worst-case search complexity in an unsorted array?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N²)"],
    answer: 2,
    explanation: "In an unsorted array, we must search sequentially from start to end. In the worst case, the element is at the end or not present at all, requiring O(N) operations."
  },
  {
    question: "Which search algorithm requires sorted arrays?",
    options: ["Linear Search", "DFS", "Binary Search", "BFS"],
    answer: 2,
    explanation: "Binary Search requires the array to be sorted because it relies on comparing the middle element to divide the search range in half."
  },
  {
    question: "Binary Search complexity is:",
    options: ["O(N)", "O(log N)", "O(N²)", "O(1)"],
    answer: 1,
    explanation: "Binary Search repeatedly divides the active search interval in half. The maximum number of halvings required for N elements is log2(N), giving O(log N) complexity."
  },
  {
    question: "Arrays are best suited for:",
    options: ["Random access", "Dynamic node insertion", "Graph traversal", "Pointer manipulation"],
    answer: 0,
    explanation: "Arrays provide immediate, constant-time O(1) random access to any element by index, making them ideal for lookups."
  },
  {
    question: "What happens during insertion at the beginning?",
    options: ["Elements shift right", "Elements shift left", "Array reverses", "Nothing changes"],
    answer: 0,
    explanation: "To insert a new element at index 0, all existing elements must be shifted one position to the right (to higher indices) to make room."
  },
  {
    question: "Which structure internally powers Python lists?",
    options: ["Linked List", "Dynamic Array", "Stack", "Trie"],
    answer: 1,
    explanation: "Python lists are implemented internally as dynamic arrays that automatically resize when they grow beyond their current capacity."
  },
  {
    question: "Arrays are cache-friendly because:",
    options: ["They use pointers", "Elements are contiguous", "They use recursion", "They are dynamic"],
    answer: 1,
    explanation: "Because array elements are stored contiguously in memory, loading one element pulls adjacent elements into the CPU cache (spatial locality), making traversal extremely fast."
  },
  {
    question: "Which operation is amortized O(1)?",
    options: ["Insert at beginning", "Insert at end", "Search", "Delete at beginning"],
    answer: 1,
    explanation: "Inserting at the end of a dynamic array is O(1) most of the time. When the array is full, it resizes (taking O(N) time), but because this happens infrequently, the average (amortized) cost is O(1)."
  },
  {
    question: "Which array type stores rows and columns?",
    options: ["1D Array", "Dynamic Array", "2D Array", "Circular Array"],
    answer: 2,
    explanation: "A 2D array represents a matrix or grid structure, storing elements in rows and columns."
  },
  {
    question: "Which formula calculates array element addresses?",
    options: ["Node × Pointer", "Base + (Index × Size)", "Size ÷ Index", "Index²"],
    answer: 1,
    explanation: "The address of an element at a given index is: Base Address + (Index × Element Size). This mathematical calculation is why access is O(1)."
  },
  {
    question: "What is the primary disadvantage of arrays?",
    options: ["Fast access", "Contiguous memory requirement", "Sequential storage", "Efficient traversal"],
    answer: 1,
    explanation: "Traditional arrays require a single, contiguous block of memory. If memory is fragmented, allocating a large array may fail even if the total free memory is sufficient."
  },
  {
    question: "Which problem commonly uses arrays?",
    options: ["Two Sum", "Tree Diameter", "Graph Coloring", "AVL Rotation"],
    answer: 0,
    explanation: "The 'Two Sum' problem operates directly on a list or array of numbers to find a pair adding up to a target sum."
  },
  {
    question: "Which operation removes the last array element?",
    options: ["append()", "pop()", "push()", "enqueue()"],
    answer: 1,
    explanation: "`pop()` removes and returns the last element of an array, which is a constant-time O(1) operation."
  },
  {
    question: "Dynamic arrays resize by:",
    options: ["Reversing elements", "Pointer swapping", "Allocating larger memory", "Using stacks"],
    answer: 2,
    explanation: "When a dynamic array is full, it resizes by allocating a new, larger memory block (usually double the size), copying the old elements to it, and freeing the old block."
  },
  {
    question: "Arrays are heavily used in:",
    options: ["Image Processing", "Graph Databases", "Blockchain Mining", "Networking only"],
    answer: 0,
    explanation: "Images are composed of grids of pixels. These are naturally stored and processed as 2D or 3D arrays of color values."
  },
  {
    question: "Which traversal visits every element once?",
    options: ["DFS", "BFS", "Linear Traversal", "AVL Traversal"],
    answer: 2,
    explanation: "A linear traversal (or sequential iteration) visits every element in the array exactly once from index 0 to N-1."
  },
  {
    question: "Which structure is most efficient for indexed lookup?",
    options: ["Linked List", "Queue", "Array", "Graph"],
    answer: 2,
    explanation: "An array is the most efficient structure for indexed lookups since it retrieves elements in constant time O(1), whereas linked lists require O(N) traversal."
  }
];

// Multi-language code implementations


export function ArraysPage() {
  const navigate = useNavigate();

  // Progress management (8 modules checkpoints)
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('dsa_progress_arrays');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load arrays progress:', e);
    }
    return { 1: false, 2: false };
  });

  const setSectionCompleted = (sectionNum: number, isCompleted: boolean) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: isCompleted };
      localStorage.setItem('dsa_progress_arrays', JSON.stringify(updated));
      return updated;
    });
  };

  // Visualization state
  const [activeVisTab, setActiveVisTab] = useState<'traversal' | 'insertion' | 'deletion' | 'growth'>('traversal');
  const [visStep, setVisStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<any>(null);

  useEffect(() => {
    setVisStep(0);
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    }
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
              Arrays in <span className="text-accent-secondary">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Contiguous memory allocation and random access
            </p>
          </div>
        </div>
      </PageHeader>

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
          <div className="flex border-b border-border-default/50 gap-4 overflow-x-auto">
            {(['traversal', 'insertion', 'deletion', 'growth'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveVisTab(tab)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap ${
                  activeVisTab === tab ? 'border-accent-primary text-accent-primary' : 'border-transparent text-text-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-text-secondary uppercase">Step {visStep + 1} of {activeSteps.length}</span>
                <div className="flex gap-2">
                  <button onClick={handleReset} className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors"><RotateCcw size={16} /></button>
                  <button onClick={handlePrev} className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors"><SkipForward size={16} className="rotate-180" /></button>
                  <button onClick={handlePlayToggle} className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors">{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
                  <button onClick={handleNext} className="p-2.5 bg-transparent rounded-lg hover:text-accent-primary transition-colors"><SkipForward size={16} /></button>
                </div>
              </div>

              <div className="bg-bg-secondary rounded-xl border border-border-default p-4 text-sm text-text-secondary">
                {activeStepData.description}
              </div>

              <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm overflow-hidden p-4">
                {activeVisTab === 'traversal' && (
                  <div className="space-y-1">
                    <div className={activeStepData.line === 1 ? 'text-accent-primary font-bold' : ''}>1: FOR i FROM 0 TO N-1</div>
                    <div className={activeStepData.line === 2 ? 'text-accent-primary font-bold' : ''}>2: ACCESS arr[i]</div>
                  </div>
                )}
                {activeVisTab === 'insertion' && (
                  <div className="space-y-1">
                    <div className={activeStepData.line === 2 ? 'text-accent-primary font-bold' : ''}>1: FOR i FROM last DOWNTO idx</div>
                    <div className={activeStepData.line === 3 ? 'text-accent-primary font-bold' : ''}>2: arr[i+1] = arr[i]</div>
                    <div className={activeStepData.line === 4 ? 'text-accent-primary font-bold' : ''}>3: arr[idx] = target</div>
                  </div>
                )}
                {activeVisTab === 'deletion' && (
                  <div className="space-y-1">
                    <div className={activeStepData.line === 2 ? 'text-accent-primary font-bold' : ''}>1: FOR i FROM idx TO last-1</div>
                    <div className={activeStepData.line === 3 ? 'text-accent-primary font-bold' : ''}>2: arr[i] = arr[i+1]</div>
                  </div>
                )}
                {activeVisTab === 'growth' && (
                  <div className="space-y-1">
                    <div className={activeStepData.line === 1 ? 'text-accent-primary font-bold' : ''}>1: IF full:</div>
                    <div className={activeStepData.line === 2 ? 'text-accent-primary font-bold' : ''}>2: new_arr = alloc(cap*2)</div>
                    <div className={activeStepData.line === 4 ? 'text-accent-primary font-bold' : ''}>3: copy(arr, new_arr)</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center items-center min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl p-6">
              <div className="flex items-center gap-1">
                {activeStepData.array.map((val, idx) => (
                  <div key={idx} className={`w-10 h-10 border rounded flex items-center justify-center font-mono ${activeStepData.activeIndex === idx ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-secondary'}`}>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[2] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              2. Arrays Quiz
            </h2>
          </div>
        </div>

        <div className="neon-card neon-card-pink" style={{ paddingTop: '0.75rem', paddingBottom: '1.5rem', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}>
          {activeQuestions.length > 0 && !quizFinished ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-start items-center">
                <span className="text-xl font-mono text-accent-primary uppercase tracking-wider">
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
                      onClick={() => {
                        if (currentQuizQuestion < activeQuestions.length - 1) {
                          setCurrentQuizQuestion(prev => prev + 1);
                          setSelectedOption(null);
                          setIsAnswered(false);
                        } else {
                          setQuizFinished(true);
                          setSectionCompleted(2, true);
                        }
                      }}
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
                    onClick={() => {
                      setIsAnswered(true);
                      if (selectedOption === activeQuestions[currentQuizQuestion].answer) {
                        setScore(prev => prev + 1);
                      }
                    }}
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
              <Award className="text-accent-primary animate-pulse" size={64} />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Quiz Completed!</h3>
                <p className="text-sm text-text-secondary mt-2">
                  You scored <span className="text-accent-primary font-bold font-mono">{score}</span> out of <span className="text-text-primary font-mono">{activeQuestions.length}</span>.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
                    setActiveQuestions(shuffled.slice(0, 5));
                    setCurrentQuizQuestion(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setScore(0);
                    setQuizFinished(false);
                  }}
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
