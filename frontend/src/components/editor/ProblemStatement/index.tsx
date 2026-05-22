import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, AlertCircle } from 'lucide-react';

interface ProblemStatementProps {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  constraints: string;
}

export function ProblemStatement({ title, difficulty, description, constraints }: ProblemStatementProps) {
  const difficultyColors = {
    easy: 'text-easy bg-easy/10 border-easy/20',
    medium: 'text-medium bg-medium/10 border-medium/20',
    hard: 'text-hard bg-hard/10 border-hard/20',
  };

  return (
    <div className="flex h-full flex-col bg-bg-secondary rounded-md border border-border-default overflow-hidden">
      <div className="flex items-center justify-between bg-bg-elevated px-6 py-4 border-b border-border-default">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-accent-primary" />
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[difficulty]} uppercase tracking-wider`}>
          {difficulty}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Description Markdown */}
        <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description}
          </ReactMarkdown>
        </div>

        {/* Constraints */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <AlertCircle size={18} className="text-accent-secondary" />
            <h3>Constraints</h3>
          </div>
          <div className="bg-bg-elevated/50 border border-border-default rounded-md p-4">
            <div className="prose prose-invert prose-sm max-w-none prose-code:text-accent-secondary prose-code:bg-bg-tertiary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {constraints}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
