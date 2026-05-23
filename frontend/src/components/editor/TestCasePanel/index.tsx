import { useState, useEffect } from 'react';
import { FileCode2 } from 'lucide-react';

interface TestCase {
  id: number | string;
  input_data: string;
  expected_output: string;
  is_hidden?: boolean;
}

interface TestCasePanelProps {
  testCases: TestCase[];
}

export function TestCasePanel({ testCases = [] }: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState<number | string | null>(null);

  useEffect(() => {
    if (testCases.length > 0 && !activeTab) {
      setActiveTab(testCases[0].id);
    }
  }, [testCases, activeTab]);

  if (testCases.length === 0) {
    return (
      <div className="flex h-full flex-col bg-bg-secondary rounded-md border border-border-default overflow-hidden items-center justify-center text-text-muted p-4 text-center">
        <FileCode2 size={24} className="mb-2 opacity-50" />
        <p>No public test cases available for this problem.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg-secondary rounded-md border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-elevated px-4 py-2 border-b border-border-default">
        <FileCode2 size={16} className="text-text-muted" />
        <h3 className="text-sm font-medium text-text-primary">Test Cases</h3>
      </div>

      <div className="flex border-b border-border-default bg-bg-elevated/50 px-2 pt-2 overflow-x-auto scrollbar-hide">
        {testCases.map((tc, index) => (
          <button
            key={tc.id}
            onClick={() => setActiveTab(tc.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors relative top-[1px] whitespace-nowrap
              ${activeTab === tc.id 
                ? 'bg-bg-secondary text-text-primary border-t border-x border-border-default' 
                : 'text-text-muted hover:text-text-primary border-t border-x border-transparent'
              }`}
          >
            Case {index + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {testCases.map((tc) => (
          tc.id === activeTab && (
            <div key={tc.id} className="space-y-4">
              <div>
                <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Input</div>
                <div className="bg-bg-elevated p-3 rounded-md font-mono text-sm text-text-primary border border-border-default whitespace-pre-wrap">
                  {tc.input_data}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Expected Output</div>
                <div className="bg-bg-elevated p-3 rounded-md font-mono text-sm text-text-primary border border-border-default whitespace-pre-wrap">
                  {tc.expected_output}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
