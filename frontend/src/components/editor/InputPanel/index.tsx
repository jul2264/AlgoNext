import { useEditorStore } from '@/store/editorStore';
import { Keyboard } from 'lucide-react';

export function InputPanel() {
  const { customInput, setCustomInput } = useEditorStore();

  return (
    <div className="flex h-full flex-col bg-bg-secondary text-text-primary rounded-sm border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-elevated border-b border-border-default" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <Keyboard size={20} className="text-text-muted" />
        <h3 className="text-lg font-bold">Standard Input (stdin)</h3>
      </div>
      
      <div className="flex-1 bg-bg-primary/50" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.2rem', paddingBottom: '1rem' }}>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Enter input here (e.g. for Python's input() or C++ cin)..."
          className="w-full h-full bg-transparent resize-none border-0 outline-none focus:outline-none focus:ring-0 font-mono text-sm text-text-primary placeholder:text-text-muted"
          style={{ outline: 'none', boxShadow: 'none' }}
        />
      </div>
    </div>
  );
}
