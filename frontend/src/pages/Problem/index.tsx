import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SplitPaneLayout } from '@/components/editor/SplitPane';
import { apiClient } from '@/services/api.client';
import { useEditorStore } from '@/store/editorStore';

export function ProblemPage() {
  const { slug } = useParams();
  const { setActiveProblemId } = useEditorStore();
  
  const { data: problem, isLoading, error } = useQuery({
    queryKey: ['problem', slug],
    queryFn: async () => {
      const response = await apiClient.get(`/problems/${slug}/`);
      return response.data;
    },
  });

  useEffect(() => {
    if (problem) {
      setActiveProblemId(problem.id);
    }
    return () => setActiveProblemId(null);
  }, [problem, setActiveProblemId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 neon-card neon-card-pink text-center">
          <p className="text-accent-primary font-bold text-xl">Failed to load problem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <SplitPaneLayout problem={problem} />
    </div>
  );
}
