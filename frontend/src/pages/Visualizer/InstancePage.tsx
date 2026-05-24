import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { BubbleSortViz } from '@/components/visualizer/sorting/BubbleSortViz';
import { MergeSortViz } from '@/components/visualizer/sorting/MergeSortViz';
import { BSTViz } from '@/components/visualizer/trees/BSTViz';
import { BFSViz } from '@/components/visualizer/graphs/BFSViz';
import { DFSViz } from '@/components/visualizer/graphs/DFSViz';

export function VisualizerInstancePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const renderVisualizer = () => {
    switch (slug) {
      case 'bubble': return <BubbleSortViz />;
      case 'merge': return <MergeSortViz />;
      case 'bst': return <BSTViz />;
      case 'bfs': return <BFSViz />;
      case 'dfs': return <DFSViz />;
      default: return (
        <div className="flex items-center justify-center h-full text-text-muted">
          Visualizer not found for "{slug}"
        </div>
      );
    }
  };

  const renderTitle = (s: string) => {
    switch (s) {
      case 'bubble': return <><span className="text-accent-tertiary">Bubble Sort</span> Visualization</>;
      case 'merge': return <><span className="text-accent-tertiary">Merge Sort</span> Visualization</>;
      case 'bst': return <><span className="text-accent-tertiary">BST</span> Visualization</>;
      case 'bfs': return <><span className="text-accent-tertiary">BFS</span> Visualization</>;
      case 'dfs': return <><span className="text-accent-tertiary">DFS</span> Visualization</>;
      default: return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return (
    <div className="w-full mx-auto py-6 flex flex-col h-[calc(100vh-4rem)]" style={{ paddingLeft: '3vw', paddingRight: '3vw' }}>
      
      {/* Header Area */}
      <div className="flex items-center gap-6 shrink-0" style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/daa')}
          className="p-3 bg-bg-secondary rounded-xl border border-border-default hover:border-accent-secondary hover:text-accent-secondary transition-colors group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-5xl font-bold font-display text-text-primary tracking-tight">
            {slug ? renderTitle(slug) : 'Visualizer'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-bg-secondary rounded-xl border border-border-default">
        {renderVisualizer()}
      </div>

    </div>
  );
}
