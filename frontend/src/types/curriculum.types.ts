// AlgoNext — Curriculum Types

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  moduleId: string;
  problems: Problem[];
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  icon?: string;
  topics: Topic[];
  totalProblems: number;
  completedProblems: number;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topicId: string;
  order: number;
  isPremium: boolean;
  tags: string[];
  acceptance?: number;
  description?: string;
  constraints?: string;
  examples?: ProblemExample[];
  hints?: string[];
  starterCode?: Record<string, string>;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CurriculumProgress {
  moduleId: string;
  completedProblems: number;
  totalProblems: number;
  percentage: number;
}
