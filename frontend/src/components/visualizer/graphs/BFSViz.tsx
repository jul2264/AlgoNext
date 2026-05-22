import { useMemo } from 'react';
import { GraphCanvas, type GraphNode, type GraphEdge } from '../shared/GraphCanvas';
import { StepControls } from '../shared/StepControls';
import { useStepPlayer } from '@/hooks/useStepPlayer';

interface BFSFrame {
  nodes: GraphNode[];
  edges: GraphEdge[];
  description: string;
}

export function BFSViz() {
  const frames = useMemo(() => {
    const generatedFrames: BFSFrame[] = [];
    
    const initialNodes: GraphNode[] = [
      { id: '0', label: '0', state: 'idle' },
      { id: '1', label: '1', state: 'idle' },
      { id: '2', label: '2', state: 'idle' },
      { id: '3', label: '3', state: 'idle' },
      { id: '4', label: '4', state: 'idle' },
      { id: '5', label: '5', state: 'idle' }
    ];

    const initialEdges: GraphEdge[] = [
      { source: '0', target: '1', state: 'idle' },
      { source: '0', target: '2', state: 'idle' },
      { source: '1', target: '3', state: 'idle' },
      { source: '1', target: '4', state: 'idle' },
      { source: '2', target: '4', state: 'idle' },
      { source: '3', target: '5', state: 'idle' },
      { source: '4', target: '5', state: 'idle' }
    ];

    let currentNodes = [...initialNodes];
    let currentEdges = [...initialEdges];

    const captureFrame = (desc: string) => {
      generatedFrames.push({
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        edges: JSON.parse(JSON.stringify(currentEdges)),
        description: desc
      });
    };

    captureFrame("Starting Breadth-First Search from node 0.");

    const adj: Record<string, string[]> = {
      '0': ['1', '2'],
      '1': ['0', '3', '4'],
      '2': ['0', '4'],
      '3': ['1', '5'],
      '4': ['1', '2', '5'],
      '5': ['3', '4']
    };

    const visited = new Set<string>();
    const queue: string[] = [];

    // Start BFS
    const startNode = '0';
    visited.add(startNode);
    queue.push(startNode);
    
    currentNodes.find(n => n.id === startNode)!.state = 'visited';
    captureFrame(`Node ${startNode} visited and added to queue. Queue: [${queue.join(', ')}]`);

    while (queue.length > 0) {
      const u = queue.shift()!;
      currentNodes.find(n => n.id === u)!.state = 'visiting';
      captureFrame(`Dequeued ${u}. Exploring its neighbors. Queue: [${queue.join(', ')}]`);

      for (const v of adj[u]) {
        // Highlight edge
        const edge = currentEdges.find(e => 
          (e.source === u && e.target === v) || (e.source === v && e.target === u)
        );
        if (edge) edge.state = 'traversing';
        
        captureFrame(`Checking neighbor ${v} of node ${u}.`);

        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          currentNodes.find(n => n.id === v)!.state = 'visited';
          if (edge) edge.state = 'path';
          captureFrame(`Node ${v} is unvisited. Marking as visited and enqueuing. Queue: [${queue.join(', ')}]`);
        } else {
          captureFrame(`Node ${v} is already visited. Skipping.`);
          if (edge && edge.state === 'traversing') edge.state = 'idle';
        }
      }

      currentNodes.find(n => n.id === u)!.state = 'visited';
      captureFrame(`Finished exploring neighbors of ${u}.`);
    }

    captureFrame("BFS traversal complete. All reachable nodes visited.");
    return generatedFrames;
  }, []);

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
    <div className="flex flex-col h-full bg-bg-primary p-4 gap-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-text-primary">Breadth-First Search (BFS)</h2>
      </div>

      <div className="bg-bg-elevated p-4 rounded-lg border border-border-default min-h-[80px] flex items-center shadow-lg">
        <p className="text-text-primary text-lg">
          <span className="font-bold text-accent-primary mr-2">Step {currentStep + 1}:</span> 
          {currentFrame.description}
        </p>
      </div>

      <div className="flex-1 bg-bg-secondary rounded-xl border border-border-default overflow-hidden relative shadow-inner">
        <GraphCanvas 
          nodes={currentFrame.nodes} 
          edges={currentFrame.edges} 
        />
      </div>

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
