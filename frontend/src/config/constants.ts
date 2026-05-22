// AlgoNext — Application Constants

export const APP_NAME = 'AlgoNext';
export const APP_DESCRIPTION = 'Master Data Structures & Algorithms with AI-powered learning';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

// Clerk Configuration
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

// Feature Flags
export const FEATURES = {
  AI_TUTOR: import.meta.env.VITE_ENABLE_AI_TUTOR === 'true',
  VISUALIZER: import.meta.env.VITE_ENABLE_VISUALIZER === 'true',
} as const;

// Difficulty Levels
export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

// Submission Statuses
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  ACCEPTED: 'accepted',
  WRONG_ANSWER: 'wrong_answer',
  TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED: 'memory_limit_exceeded',
  RUNTIME_ERROR: 'runtime_error',
  COMPILATION_ERROR: 'compilation_error',
} as const;
