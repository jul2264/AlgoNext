import { Panel, Group, Separator } from 'react-resizable-panels';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { OutputPanel } from '@/components/editor/OutputPanel';
import { InputPanel } from '@/components/editor/InputPanel';
import { LanguageSelector } from '@/components/editor/LanguageSelector';
import { GripHorizontal } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

export function PlaygroundPage() {
  const { setActiveProblemId, setCode, setLanguage, runCode } = useEditorStore();
  const location = useLocation();
  const state = location.state as { code?: string; language?: string; execute?: boolean } | null;

  useEffect(() => {
    setActiveProblemId(null);
    
    if (state?.code) {
      setCode(state.code);
      if (state.language) {
        setLanguage(state.language);
      }
      if (state.execute) {
        // Run code after Zustand state commits
        setTimeout(() => {
          runCode();
        }, 100);
      }
    } else {
      setCode('print("Hello from the Playground!")');
      setLanguage('python');
    }
    
    return () => {
      setActiveProblemId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      className="w-full mx-auto pb-12 flex flex-col min-h-[calc(100vh-4rem)]"
      style={{ paddingLeft: '3vw', paddingRight: '3vw' }}
    >
      <PageHeader>
        <h1 className="text-4xl font-bold text-text-primary font-display">
          Code <span className="text-accent-secondary">Playground</span>
        </h1>
      </PageHeader>

      <div className="flex-1 flex justify-center w-full mt-4">
        <div className="max-w-5xl w-full h-[70vh] min-h-[500px] flex flex-col">
          <div className="flex justify-end" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <LanguageSelector />
          </div>
          <div className="flex-1 rounded-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-border-default/50">
          <Group orientation="vertical">
            {/* TOP: Editor */}
            <Panel defaultSize={60} minSize={30}>
              <div className="h-full border-b border-border-default overflow-hidden bg-bg-secondary">
                <CodeEditor />
              </div>
            </Panel>

            <Separator className="h-3 bg-bg-primary flex items-center justify-center hover:bg-accent-secondary/20 transition-colors cursor-row-resize group relative z-10">
              <div className="w-12 h-1.5 rounded-full bg-border-default group-hover:bg-accent-secondary flex items-center justify-center transition-colors shadow-sm">
                <GripHorizontal size={14} className="text-bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Separator>

            {/* BOTTOM: Test Cases / Output */}
            <Panel defaultSize={40} minSize={20} className="bg-bg-secondary overflow-hidden">
              <div className="flex h-full gap-8 p-6">
                <div className="w-1/2 neon-card p-1 overflow-hidden h-full rounded-md">
                <InputPanel />
              </div>
              <div className="w-1/2 neon-card p-1 overflow-hidden h-full rounded-md">
                <OutputPanel />
              </div>
            </div>
          </Panel>
          </Group>
        </div>
      </div>
    </div>
  </div>
  );
}
