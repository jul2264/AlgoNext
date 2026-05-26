import { Editor } from '@monaco-editor/react';
import { useEditorStore } from '@/store/editorStore';

export function CodeEditor() {
  const { code, language, theme, fontSize, setCode } = useEditorStore();

  return (
    <div className="h-full w-full rounded-sm border border-border-default overflow-hidden bg-bg-secondary">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={code}
        onChange={(value) => setCode(value || '')}
        options={{
          fontSize,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 16 },
          fontFamily: 'var(--font-mono)',
        }}
        loading={
          <div className="flex h-full items-center justify-center text-text-muted">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
