import { useEditorStore } from '@/store/editorStore';
import { Terminal, XCircle, CheckCircle2 } from 'lucide-react';

export function OutputPanel() {
  const { output, error, isExecuting } = useEditorStore();

  return (
    <div className="flex h-full flex-col bg-bg-secondary text-text-primary rounded-sm border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-elevated px-4 py-2 border-b border-border-default">
        <Terminal size={20} className="text-text-muted" />
        <h3 className="text-lg font-bold">Output</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isExecuting ? (
          <div className="flex items-center gap-3 text-text-muted">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-primary border-t-transparent" />
            Evaluating code...
          </div>
        ) : error ? (
          <div className="text-error whitespace-pre-wrap">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} />
              <span className="font-semibold">Execution Error</span>
            </div>
            {error}
          </div>
        ) : output ? (
          <div className="text-success whitespace-pre-wrap">
            <div className="flex items-center gap-2 mb-2 text-text-primary">
              <CheckCircle2 size={16} className="text-success" />
              <span className="font-semibold text-success">Execution Successful</span>
            </div>
            <div className="text-text-secondary mt-2 border-t border-border-default pt-2">
              <div className="text-text-muted text-xs mb-1">STDOUT:</div>
              {output}
            </div>
          </div>
        ) : (
          <div className="text-text-muted italic">
            Run your code to see the output here.
          </div>
        )}
      </div>
    </div>
  );
}
