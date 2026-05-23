import { useState, useMemo } from 'react';
import { GraphCanvas, type GraphNode, type GraphEdge } from '../shared/GraphCanvas';
import { StepControls } from '../shared/StepControls';
import { CustomArrayInput } from '../shared/CustomArrayInput';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface BSTFrame {
  nodes: GraphNode[];
  edges: GraphEdge[];
  description: string;
}

class TreeNode {
  value: number;
  id: string;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  
  constructor(value: number) {
    this.value = value;
    this.id = `node-${value}`;
  }
}

export function BSTViz({ valuesToInsert = [15, 10, 20, 8, 12, 17, 25] }) {
  const [currentData, setCurrentData] = useState<number[]>(valuesToInsert);

  const frames = useMemo(() => {
    const generatedFrames: BSTFrame[] = [];
    const currentNodes: GraphNode[] = [];
    const currentEdges: GraphEdge[] = [];
    
    // Helper to capture state
    const captureFrame = (desc: string, activeNodeId?: string, activeEdgeTarget?: string) => {
      generatedFrames.push({
        nodes: currentNodes.map(n => ({
          ...n,
          state: n.id === activeNodeId ? 'visiting' : 'visited'
        })),
        edges: currentEdges.map(e => ({
          ...e,
          state: e.target === activeEdgeTarget ? 'traversing' : 'idle'
        })),
        description: desc
      });
    };

    captureFrame("Empty Binary Search Tree initialized.");

    let root: TreeNode | null = null;

    const insert = (val: number) => {
      const newNode = new TreeNode(val);
      
      if (!root) {
        root = newNode;
        currentNodes.push({ id: newNode.id, label: String(val), state: 'visiting' });
        captureFrame(`Inserted root node ${val}.`, newNode.id);
        return;
      }

      captureFrame(`Inserting ${val}... starting at root ${root.value}.`, root.id);

      let current = root;
      while (true) {
        if (val < current.value) {
          captureFrame(`${val} < ${current.value}, going left.`, current.id);
          
          if (!current.left) {
            current.left = newNode;
            currentNodes.push({ id: newNode.id, label: String(val), state: 'visiting' });
            currentEdges.push({ source: current.id, target: newNode.id, state: 'traversing' });
            captureFrame(`Inserted ${val} as left child of ${current.value}.`, newNode.id, newNode.id);
            break;
          }
          current = current.left;
        } else {
          captureFrame(`${val} >= ${current.value}, going right.`, current.id);
          
          if (!current.right) {
            current.right = newNode;
            currentNodes.push({ id: newNode.id, label: String(val), state: 'visiting' });
            currentEdges.push({ source: current.id, target: newNode.id, state: 'traversing' });
            captureFrame(`Inserted ${val} as right child of ${current.value}.`, newNode.id, newNode.id);
            break;
          }
          current = current.right;
        }
      }
    };

    for (const val of currentData) {
      insert(val);
    }
    
    // Final clear frame
    generatedFrames.push({
      nodes: currentNodes.map(n => ({ ...n, state: 'visited' })),
      edges: currentEdges.map(e => ({ ...e, state: 'idle' })),
      description: "All nodes inserted! BST construction complete."
    });

    return generatedFrames;
  }, [currentData]);

  const {
    currentStep,
    isPlaying,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    speed,
    setSpeed
  } = useStepPlayer({ totalSteps: frames.length, initialSpeed: 800 });

  const currentFrame = frames[currentStep];

  return (
    <div className="flex flex-col h-full bg-bg-primary p-4 gap-4">
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-2xl font-bold text-text-primary">Binary Search Tree (Insertion)</h2>
      </div>

      <div className="bg-bg-elevated p-3 rounded-lg border border-border-default min-h-[60px] flex items-center shadow-md">
        <p className="text-text-primary text-base">
          <span className="font-bold text-accent-primary">Step {currentStep + 1}: </span> 
          {currentFrame.description}
        </p>
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 min-h-[250px] max-h-[300px] lg:max-h-[350px] bg-transparent overflow-hidden relative transition-all duration-300">
        <GraphCanvas 
          nodes={currentFrame.nodes} 
          edges={currentFrame.edges} 
        />
      </div>

      <CustomArrayInput 
        onApply={(newArr) => {
          setCurrentData(newArr);
          reset();
        }} 
        defaultValue={currentData.join(", ")}
      />

      <StepControls
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextStep}
        onPrev={prevStep}
        onReset={reset}
        currentStep={currentStep}
        totalSteps={frames.length}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
