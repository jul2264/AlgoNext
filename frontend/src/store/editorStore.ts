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
  activeProblemId: number | string | null;
  
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setFontSize: (size: number) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setOutput: (output: string | null) => void;
  setError: (error: string | null) => void;
  setActiveTestCaseId: (id: string | null) => void;
  setActiveProblemId: (id: number | string | null) => void;
  runCode: () => Promise<void>;
}

import { apiClient } from '@/services/api.client';

export const useEditorStore = create<EditorState>((set, get) => ({
  code: '// Write your solution here\n',
  language: 'python',
  theme: 'vs-dark',
  fontSize: 14,
  isExecuting: false,
  output: null,
  error: null,
  activeTestCaseId: null,
  activeProblemId: null,

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setOutput: (output) => set({ output }),
  setError: (error: string | null) => set({ error }),
  setActiveTestCaseId: (activeTestCaseId) => set({ activeTestCaseId }),
  setActiveProblemId: (activeProblemId) => set({ activeProblemId }),
  
  runCode: async () => {
    const { code, language, activeProblemId } = get();
    if (!activeProblemId) return;
    
    set({ isExecuting: true, error: null, output: null });
    
    try {
      const response = await apiClient.post('/submissions/', {
        problem: activeProblemId,
        code,
        language
      });
      
      const submissionId = response.data.id;
      
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const checkRes = await apiClient.get(`/submissions/${submissionId}/`);
          const status = checkRes.data.status.toUpperCase();
          
          if (status !== 'PENDING' && status !== 'RUNNING') {
            clearInterval(poll);
            set({ isExecuting: false });
            
            if (status === 'ACCEPTED') {
              set({ output: checkRes.data.stdout || 'Success! All test cases passed.' });
            } else {
              set({ error: `Status: ${status}\n\n${checkRes.data.stderr || checkRes.data.stdout || 'Execution failed.'}` });
            }
          }
        } catch (err: any) {
          clearInterval(poll);
          set({ isExecuting: false, error: 'Error polling submission status: ' + err.message });
        }
      }, 1500); // Poll every 1.5s
      
    } catch (err: any) {
      set({ 
        isExecuting: false, 
        error: err.response?.data?.detail || err.message || 'Failed to submit code' 
      });
    }
  }
}));
