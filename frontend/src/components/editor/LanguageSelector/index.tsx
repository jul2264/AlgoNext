import { useEditorStore } from '@/store/editorStore';
import { Settings, Play } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
];

export function LanguageSelector() {
  const { language, setLanguage, isExecuting, setIsExecuting } = useEditorStore();

  const handleRun = () => {
    setIsExecuting(true);
    // TODO: Connect to backend execution API
    setTimeout(() => setIsExecuting(false), 2000); // Mock execution
  };

  return (
    <div className="flex items-center justify-between bg-bg-elevated p-2 border-b border-border-default">
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-bg-secondary text-text-primary border border-border-default rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent-primary transition-colors"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          <Settings size={18} />
        </button>
      </div>

      <button
        onClick={handleRun}
        disabled={isExecuting}
        className="flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white px-4 py-1.5 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Running...
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            Run Code
          </>
        )}
      </button>
    </div>
  );
}
