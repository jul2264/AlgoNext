import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api.client';

export type SubmissionStatus = 
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'compilation_error'
  | 'runtime_error'
  | 'error';

export interface SubmissionResponse {
  id: string;
  status: SubmissionStatus;
  execution_time_ms: number | null;
  memory_used_kb: number | null;
  test_cases_passed: number;
  test_cases_total: number;
  stdout?: string;
  stderr?: string;
}

export function useSubmissionStatus() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCode = useCallback(async (problemSlug: string, code: string, language: string) => {
    try {
      setError(null);
      setSubmission(null);
      const { data } = await apiClient.post<SubmissionResponse>('/submissions/', {
        problem_slug: problemSlug,
        code,
        language
      });
      setSubmissionId(data.id);
      setSubmission(data);
      setIsPolling(true);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit code');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!submissionId || !isPolling) return;

    let pollCount = 0;
    const MAX_POLLS = 30; // Max 30 seconds

    const poll = async () => {
      try {
        const { data } = await apiClient.get<SubmissionResponse>(`/submissions/${submissionId}/`);
        setSubmission(data);

        // Stop polling if status is terminal
        if (data.status !== 'pending' && data.status !== 'running') {
          setIsPolling(false);
        } else if (pollCount >= MAX_POLLS) {
          setIsPolling(false);
          setError('Submission timed out');
        } else {
          pollCount++;
        }
      } catch (err: any) {
        setIsPolling(false);
        setError('Error fetching submission status');
      }
    };

    const intervalId = setInterval(poll, 1000); // Poll every second

    return () => clearInterval(intervalId);
  }, [submissionId, isPolling]);

  return {
    submission,
    isPolling,
    error,
    submitCode,
    setSubmissionId // useful for manually triggering a poll for an existing submission
  };
}
