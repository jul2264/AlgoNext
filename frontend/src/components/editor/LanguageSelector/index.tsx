import { useEditorStore } from '@/store/editorStore';
import { Settings, Play, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
];

const THEMES = [
  { id: 'vs-dark', name: 'Dark' },
  { id: 'light', name: 'Light' },
  { id: 'hc-black', name: 'High Contrast' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

export function LanguageSelector() {
  const { language, setLanguage, theme, setTheme, fontSize, setFontSize, isExecuting, runCode } = useEditorStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleRun = () => {
    runCode();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-6 relative">
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-bg-secondary text-text-primary border border-border-default rounded-md px-4 py-2 text-base font-medium focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <div ref={settingsRef} className="relative">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`transition-colors p-2 rounded-md flex items-center justify-center ${isSettingsOpen ? 'bg-bg-secondary text-accent-primary' : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'}`}
            title="Editor Settings"
          >
            <Settings size={24} />
          </button>

          {isSettingsOpen && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-bg-elevated border border-border-default rounded-lg shadow-xl z-50 p-4">
              <div className="flex justify-between items-center mb-4 border-b border-border-default pb-2">
                <h3 className="font-semibold text-text-primary">Editor Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-bg-secondary text-text-primary border border-border-default rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                  >
                    {THEMES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Font Size</label>
                  <select
                    value={fontSize.toString()}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full bg-bg-secondary text-text-primary border border-border-default rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent-primary transition-colors cursor-pointer"
                  >
                    {FONT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={isExecuting}
        className="flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white px-6 py-2.5 rounded-md font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExecuting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            Running...
          </>
        ) : (
          <>
            <Play size={20} fill="currentColor" />
            Run Code
          </>
        )}
      </button>
    </div>
  );
}
