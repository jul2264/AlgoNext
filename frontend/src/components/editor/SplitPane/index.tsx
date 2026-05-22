import { Panel, Group, Separator } from 'react-resizable-panels';
import { ProblemStatement } from '../ProblemStatement';
import { CodeEditor } from '../CodeEditor';
import { LanguageSelector } from '../LanguageSelector';
import { TestCasePanel } from '../TestCasePanel';
import { OutputPanel } from '../OutputPanel';
import { GripVertical, GripHorizontal } from 'lucide-react';

// MOCK DATA
const MOCK_PROBLEM = {
  title: 'Two Sum',
  difficulty: 'easy' as const,
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`
`,
  constraints: `- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`,
};

export function SplitPaneLayout() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full p-2 bg-bg-primary">
      <Group orientation="horizontal" className="rounded-xl overflow-hidden border border-border-default shadow-2xl">
        
        {/* LEFT PANEL: Problem Description */}
        <Panel defaultSize={40} minSize={25}>
          <ProblemStatement {...MOCK_PROBLEM} />
        </Panel>

        <Separator className="w-2 bg-bg-tertiary flex items-center justify-center hover:bg-accent-primary/20 transition-colors cursor-col-resize group">
          <GripVertical size={14} className="text-text-muted group-hover:text-accent-primary" />
        </Separator>

        {/* RIGHT PANEL: Editor + Test Cases */}
        <Panel defaultSize={60} minSize={30}>
          <Group orientation="vertical">
            
            {/* TOP: Code Editor */}
            <Panel defaultSize={65} minSize={20} className="flex flex-col">
              <LanguageSelector />
              <div className="flex-1 overflow-hidden p-2 bg-bg-secondary">
                <CodeEditor />
              </div>
            </Panel>

            <Separator className="h-2 bg-bg-tertiary flex items-center justify-center hover:bg-accent-primary/20 transition-colors cursor-row-resize group">
              <GripHorizontal size={14} className="text-text-muted group-hover:text-accent-primary" />
            </Separator>

            {/* BOTTOM: Test Cases / Output */}
            <Panel defaultSize={35} minSize={20}>
              <div className="flex h-full gap-2 p-2 bg-bg-secondary">
                <div className="w-1/2">
                  <TestCasePanel />
                </div>
                <div className="w-1/2">
                  <OutputPanel />
                </div>
              </div>
            </Panel>

          </Group>
        </Panel>
      </Group>
    </div>
  );
}
