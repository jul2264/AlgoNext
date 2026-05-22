import { useState } from 'react';
import { Check, X, FileCode2 } from 'lucide-react';

// Mock test cases (to be replaced with actual API data)
const MOCK_TEST_CASES = [
  { id: '1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', status: 'passed' },
  { id: '2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', status: 'failed' },
  { id: '3', input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]', status: 'pending' },
];

export function TestCasePanel() {
  const [activeTab, setActiveTab] = useState(MOCK_TEST_CASES[0].id);

  return (
    <div className="flex h-full flex-col bg-bg-secondary rounded-md border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 bg-bg-elevated px-4 py-2 border-b border-border-default">
        <FileCode2 size={16} className="text-text-muted" />
        <h3 className="text-sm font-medium text-text-primary">Test Cases</h3>
      </div>

      <div className="flex border-b border-border-default bg-bg-elevated/50 px-2 pt-2">
        {MOCK_TEST_CASES.map((tc, index) => (
          <button
            key={tc.id}
            onClick={() => setActiveTab(tc.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors relative top-[1px]
              ${activeTab === tc.id 
                ? 'bg-bg-secondary text-text-primary border-t border-x border-border-default' 
                : 'text-text-muted hover:text-text-primary border-t border-x border-transparent'
              }`}
          >
            Case {index + 1}
            {tc.status === 'passed' && <Check size={14} className="text-success" />}
            {tc.status === 'failed' && <X size={14} className="text-error" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {MOCK_TEST_CASES.map((tc) => (
          tc.id === activeTab && (
            <div key={tc.id} className="space-y-4">
              <div>
                <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Input</div>
                <div className="bg-bg-elevated p-3 rounded-md font-mono text-sm text-text-primary border border-border-default">
                  {tc.input}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Expected Output</div>
                <div className="bg-bg-elevated p-3 rounded-md font-mono text-sm text-text-primary border border-border-default">
                  {tc.expectedOutput}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
