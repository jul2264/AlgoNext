// AlgoNext — Submission Types

export type SubmissionStatus =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compilation_error';

export interface TestCaseResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
  memoryUsed?: number;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  executionTime?: number;
  memoryUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RunCodeRequest {
  problemId: string;
  language: string;
  code: string;
  testCases?: string[];
}

export interface RunCodeResponse {
  submissionId: string;
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  executionTime?: number;
  memoryUsed?: number;
  stdout?: string;
  stderr?: string;
}
