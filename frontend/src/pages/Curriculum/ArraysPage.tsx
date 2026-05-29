import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, BookOpen, Layers, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle, Check, Award 
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
const CODE_IMPLEMENTATIONS = {
  python: `# --- 1. Array Creation ---
# Initialize an array with default elements
arr = [10, 20, 30, 40]

# --- 2. Insertion ---
# Insert element 15 at index 1
arr.insert(1, 15)  # Result: [10, 15, 20, 30, 40]

# --- 3. Traversal ---
# Iterate through each element in the array
for element in arr:
    print(element)

# --- 4. Access Element ---
# Access element at index 2 (constant time lookup)
val = arr[2]  # Result: 20

# --- 5. Update ---
# Update element at index 3 with a new value
arr[3] = 99  # Result: [10, 15, 20, 99, 40]

# --- 6. Deletion ---
# Remove the element at index 4
arr.pop(4)  # Result: [10, 15, 20, 99]`,

  javascript: `// --- 1. Array Creation ---
// Initialize an array with default elements
const arr = [10, 20, 30, 40];

// --- 2. Insertion ---
// Insert element 15 at index 1
arr.splice(1, 0, 15); // Result: [10, 15, 20, 30, 40]

// --- 3. Traversal ---
// Iterate through each element in the array
for (const element of arr) {
    console.log(element);
}

// --- 4. Access Element ---
// Access element at index 2 (constant time lookup)
const val = arr[2]; // Result: 20

// --- 5. Update ---
// Update element at index 3 with a new value
arr[3] = 99; // Result: [10, 15, 20, 99, 40]

// --- 6. Deletion ---
// Remove the element at index 4
arr.splice(4, 1); // Result: [10, 15, 20, 99]`,

  cpp: `#include <iostream>
#include <vector>

int main() {
    // --- 1. Array Creation ---
    // Initialize a dynamic array (vector) with default elements
    std::vector<int> arr = {10, 20, 30, 40};

    // --- 2. Insertion ---
    // Insert element 15 at index 1
    arr.insert(arr.begin() + 1, 15); // Result: [10, 15, 20, 30, 40]

    // --- 3. Traversal ---
    // Iterate through each element in the array
    for (int element : arr) {
        std::cout << element << std::endl;
    }

    // --- 4. Access Element ---
    // Access element at index 2 (constant time lookup)
    int val = arr[2]; // Result: 20

    // --- 5. Update ---
    // Update element at index 3 with a new value
    arr[3] = 99; // Result: [10, 15, 20, 99, 40]

    // --- 6. Deletion ---
    // Remove the element at index 4
    arr.erase(arr.begin() + 4); // Result: [10, 15, 20, 99]

    return 0;
}`,

  java: `import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // --- 1. Array Creation ---
        // Initialize a dynamic array (ArrayList) with default elements
        ArrayList<Integer> arr = new ArrayList<>(Arrays.asList(10, 20, 30, 40));

        // --- 2. Insertion ---
        // Insert element 15 at index 1
        arr.add(1, 15); // Result: [10, 15, 20, 30, 40]

        // --- 3. Traversal ---
        // Iterate through each element in the array
        for (int element : arr) {
            System.out.println(element);
        }

        // --- 4. Access Element ---
        // Access element at index 2 (constant time lookup)
        int val = arr.get(2); // Result: 20

        // --- 5. Update ---
        // Update element at index 3 with a new value
        arr.set(3, 99); // Result: [10, 15, 20, 99, 40]

        // --- 6. Deletion ---
        // Remove the element at index 4
        arr.remove(4); // Result: [10, 15, 20, 99]
    }
}`
};

// Playground sample codes mapping
const PROBLEM_SAMPLE_CODES = {
  'Two Sum': `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Run Two Sum
nums = [2, 7, 11, 15]
target = 9
print(f"Indices of numbers summing to {target}: {two_sum(nums, target)}")`,

  "Kadane's Algorithm": `def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for num in nums[1:]:
        curr_max = max(num, curr_max + num)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

# Run Maximum Subarray Sum
nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(f"Max contiguous subarray sum: {max_sub_array(nums)}")`,

  'Rotate Array': `def rotate(nums, k):
    n = len(nums)
    k %= n
    nums.reverse()
    nums[:k] = reversed(nums[:k])
    nums[k:] = reversed(nums[k:])
    return nums

# Run Array Rotation
arr = [1, 2, 3, 4, 5, 6, 7]
k = 3
print(f"Array rotated by {k} positions: {rotate(arr, k)}")`,

  'Merge Sorted Arrays': `def merge(nums1, m, nums2, n):
    p1 = m - 1
    p2 = n - 1
    p = m + n - 1
    while p1 >= 0 and p2 >= 0:
        if nums1[p1] > nums2[p2]:
            nums1[p] = nums1[p1]
            p1 -= 1
        else:
            nums1[p] = nums2[p2]
            p2 -= 1
        p -= 1
    nums1[:p2 + 1] = nums2[:p2 + 1]
    return nums1

# Run Merge
arr1 = [1, 2, 3, 0, 0, 0]
arr2 = [2, 5, 6]
print(f"Merged Array: {merge(arr1, 3, arr2, 3)}")`,

  'Prefix Sum': `class PrefixSum:
    def __init__(self, arr):
        self.prefix = [0] * (len(arr) + 1)
        for i in range(len(arr)):
            self.prefix[i + 1] = self.prefix[i] + arr[i]

    def query(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]

# Run Prefix Sum queries
arr = [1, 2, 3, 4, 5]
ps = PrefixSum(arr)
print(f"Sum of range [1, 3]: {ps.query(1, 3)}")`,

  'Binary Search': `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Run Binary Search in sorted list
arr = [10, 20, 30, 40, 50]
t = 30
print(f"Element {t} found at index: {binary_search(arr, t)}")`,

  'Sliding Window Maximum': `from collections import deque

def max_sliding_window(nums, k):
    d = deque()
    res = []
    for i, n in enumerate(nums):
        while d and nums[d[-1]] < n:
            d.pop()
        d.append(i)
        if d[0] == i - k:
            d.popleft()
        if i >= k - 1:
            res.append(nums[d[0]])
    return res

# Run Sliding Window Max for window size 3
nums = [1, 3, -1, -3, 5, 3, 6, 7]
k = 3
print(f"Max in each window of size {k}: {max_sliding_window(nums, k)}")`,

  'Product of Array Except Self': `def product_except_self(nums):
    length = len(nums)
    answer = [0] * length
    answer[0] = 1
    for i in range(1, length):
        answer[i] = nums[i - 1] * answer[i - 1]
    R = 1
    for i in reversed(range(length)):
        answer[i] = answer[i] * R
        R *= nums[i]
    return answer

# Run Product
nums = [1, 2, 3, 4]
print(f"Product array: {product_except_self(nums)}")`
};

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
    return { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false };
  });

  const toggleSection = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: !prev[sectionNum] };
      localStorage.setItem('dsa_progress_arrays', JSON.stringify(updated));
      return updated;
    });
  };

  const setSectionCompleted = (sectionNum: number, isCompleted: boolean) => {
    setCompletedSections((prev) => {
      const updated = { ...prev, [sectionNum]: isCompleted };
      localStorage.setItem('dsa_progress_arrays', JSON.stringify(updated));
      return updated;
    });
  };

  const SECTION_WEIGHTS: Record<number, number> = { 1: 10, 2: 15, 3: 10, 4: 15, 5: 15, 6: 10, 7: 10, 8: 15 };
  const progressPercent = Object.entries(completedSections)
    .filter(([, done]) => done)
    .reduce((sum, [key]) => sum + (SECTION_WEIGHTS[Number(key)] || 0), 0);

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

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');

  // Quiz state
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<typeof QUIZ_QUESTIONS>([]);

  useEffect(() => {
    // Generate a set of 5 random questions
    const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled.slice(0, 5));
  }, []);

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      {/* Header and Progress Bar */}
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
              Arrays in <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-1 font-mono text-sm tracking-widest uppercase">
              Contiguous memory allocation and random access
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: What is an Array */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>What is an Array?</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                An Array is a linear data structure that stores elements in contiguous memory locations. Each element is identified using a unique integer index.
              </p>
              <div 
                className="bg-bg-primary/60 border border-border-default/50 rounded-xl p-3.5 md:p-4 font-mono"
                style={{ marginTop: '1.5rem' }}
              >
                <div className="text-xs md:text-sm text-text-muted uppercase font-bold tracking-widest mb-1.5 md:mb-2">
                  Index & Value Mapping
                </div>
                <div className="flex flex-col gap-1 text-sm md:text-base font-bold leading-relaxed whitespace-pre">
                  <div className="text-text-secondary">Index:   0   1   2   3</div>
                  <div className="text-accent-secondary">Array: [10, 20, 30, 40]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Why Arrays Exist */}
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Why Arrays Exist</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Arrays are designed to address the core hardware need for fast sequential access and minimal memory overhead:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong className="text-text-primary">Fast data access:</strong> Instant O(1) reads via indexing.</li>
                <li><strong className="text-text-primary">Sequential storage:</strong> Map directly to contiguous blocks of RAM.</li>
                <li><strong className="text-text-primary">Efficient memory usage:</strong> Zero pointer overhead per element.</li>
                <li><strong className="text-text-primary">Predictable traversal:</strong> Linear memory lines are cached in CPU efficiently.</li>
              </ul>
            </div>
          </div>

          {/* Card 3: Key Characteristics */}
          <div className="neon-card neon-card-yellow flex flex-col justify-start md:col-span-2" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Key Characteristics</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-sm font-mono uppercase tracking-wider text-text-primary">
                      <th className="pr-4 font-bold text-accent-tertiary" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Feature</th>
                      <th className="font-bold text-text-muted" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans text-sm">
                    <tr>
                      <td className="pr-4 font-semibold text-text-primary font-mono" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Ordered</td>
                      <td className="text-text-secondary" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Elements maintain a strict sequential index order.</td>
                    </tr>
                    <tr>
                      <td className="pr-4 font-semibold text-text-primary font-mono" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Indexed</td>
                      <td className="text-text-secondary" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Instant access to elements via zero-based integer index calculations.</td>
                    </tr>
                    <tr>
                      <td className="pr-4 font-semibold text-text-primary font-mono" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Contiguous Memory</td>
                      <td className="text-text-secondary" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>All elements are stored directly next to each other in physical RAM.</td>
                    </tr>
                    <tr>
                      <td className="pr-4 font-semibold text-text-primary font-mono" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Fixed Size</td>
                      <td className="text-text-secondary" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>Traditional arrays are defined with a static length that cannot dynamically change.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Card 4: Analogy & Types */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start md:col-span-2" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.3rem] flex items-center gap-2 uppercase">
              <span>Real-World Analogy & Types</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0 text-sm text-text-secondary leading-relaxed">
              <div>
                <p className="font-bold text-text-primary mb-1">Analogies:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Apartment rooms in a hallway (each door has a sequential number).</li>
                  <li>Lockers in a school corridor.</li>
                  <li>Numbered seats in a movie theater.</li>
                </ul>
                <p className="mt-3 text-sm text-text-secondary/90">Each location has a fixed physical address, allowing immediate direct access.</p>
              </div>
              <div>
                <p className="font-bold text-text-primary mb-2">Dimension Types:</p>
                <div className="space-y-3 font-mono text-sm md:text-base font-bold">
                  <div className="bg-bg-primary/40 border border-border-default/50 rounded-xl p-3 md:p-3.5">
                    <span className="text-accent-secondary font-bold">1D Array:</span> [10, 20, 30, 40]
                  </div>
                  <div className="bg-bg-primary/40 border border-border-default/50 rounded-xl p-3 md:p-3.5">
                    <span className="text-accent-primary font-bold">2D Array:</span> [[1, 2], [3, 4]]
                    <p className="text-xs md:text-sm text-text-muted mt-1.5 leading-normal font-sans font-medium">Used in grids, matrices, games (boards), and pixels.</p>
                  </div>
                </div>
              </div>
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
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[2] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[2] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="neon-card neon-card-pink flex flex-col gap-6" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {/* Tabs for Operations */}
          <div className="flex border-b border-border-default/50 gap-4 overflow-x-auto">
            {(['traversal', 'insertion', 'deletion', 'growth'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveVisTab(tab)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap ${
                  activeVisTab === tab 
                    ? 'border-accent-primary text-accent-primary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab}
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
                      <span>FOR i FROM 0 TO array.length - 1:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>    ACCESS array[i]</span>
                    </div>
                  </div>
                )}
                {activeVisTab === 'insertion' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>// Insert target at index</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>FOR i FROM array.length - 1 DOWNTO index:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>    array[i + 1] = array[i]</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">4</span>
                      <span>array[index] = target</span>
                    </div>
                  </div>
                )}
                {activeVisTab === 'deletion' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>// Delete at index</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>FOR i FROM index TO array.length - 2:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>    array[i] = array[i + 1]</span>
                    </div>
                  </div>
                )}
                {activeVisTab === 'growth' && (
                  <div className="relative space-y-1 text-sm font-mono">
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 1 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">1</span>
                      <span>IF size == capacity THEN:</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 2 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">2</span>
                      <span>    new_capacity = capacity * 2</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 3 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">3</span>
                      <span>    new_arr = allocate(new_capacity)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 4 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">4</span>
                      <span>    copy(arr, new_arr)</span>
                    </div>
                    <div className={`flex gap-4 pl-4 pr-2 -mx-4 transition-all duration-300 ${activeStepData.line === 5 ? 'bg-accent-primary/10 border-l-2 border-accent-primary text-text-primary font-bold' : 'border-l-2 border-transparent text-text-secondary'}`}>
                      <span className="text-text-muted select-none w-3 text-right">5</span>
                      <span>    arr = new_arr</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex flex-col justify-center items-center min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl relative overflow-hidden p-6">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                <Database size={14} className="opacity-70" />
                <span>Memory blocks</span>
              </div>

              <div className="flex flex-col gap-10 w-full items-center z-10">
                {/* Array Container */}
                <div className="flex flex-col items-center gap-2">
                  {activeVisTab === 'growth' && activeStepData.newArray && (
                    <span className="text-xs font-mono text-text-muted uppercase">Old Array:</span>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-2 px-2">
                    {activeStepData.array.map((val, idx) => {
                      const isActive = activeStepData.activeIndex === idx;
                      const isHighlighted = activeStepData.highlightIndices?.includes(idx);
                      const isPointer = activeStepData.pointers?.some(p => p.index === idx);
                      const isLargeArray = activeStepData.array.length > 5;
                      const sizeClass = isLargeArray 
                        ? 'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm' 
                        : 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base';

                      let blockStyle = 'border-border-default bg-bg-secondary text-text-secondary';
                      if (val === null) blockStyle = 'border-dashed border-white/20 bg-transparent text-text-muted';
                      else if (isActive) blockStyle = 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_12px_rgba(255,45,120,0.2)]';
                      else if (isHighlighted) blockStyle = 'border-accent-secondary bg-accent-secondary/10 text-accent-secondary shadow-[0_0_12px_rgba(0,255,204,0.2)]';

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 relative">
                          <motion.div
                            layout
                            className={`${sizeClass} border rounded-xl flex items-center justify-center font-mono font-bold transition-all ${blockStyle}`}
                          >
                            {val !== null ? val : '_'}
                          </motion.div>
                          <span className="text-[10px] text-text-muted font-mono">[{idx}]</span>
                          
                          {/* Pointer Label */}
                          {isPointer && (
                            <div className="absolute -top-7 px-2 py-0.5 bg-accent-primary text-bg-primary rounded text-[9px] font-mono font-bold uppercase whitespace-nowrap shadow-md">
                              {activeStepData.pointers?.find(p => p.index === idx)?.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Growth visualizer secondary row */}
                {activeVisTab === 'growth' && activeStepData.newArray && (
                  <div className="flex flex-col items-center gap-2 border-t border-white/5 pt-6 w-full">
                    <span className="text-xs font-mono text-accent-secondary uppercase">New Allocated Array (Size: 8):</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-2 px-2">
                      {activeStepData.newArray.map((val, idx) => {
                        const isHighlighted = activeStepData.highlightIndices?.includes(idx) && val !== null;
                        let blockStyle = 'border-dashed border-white/20 bg-transparent text-text-muted';
                        if (val !== null) {
                          blockStyle = isHighlighted 
                            ? 'border-accent-secondary bg-accent-secondary/15 text-accent-secondary shadow-[0_0_10px_rgba(0,255,204,0.2)]'
                            : 'border-border-default bg-bg-secondary text-text-secondary';
                        }

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <motion.div
                              layout
                              className={`w-8 h-8 sm:w-10 sm:h-10 border rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm transition-all ${blockStyle}`}
                            >
                              {val !== null ? val : '_'}
                            </motion.div>
                            <span className="text-[9px] text-text-muted font-mono">[{idx}]</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid scanning effect bg */}
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
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
              3. Basic Operations & Complexities
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

        <div className="neon-card neon-card-yellow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-secondary border-b border-white/20 font-mono text-sm uppercase tracking-wider text-text-primary divide-x divide-white/20">
                  <th className="w-[35%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Operation</th>
                  <th className="text-accent-secondary w-[25%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Time Complexity</th>
                  <th className="w-[40%]" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 font-sans text-sm text-text-secondary">
                {[
                  { op: "Access by Index", complexity: "O(1)", desc: "Direct address computation using memory offset." },
                  { op: "Traversal", complexity: "O(N)", desc: "Iterating through every element from index 0 to N-1." },
                  { op: "Search (Linear)", complexity: "O(N)", desc: "Inspecting elements sequentially in an unsorted array." },
                  { op: "Insert at End", complexity: "O(1) amortized", desc: "Constant time insertions, occasional resizes for dynamic arrays." },
                  { op: "Insert at Beginning", complexity: "O(N)", desc: "Must shift all existing elements to the right." },
                  { op: "Delete at End", complexity: "O(1)", desc: "Trimming the end of the array." },
                  { op: "Delete at Beginning", complexity: "O(N)", desc: "Requires shifting all elements back to fill index 0." }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-bg-secondary/40 transition-colors divide-x divide-white/20">
                    <td className="font-semibold text-text-primary" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{item.op}</td>
                    <td className="font-mono text-accent-secondary font-bold" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{item.complexity}</td>
                    <td style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainers Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div className="neon-card flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-sm font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase flex flex-col">
              <span>Constant Time Access</span>
              <span className="text-accent-secondary font-extrabold text-base mt-0.5 font-mono">O(1)</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Because array memory locations are completely contiguous, the CPU accesses elements via simple calculation. You don't traverse nodes: index lookup is instant.
            </p>
          </div>

          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-sm font-bold text-accent-primary font-mono mb-[0.5rem] uppercase flex flex-col">
              <span>Linear Search Complexity</span>
              <span className="text-accent-primary font-extrabold text-base mt-0.5 font-mono">O(N)</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              When searching for a value in an unsorted array, we inspect each index starting from 0. In the worst case, the item is at index N-1, or entirely absent.
            </p>
          </div>

          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-sm font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase flex flex-col">
              <span>Binary Search Complexity</span>
              <span className="text-accent-tertiary font-extrabold text-base mt-0.5 font-mono">O(log N)</span>
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              If an array is sorted, we can use binary search to cut the search space in half at each step. This exponentially increases lookup speed to log N.
            </p>
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
          {/* Card 1: Memory Layout & Address Math */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase">
              1. Memory Layout & Address Math
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Core Idea</strong>
                <ul className="list-disc list-inside pl-0 space-y-2 text-sm">
                  <li>Arrays store elements in contiguous memory blocks.</li>
                  <li>Every element occupies fixed-size memory.</li>
                </ul>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Address Formula</strong>
                <div className="bg-bg-primary/50 rounded-xl p-2.5 border border-border-default/50 font-mono text-sm text-center text-accent-secondary">
                  Address = Base Address + (Index × Element Size)
                </div>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Example (Base Address = 1000, Size = 4B)</strong>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-sm text-text-secondary bg-bg-primary/30 p-2.5 rounded-lg border border-border-default/20">
                  <div>Index 0 &rarr; <span className="text-accent-secondary font-bold">1000</span></div>
                  <div>Index 1 &rarr; <span className="text-accent-secondary font-bold">1004</span></div>
                  <div>Index 2 &rarr; <span className="text-accent-secondary font-bold">1008</span></div>
                  <div>Index 3 &rarr; <span className="text-accent-secondary font-bold">1012</span></div>
                </div>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Why It Matters</strong>
                <ul className="list-disc list-inside pl-0 space-y-2 text-sm">
                  <li>Enables <span className="text-text-primary font-semibold">O(1)</span> index access.</li>
                  <li>Improves CPU cache efficiency.</li>
                  <li>Reduces traversal overhead.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Shifting & Insert Overhead */}
          <div className="neon-card neon-card-pink flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-primary font-mono mb-[0.5rem] uppercase">
              2. Shifting & Insert Overhead
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Core Idea</strong>
                <p className="text-sm">Arrays cannot leave gaps between elements. All active locations must remain perfectly contiguous.</p>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Insertion Example (Insert 25 at Index 2)</strong>
                <div className="space-y-2 font-mono text-sm bg-bg-primary/30 p-2.5 rounded-lg border border-border-default/20">
                  <div className="flex justify-between"><span>Before:</span> <span className="text-text-muted">[10, 20, 30, 40]</span></div>
                  <div className="flex justify-between text-accent-primary"><span>Shift elements:</span> <span>30 &rarr; [3], &nbsp;40 &rarr; [4]</span></div>
                  <div className="flex justify-between"><span>After:</span> <span className="text-accent-primary font-bold">[10, 20, 25, 30, 40]</span></div>
                </div>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Performance Impact</strong>
                <ul className="list-disc list-inside pl-0 space-y-2 text-sm">
                  <li>Shifting <span className="text-text-primary font-semibold">N</span> elements takes <span className="text-accent-primary font-bold">O(N)</span>.</li>
                  <li>Large insertions/deletions become highly expensive.</li>
                  <li>Linked Lists avoid this overhead (dynamic pointer updates).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Dynamic Arrays Resizing */}
          <div className="neon-card neon-card-yellow flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-tertiary font-mono mb-[0.5rem] uppercase">
              3. Dynamic Arrays Resizing
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Used In</strong>
                <p className="text-sm text-text-secondary">
                  Python Lists, Java ArrayList, C++ Vector, JavaScript Arrays
                </p>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Resize Process</strong>
                <ol className="list-decimal list-inside pl-0 space-y-2 text-sm">
                  <li>Allocate a new, larger memory block.</li>
                  <li>Copy all existing elements.</li>
                  <li>Free/deallocate the old memory block.</li>
                </ol>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Typical Growth</strong>
                <div className="font-mono text-sm text-center bg-bg-primary/30 p-2 rounded-lg border border-border-default/20 text-accent-tertiary">
                  Capacity: 4 &rarr; 8 &rarr; 16 &rarr; 32
                </div>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Why This Matters</strong>
                <ul className="list-disc list-inside pl-0 space-y-2 text-sm">
                  <li>Append operations become <span className="text-accent-tertiary font-bold">amortized O(1)</span>.</li>
                  <li>Resizing is expensive (<span className="text-text-primary">O(N)</span>) but occurs infrequently.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 4: Hardware Cache Friendliness */}
          <div className="neon-card neon-card-cyan flex flex-col justify-start" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <h3 className="text-lg font-bold text-accent-secondary font-mono mb-[0.5rem] uppercase">
              4. Hardware Cache Friendliness
            </h3>
            <div className="space-y-12 text-sm text-text-secondary leading-relaxed">
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Core Idea</strong>
                <p className="text-sm">CPUs load nearby memory values together into cache lines (spatial locality) rather than accessing RAM on every instruction.</p>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Why Arrays Are Fast</strong>
                <ul className="list-disc list-inside pl-0 space-y-2 text-sm">
                  <li>Elements are physically adjacent in memory.</li>
                  <li>CPU prefetchers load next values automatically.</li>
                  <li>Fewer cache misses occur during traversal.</li>
                </ul>
              </div>
              <div>
                <strong className="text-text-primary text-sm font-mono uppercase tracking-wider block mb-6">Compared to Linked Lists</strong>
                <div className="grid grid-cols-2 gap-4 text-base font-mono bg-bg-primary/30 p-2.5 rounded-lg border border-border-default/20">
                  <div>
                    <span className="text-accent-secondary font-bold block mb-2 text-base">Arrays</span>
                    <div className="text-sm text-text-secondary space-y-1.5">
                      <div>&bull; Sequential memory</div>
                      <div>&bull; Excellent locality</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold block mb-2 text-base">Linked Lists</span>
                    <div className="text-sm text-text-secondary space-y-1.5">
                      <div>&bull; Scattered memory</div>
                      <div>&bull; Poor locality</div>
                    </div>
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
          {/* Language Selection Tabs */}
          <div className="flex border-b border-border-default/50 gap-6 overflow-x-auto">
            {(['python', 'javascript', 'cpp', 'java'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap ${
                  activeCodeTab === lang 
                    ? 'border-accent-tertiary text-accent-tertiary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Active Code Segment */}
          <div className="bg-bg-primary rounded-xl border border-border-default font-mono text-sm leading-relaxed overflow-x-auto relative max-h-[450px]" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            <pre className="text-text-primary text-sm md:text-base py-2">{CODE_IMPLEMENTATIONS[activeCodeTab]}</pre>
          </div>
        </div>
      </section>

      {/* 6. COMMON FOUNDATIONAL PROBLEMS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[6] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              6. Common Foundational Problems
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(6)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[6] 
                ? 'bg-accent-primary border-accent-primary text-bg-primary shadow-[0_0_15px_rgba(255,45,120,0.35)] hover:shadow-[0_0_20px_rgba(255,45,120,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-primary/35 text-accent-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.1)] hover:border-accent-primary hover:text-accent-primary hover:shadow-[0_0_15px_rgba(255,45,120,0.3)]'
            }`}
            title={completedSections[6] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[6] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Two Sum', type: 'Hashing & Pointers', desc: 'Find two numbers adding up to a target value.' },
            { title: "Kadane's Algorithm", type: 'Dynamic Programming', desc: 'Find the maximum sum of a contiguous subarray.' },
            { title: 'Rotate Array', type: 'Reversal Trick', desc: 'Rotate elements in-place by K positions.' },
            { title: 'Merge Sorted Arrays', type: 'Two Pointers', desc: 'Combine two sorted arrays efficiently.' },
            { title: 'Prefix Sum', type: 'Preprocessing', desc: 'Query cumulative ranges in constant time.' },
            { title: 'Binary Search', type: 'Divide & Conquer', desc: 'Find elements in a sorted array in O(log N).' },
            { title: 'Sliding Window Maximum', type: 'Monotonic Queue', desc: 'Track maximums in subarrays of size K.' },
            { title: 'Product of Array Except Self', type: 'Accumulation', desc: 'Compute products excluding the current index.' }
          ].map((prob, idx) => (
            <div 
              key={idx} 
              className="neon-card neon-card-pink flex flex-col justify-between h-full group hover:border-accent-primary/50" 
              style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary border border-border-default/50 uppercase">
                  {prob.type}
                </span>
                <h4 className="text-lg font-bold text-text-primary mt-3 group-hover:text-accent-primary transition-colors">
                  {prob.title}
                </h4>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  {prob.desc}
                </p>
              </div>
              <button 
                onClick={() => navigate('/playground', { 
                  state: { 
                    code: PROBLEM_SAMPLE_CODES[prob.title as keyof typeof PROBLEM_SAMPLE_CODES], 
                    language: 'python', 
                    execute: true 
                  } 
                })}
                className="mt-6 text-sm font-mono font-bold text-accent-primary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start cursor-pointer"
              >
                Playground &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REAL-WORLD APPLICATIONS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center w-full mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="text-accent-secondary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[7] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              7. Real-World Applications
            </h2>
          </div>
          <button 
            onClick={() => toggleSection(7)} 
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
              completedSections[7] 
                ? 'bg-accent-secondary border-accent-secondary text-bg-primary shadow-[0_0_15px_rgba(0,255,204,0.35)] hover:shadow-[0_0_20px_rgba(0,255,204,0.55)]' 
                : 'bg-bg-secondary/40 border-accent-secondary/35 text-accent-secondary/50 shadow-[0_0_8px_rgba(0,255,204,0.1)] hover:border-accent-secondary hover:text-accent-secondary hover:shadow-[0_0_15px_rgba(0,255,204,0.3)]'
            }`}
            title={completedSections[7] ? "Completed" : "Mark as Completed"}
          >
            {completedSections[7] && <Check size={18} strokeWidth={3.5} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Databases', desc: 'Indexes, page buffer pools, and sequential records storage.' },
            { title: 'Image Processing', desc: 'Representing pixels as 2D/3D grids (matrices) of color channels.' },
            { title: 'Game Development', desc: 'Managing inventories, coordinate boards, and player lists.' },
            { title: 'Operating Systems', desc: 'Memory mapping tables, process list frames, and buffer pages.' },
            { title: 'Scientific Computing', desc: 'Powering linear algebra calculations, vectors, and tensor matrices.' },
            { title: 'Web Development', desc: 'Processing arrays of JSON objects, API list data, and frontend list states.' },
            { title: 'Media Streaming', desc: 'Frame packet buffers internally use array queues to handle streaming data streams.' }
          ].map((app, idx) => (
            <div 
              key={idx} 
              className="neon-card flex flex-col justify-start" 
              style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
            >
              <h3 className="text-base font-bold text-accent-secondary font-mono mb-[0.3rem] uppercase">
                {app.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {app.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ARRAYS QUIZ */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Award className="text-accent-primary opacity-70" size={24} />
            <h2 className={`text-2xl font-bold font-display transition-colors duration-300 ${completedSections[8] ? 'text-text-muted line-through decoration-text-muted/30' : 'text-text-primary'}`}>
              8. Arrays Quiz
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
                          setSectionCompleted(8, true);
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
