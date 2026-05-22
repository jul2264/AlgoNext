import { Panel, Group, Separator } from 'react-resizable-panels';
import { CodeEditor } from '../CodeEditor';
import { LanguageSelector } from '../LanguageSelector';
import { TestCasePanel } from '../TestCasePanel';
import { OutputPanel } from '../OutputPanel';
import { GripVertical, GripHorizontal } from 'lucide-react';
import { WorkspaceLeftPane } from './WorkspaceLeftPane';

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
      <Group orientation="horizontal" className="rounded-xl overflow-hidden shadow-2xl">
        
        {/* LEFT PANEL: Problem / Visualizer / Tutor Tabs */}
        <Panel defaultSize={40} minSize={25}>
          <WorkspaceLeftPane problem={MOCK_PROBLEM} />
        </Panel>

        <Separator className="w-2 mx-1 bg-bg-primary flex items-center justify-center hover:bg-accent-primary/20 transition-colors cursor-col-resize group rounded-full my-auto h-24">
          <GripVertical size={14} className="text-text-muted group-hover:text-accent-primary opacity-50" />
        </Separator>

        {/* RIGHT PANEL: Editor + Test Cases */}
        <Panel defaultSize={60} minSize={30}>
          <Group orientation="vertical" className="bg-bg-elevated border border-border-default rounded-xl overflow-hidden shadow-lg">
            
            {/* TOP: Code Editor */}
            <Panel defaultSize={65} minSize={20} className="flex flex-col bg-bg-secondary">
              <div className="border-b border-border-default bg-bg-secondary/80 backdrop-blur-md">
                <LanguageSelector />
              </div>
              <div className="flex-1 overflow-hidden p-2 bg-bg-primary/50 neo-container m-2 border-none">
                <CodeEditor />
              </div>
            </Panel>

            <Separator className="h-2 my-1 bg-bg-primary flex items-center justify-center hover:bg-accent-primary/20 transition-colors cursor-row-resize group rounded-full mx-auto w-24">
              <GripHorizontal size={14} className="text-text-muted group-hover:text-accent-primary opacity-50" />
            </Separator>

            {/* BOTTOM: Test Cases / Output */}
            <Panel defaultSize={35} minSize={20} className="bg-bg-secondary">
              <div className="flex h-full gap-2 p-2">
                <div className="w-1/2 neo-container p-1 overflow-hidden">
                  <TestCasePanel />
                </div>
                <div className="w-1/2 neo-container p-1 overflow-hidden">
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
