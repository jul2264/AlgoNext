// AlgoNext — Supported Languages Configuration

export interface LanguageConfig {
  id: string;
  label: string;
  monacoLanguage: string;
  extension: string;
  defaultTemplate: string;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  python: {
    id: 'python',
    label: 'Python 3',
    monacoLanguage: 'python',
    extension: '.py',
    defaultTemplate: `class Solution:\n    def solve(self):\n        pass\n`,
  },
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    extension: '.js',
    defaultTemplate: `/**\n * @param {void}\n * @return {void}\n */\nfunction solve() {\n  \n}\n`,
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    monacoLanguage: 'typescript',
    extension: '.ts',
    defaultTemplate: `function solve(): void {\n  \n}\n`,
  },
  java: {
    id: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    extension: '.java',
    defaultTemplate: `class Solution {\n    public void solve() {\n        \n    }\n}\n`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    extension: '.cpp',
    defaultTemplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n`,
  },
} as const;

export const DEFAULT_LANGUAGE = 'python';

export const LANGUAGE_OPTIONS = Object.values(LANGUAGES);
