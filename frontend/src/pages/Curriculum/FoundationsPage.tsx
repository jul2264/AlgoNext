import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, BookOpen, Layers, Table, Cpu, Code2, 
  HelpCircle, Share2, Play, Pause, SkipForward, RotateCcw, 
  Database, AlertCircle 
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

// Static Data for Foundations Page
const OPERATIONS = [
  { operation: 'Variable Declaration / Assignment', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Allocating memory and storing a primitive value.' },
  { operation: 'Array Index Access', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Retrieving an element via direct memory offset.' },
  { operation: 'Arithmetic Operation (+, -, *, /)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)', description: 'Basic CPU ALU cycle operation.' },
  { operation: 'Single Loop (1 to N)', timeComplexity: 'O(N)', spaceComplexity: 'O(1)', description: 'Iterating linearly through elements.' },
  { operation: 'Nested Loops (N x N)', timeComplexity: 'O(N²)', spaceComplexity: 'O(1)', description: 'Comparing every pair of elements.' },
  { operation: 'Recursive Call Stack Frame', timeComplexity: 'O(1) per call', spaceComplexity: 'O(D) depth', description: 'Pushing a function frame onto the runtime call stack.' },
];

const CODE_IMPLEMENTATIONS = {
  python: `def factorial(n):
    # Base Case: stop the recursion
    if n <= 1:
        return 1
        
    # Recursive Case: call self with n - 1
    return n * factorial(n - 1)

# Usage
result = factorial(3)
print(f"Result: {result}")`,
  javascript: `function factorial(n) {
    // Base Case: stop the recursion
    if (n <= 1) {
        return 1;
    }
    
    // Recursive Case: call self with n - 1
    return n * factorial(n - 1);
}

// Usage
const result = factorial(3);
console.log(\`Result: \${result}\`);`,
  cpp: `#include <iostream>

int factorial(int n) {
    // Base Case: stop the recursion
    if (n <= 1) {
        return 1;
    }
    
    // Recursive Case: call self with n - 1
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(3);
    std::cout << "Result: " << result << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static int factorial(int n) {
        // Base Case: stop the recursion
        if (n <= 1) {
            return 1;
        }
        
        // Recursive Case: call self with n - 1
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(3);
        System.out.println("Result: " + result);
    }
}`
};

// Simulation Steps for Recursion Call Stack Visualizer: factorial(3)
const VISUALIZATION_STEPS = [
  {
    step: 0,
    line: 1,
    description: 'Initial function call is made to factorial(3). Pushing first stack frame.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'active', returnValue: null }
    ]
  },
  {
    step: 1,
    line: 3,
    description: 'Evaluating base case: is n <= 1? (3 <= 1) is False. Continuing to recursive case.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'evaluating', returnValue: null }
    ]
  },
  {
    step: 2,
    line: 7,
    description: 'Recursive case reached: return 3 * factorial(2). Suspending factorial(3) and calling factorial(2).',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'active', returnValue: null }
    ]
  },
  {
    step: 3,
    line: 3,
    description: 'Evaluating base case for factorial(2): is n <= 1? (2 <= 1) is False. Continuing to recursive case.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'evaluating', returnValue: null }
    ]
  },
  {
    step: 4,
    line: 7,
    description: 'Recursive case reached: return 2 * factorial(1). Suspending factorial(2) and calling factorial(1).',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'suspended', returnValue: null },
      { id: 3, name: 'factorial(1)', param: 'n = 1', status: 'active', returnValue: null }
    ]
  },
  {
    step: 5,
    line: 3,
    description: 'Evaluating base case for factorial(1): is n <= 1? (1 <= 1) is True! Preparing to return 1.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'suspended', returnValue: null },
      { id: 3, name: 'factorial(1)', param: 'n = 1', status: 'returning', returnValue: '1' }
    ]
  },
  {
    step: 6,
    line: 4,
    description: 'factorial(1) resolves and returns 1. Popping frame from stack.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'suspended', returnValue: null },
      { id: 2, name: 'factorial(2)', param: 'n = 2', status: 'resolving', returnValue: '2 * factorial(1) = 2 * 1' }
    ]
  },
  {
    step: 7,
    line: 7,
    description: 'factorial(2) completes calculation: 2 * 1 = 2. Preparing to return 2. Popping frame from stack.',
    stack: [
      { id: 1, name: 'factorial(3)', param: 'n = 3', status: 'resolving', returnValue: '3 * factorial(2) = 3 * 2' }
    ]
  },
  {
    step: 8,
    line: 7,
    description: 'factorial(3) completes calculation: 3 * 2 = 6. All call stack frames resolved. Final answer: 6.',
    stack: []
  }
];

export function FoundationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<any>(null);

  // Handle auto-playing of visualizer steps
  const handlePlayToggle = () => {
    if (isPlaying) {
      clearInterval(playInterval);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= VISUALIZATION_STEPS.length - 1) {
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
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < VISUALIZATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeStepData = VISUALIZATION_STEPS[currentStep];

  return (
    <div 
      className="w-full mx-auto pb-16 min-h-[calc(100vh-4rem)] flex flex-col gap-8"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dsa')}
            className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-display text-text-primary tracking-tight">
              Foundations of <span className="text-accent-secondary drop-shadow-[0_0_2px_rgba(0,255,204,0.3)]">DSA</span>
            </h1>
            <p className="text-text-secondary mt-2 font-mono text-sm tracking-widest uppercase">
              Complexity, Memory, Variables & Loops
            </p>
          </div>
        </div>
      </PageHeader>

      {/* 1. INTRODUCTION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">1. Introduction</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-secondary font-mono">WHAT IT IS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Foundations represent the basic plumbing of computer science: variables (how data is labeled), loop iteration (repeating operations), and function recursion (functions calling themselves to solve sub-problems).
            </p>
          </div>
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-primary font-mono">WHY IT EXISTS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              To write correct and performant code, developers must understand how variables occupy memory, how execution context flows line-by-line, and how algorithm complexity scales when loops or recursive stack frames are processed by CPU threads.
            </p>
          </div>
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-tertiary font-mono">REAL-WORLD ANALOGY</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Think of variables as named drawer files, loops as assembly-line workers stamping widgets sequentially, and recursion as a set of nested Russian Matryoshka dolls—each doll looks identical but is smaller, and you must open all of them to find the prize.
            </p>
          </div>
        </div>
      </section>

      {/* 2. VISUALIZATION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">2. Interactive Visualization</h2>
        </div>
        <div className="neon-card p-6 flex flex-col gap-6">
          <div className="border-b border-border-default pb-4">
            <h3 className="text-lg font-bold text-text-primary mb-1">Visualizing a Recursion Call Stack</h3>
            <p className="text-sm text-text-muted">Trace the push and pop operations of execution frames when computing <code className="text-accent-secondary">factorial(3)</code>.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Box: Code trace and controls */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-text-secondary uppercase">Execution Step {currentStep + 1} of {VISUALIZATION_STEPS.length}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReset} 
                    className="p-2.5 bg-bg-tertiary border border-border-default rounded-lg hover:border-accent-secondary hover:text-accent-secondary transition-colors"
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="p-2.5 bg-bg-tertiary border border-border-default rounded-lg hover:border-accent-secondary hover:text-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Prev"
                  >
                    <SkipForward size={16} className="rotate-180" />
                  </button>
                  <button 
                    onClick={handlePlayToggle} 
                    className="p-2.5 bg-bg-tertiary border border-border-default rounded-lg hover:border-accent-secondary hover:text-accent-secondary transition-colors"
                    title={isPlaying ? "Pause" : "Play Auto-run"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={handleNext} 
                    disabled={currentStep === VISUALIZATION_STEPS.length - 1}
                    className="p-2.5 bg-bg-tertiary border border-border-default rounded-lg hover:border-accent-secondary hover:text-accent-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>

              {/* Staged Code Frame */}
              <div className="bg-bg-primary rounded-xl border border-border-default p-4 font-mono text-sm leading-relaxed overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 text-xs bg-bg-secondary text-text-muted border-l border-b border-border-default">python</div>
                
                {/* Highlight Overlay */}
                <div 
                  className="absolute left-0 w-full bg-accent-secondary/15 border-l-2 border-accent-secondary pointer-events-none transition-all duration-300"
                  style={{ 
                    height: '24px', 
                    top: `${16 + (activeStepData.line - 1) * 24}px` 
                  }}
                />

                <div className="relative pl-6 space-y-1">
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">1</span><span>def factorial(n):</span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">2</span><span>    # Base Case</span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">3</span><span>    if n &lt;= 1:</span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">4</span><span>        return 1</span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">5</span><span>    </span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">6</span><span>    # Recursive Case</span></div>
                  <div className="flex gap-4"><span className="text-text-muted select-none w-4">7</span><span>    return n * factorial(n - 1)</span></div>
                </div>
              </div>

              {/* Action Description */}
              <div className="p-4 bg-bg-secondary rounded-xl border border-border-default flex items-start gap-3">
                <AlertCircle className="text-accent-secondary shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-text-secondary leading-snug">{activeStepData.description}</p>
              </div>
            </div>

            {/* Right Box: Dynamic Runtime Call Stack Visualizer */}
            <div className="flex flex-col justify-end min-h-[300px] border border-border-default bg-bg-primary/50 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                <Database size={14} />
                <span>Runtime Call Stack (LIFO)</span>
              </div>
              
              <div className="flex flex-col-reverse gap-3 w-full max-w-sm mx-auto z-10">
                <AnimatePresence mode="popLayout">
                  {activeStepData.stack.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-10 text-text-muted italic font-mono text-sm"
                    >
                      [Call Stack Empty / Idle]
                    </motion.div>
                  ) : (
                    activeStepData.stack.map((frame, index) => {
                      let statusColors = 'border-accent-secondary/30 bg-accent-secondary/5 text-accent-secondary';
                      if (frame.status === 'suspended') statusColors = 'border-border-default bg-bg-secondary text-text-secondary opacity-60';
                      if (frame.status === 'returning') statusColors = 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-[0_0_15px_rgba(255,45,120,0.15)]';
                      if (frame.status === 'resolving') statusColors = 'border-accent-tertiary bg-accent-tertiary/10 text-accent-tertiary';

                      return (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, y: -40, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, y: 30 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className={`border p-4 rounded-xl flex flex-col gap-1.5 ${statusColors} font-mono relative backdrop-blur-md`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">{frame.name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/30 rounded">{frame.status}</span>
                          </div>
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Parameters: {frame.param}</span>
                            {frame.returnValue && (
                              <span className="text-accent-secondary font-bold font-sans">
                                Return Value: {frame.returnValue}
                              </span>
                            )}
                          </div>
                          {index === activeStepData.stack.length - 1 && (
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-accent-secondary rounded-r shadow-md animate-pulse"></div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Grid scanning effect bg */}
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OPERATIONS TABLE SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Table className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">3. Basic Operations & Complexities</h2>
        </div>
        <div className="neon-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-secondary border-b border-border-default font-mono text-xs uppercase tracking-wider text-text-muted">
                  <th className="py-4 px-6">Operation</th>
                  <th className="py-4 px-6 text-accent-secondary">Time Complexity</th>
                  <th className="py-4 px-6 text-accent-primary">Space Complexity</th>
                  <th className="py-4 px-6">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/50 font-sans text-sm">
                {OPERATIONS.map((op, idx) => (
                  <tr key={idx} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-text-primary">{op.operation}</td>
                    <td className="py-4 px-6 font-mono text-accent-secondary font-semibold">{op.timeComplexity}</td>
                    <td className="py-4 px-6 font-mono text-accent-primary font-semibold">{op.spaceComplexity}</td>
                    <td className="py-4 px-6 text-text-secondary leading-relaxed">{op.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. INTERNAL WORKING SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">4. Internal Working</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="neon-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-accent-secondary font-mono flex items-center gap-2">
              <span>STACK VS HEAP MEMORY LAYOUT</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                When a program executes, the OS allocates virtual memory split into distinct segments:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-text-primary font-mono">Stack Memory:</strong> Stores function execution frames, primitive variable values, and references to objects. Memory allocation is automatic, static, fast (LIFO execution), and size is fixed.
                </li>
                <li>
                  <strong className="text-text-primary font-mono">Heap Memory:</strong> Stores dynamically allocated objects (like dynamic arrays, tree nodes, objects). Memory allocation is dynamic, slow, managed via pointers, and reclaimed by Garbage Collectors or explicit deletion.
                </li>
              </ul>
            </div>
          </div>
          <div className="neon-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-accent-primary font-mono flex items-center gap-2">
              <span>RECURSION FLOW & THE RUNTIME STACK</span>
            </h3>
            <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>
                Every function invocation creates a **Stack Frame** containing:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Parameters and arguments passed.</li>
                <li>Local variables instantiated inside.</li>
                <li>The Return Address (where execution resumes once complete).</li>
              </ul>
              <p>
                Without a base case, recursive loops cause **Stack Overflow**, where the allocated stack memory segment runs out of frames, triggering process crashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPLEMENTATION SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">5. Code Implementation</h2>
        </div>
        <div className="neon-card p-6 flex flex-col gap-6">
          {/* Language Selection Tabs */}
          <div className="flex border-b border-border-default/50 gap-2 overflow-x-auto">
            {(['python', 'javascript', 'cpp', 'java'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-5 py-3 font-mono font-bold text-sm border-b-2 uppercase transition-all whitespace-nowrap ${activeTab === lang ? 'border-accent-secondary text-accent-secondary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Active Code Segment */}
          <div className="bg-bg-primary rounded-xl border border-border-default p-5 font-mono text-sm leading-relaxed overflow-x-auto relative max-h-[450px]">
            <pre className="text-text-primary">{CODE_IMPLEMENTATIONS[activeTab]}</pre>
          </div>
        </div>
      </section>

      {/* 6. COMMON PROBLEMS SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">6. Common Foundations Problems</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Fibonacci Sequence', type: 'Recursion', desc: 'Solve via basic recursive formula and discuss optimization through Memoization.' },
            { title: 'Climbing Stairs', type: 'Loops & State', desc: 'Model stepping combinations to reach the Nth stair using iterative states.' },
            { title: 'Towers of Hanoi', type: 'Recursion Depth', desc: 'Move disks between pegs using mathematical inductive partitioning.' },
            { title: 'Binary Search', type: 'Div & Conquer', desc: 'Divide execution space in half dynamically, reducing complexity to log(N).' }
          ].map((prob, idx) => (
            <div key={idx} className="neon-card p-5 flex flex-col justify-between h-full group hover:border-accent-secondary/50">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary border border-border-default/50 uppercase">{prob.type}</span>
                <h4 className="text-lg font-bold text-text-primary mt-3 group-hover:text-accent-secondary transition-colors">{prob.title}</h4>
                <p className="text-xs text-text-muted mt-2 leading-relaxed">{prob.desc}</p>
              </div>
              <button 
                onClick={() => navigate('/playground')}
                className="mt-6 text-xs font-mono font-bold text-accent-secondary flex items-center gap-1 hover:translate-x-1 transition-transform align-bottom justify-start self-start"
              >
                Launch in Playground &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. REAL-WORLD USAGE SECTION */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="text-accent-secondary" size={24} />
          <h2 className="text-2xl font-bold font-display text-text-primary">7. Real-World Applications</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-secondary font-mono">FILE SYSTEM TRAVERSAL</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Operating system folder search trees are recursive structures. Traversal APIs call themselves recursively for child folders inside parents until finding matching file patterns.
            </p>
          </div>
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-primary font-mono">BROWSER CALL STACKS</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Web browser JS engines maintain call stacks. Function executions push context blocks. When exceptions happen, the Stack Trace prints active frames, letting you trace errors.
            </p>
          </div>
          <div className="neon-card p-6 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-accent-tertiary font-mono">UNDO / REDO LOGIC</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Editors stack snapshots of state. The undo operations pop states from the undo-stack and push them onto the redo-stack, allowing structured reversal of user inputs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
