import { useState } from 'react';
import { BubbleSortViz } from '@/components/visualizer/sorting/BubbleSortViz';
import { MergeSortViz } from '@/components/visualizer/sorting/MergeSortViz';
import { BSTViz } from '@/components/visualizer/trees/BSTViz';
import { BFSViz } from '@/components/visualizer/graphs/BFSViz';
import { DFSViz } from '@/components/visualizer/graphs/DFSViz';

type VizTab = 'bubble' | 'merge' | 'bst' | 'bfs' | 'dfs';

export function VisualizerPage() {
  const [activeTab, setActiveTab] = useState<VizTab>('bubble');

  const tabs: { id: VizTab; label: string }[] = [
    { id: 'bubble', label: 'Bubble Sort' },
    { id: 'merge', label: 'Merge Sort' },
    { id: 'bst', label: 'BST Insert' },
    { id: 'bfs', label: 'BFS Graph' },
    { id: 'dfs', label: 'DFS Graph' },
  ];

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Algorithm Visualizer</h1>
          <p className="text-text-secondary">Step-by-step interactive algorithm animations.</p>
        </div>
        
        <div className="flex gap-2 bg-bg-elevated p-1 rounded-lg border border-border-default">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-accent-primary text-white' 
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'bubble' && <BubbleSortViz />}
        {activeTab === 'merge' && <MergeSortViz />}
        {activeTab === 'bst' && <BSTViz />}
        {activeTab === 'bfs' && <BFSViz />}
        {activeTab === 'dfs' && <DFSViz />}
      </div>
    </div>
  );
}
