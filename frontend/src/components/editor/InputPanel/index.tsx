import { useEditorStore } from '@/store/editorStore';
import { Keyboard } from 'lucide-react';

export function InputPanel() {
  const { customInput, setCustomInput } = useEditorStore();

  return (
    <div className="flex h-full flex-col bg-bg-secondary text-text-primary rounded-md border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-elevated px-4 py-2 border-b border-border-default">
        <Keyboard size={16} className="text-text-muted" />
        <h3 className="text-sm font-medium">Standard Input (stdin)</h3>
      </div>
      
      <div className="flex-1 p-2 bg-bg-primary/50">
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Enter input here (e.g. for Python's input() or C++ cin)..."
          className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm text-text-primary placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}
