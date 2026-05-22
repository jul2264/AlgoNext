import { create } from 'zustand';

interface EditorState {
  code: string;
  language: string;
  theme: string;
  fontSize: number;
  isExecuting: boolean;
  output: string | null;
  error: string | null;
  activeTestCaseId: string | null;
  
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setOutput: (output: string | null) => void;
  setError: (error: string | null) => void;
  setActiveTestCaseId: (id: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: '// Write your solution here\n',
  language: 'python',
  theme: 'vs-dark',
  fontSize: 14,
  isExecuting: false,
  output: null,
  error: null,
  activeTestCaseId: null,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  setActiveTestCaseId: (activeTestCaseId) => set({ activeTestCaseId }),
}));
