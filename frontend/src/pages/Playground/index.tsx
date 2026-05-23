import { Panel, Group, Separator } from 'react-resizable-panels';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';
import { LanguageSelector } from '@/components/editor/LanguageSelector';
import { GripHorizontal } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useEffect } from 'react';

export function PlaygroundPage() {
  const { setActiveProblemId, setCode } = useEditorStore();

  // For the playground, we can just set a dummy active problem ID 
  // so the backend accepts the execution (or we could modify the backend to accept ad-hoc code)
  // For now, we'll assume problem ID 1 is a safe fallback or just let the backend handle it.
  useEffect(() => {
    // We'll set it to a generic problem ID or null if the backend supports raw execution
    setActiveProblemId(1);
    setCode('print("Hello from the Playground!")');
    return () => setActiveProblemId(null);
  }, [setActiveProblemId, setCode]);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] p-4 bg-bg-primary">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-text-primary font-display">
          Code <span className="text-accent-secondary">Playground</span>
        </h1>
        <LanguageSelector />
      </div>

      <div className="h-[calc(100%-4rem)] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <Group orientation="vertical">
          {/* TOP: Editor */}
          <Panel defaultSize={60} minSize={30}>
            <div className="h-full border border-border-default rounded-t-lg overflow-hidden bg-bg-secondary">
              <CodeEditor />
            </div>
          </Panel>

          <Separator className="h-2 bg-bg-primary flex items-center justify-center hover:bg-accent-secondary/20 transition-colors cursor-row-resize group">
            <div className="w-8 h-1 rounded-full bg-border-default group-hover:bg-accent-secondary flex items-center justify-center transition-colors">
              <GripHorizontal size={12} className="text-bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Separator>

          {/* BOTTOM: Output */}
          <Panel defaultSize={40} minSize={20}>
            <div className="h-full border border-border-default rounded-b-lg overflow-hidden">
              <OutputPanel />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
