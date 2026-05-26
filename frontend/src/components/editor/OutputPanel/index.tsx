import { useEditorStore } from '@/store/editorStore';
import { Terminal, XCircle, CheckCircle2 } from 'lucide-react';

export function OutputPanel() {
  const { output, error, isExecuting } = useEditorStore();

  return (
    <div className="flex h-full flex-col bg-bg-secondary text-text-primary rounded-sm border border-border-default overflow-hidden">
      <div className="flex items-center justify-between bg-bg-elevated border-b border-border-default" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-text-muted" />
          <h3 className="text-lg font-bold">Output</h3>
        </div>
        {!isExecuting && (
          <>
            {error && (
              <div className="flex items-center gap-2 text-error text-sm font-semibold select-none">
                <XCircle size={16} />
                <span>Execution Error</span>
              </div>
            )}
            {output && (
              <div className="flex items-center gap-2 text-success text-sm font-semibold select-none">
                <CheckCircle2 size={16} />
                <span>Execution Successful</span>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="flex-1 overflow-auto font-mono text-sm" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.2rem', paddingBottom: '1rem' }}>
        {isExecuting ? (
          <div className="flex items-center gap-3 text-text-muted text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-primary border-t-transparent" />
            Evaluating code...
          </div>
        ) : error ? (
          <div className="text-error whitespace-pre-wrap">
            {error}
          </div>
        ) : output ? (
          <div className="text-text-primary whitespace-pre-wrap leading-relaxed">
            {output}
          </div>
        ) : (
          <div className="text-text-muted italic text-sm">
            Run your code to see the output here.
          </div>
        )}
      </div>
    </div>
  );
}
