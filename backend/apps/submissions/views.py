from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Submission
from apps.problems.models import Problem
from .serializers import SubmissionSerializer, SubmissionDetailSerializer

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows code submissions to be created and viewed.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user).order_by('-created_at')
        
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SubmissionDetailSerializer
        return SubmissionSerializer
        
    def perform_create(self, serializer):
        # The user is automatically attached to the submission
        submission = serializer.save(user=self.request.user)
        
        # Trigger the Celery task to execute code via Judge0
        from .tasks import evaluate_submission_task
        evaluate_submission_task.delay(submission.id)
        
    @action(detail=False, methods=['get'], url_path='problem/(?P<problem_slug>[-\w]+)')
    def for_problem(self, request, problem_slug=None):
        """Get all submissions by the current user for a specific problem."""
        try:
            problem = Problem.objects.get(slug=problem_slug)
        except Problem.DoesNotExist:
            return Response({'detail': 'Problem not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        submissions = self.get_queryset().filter(problem=problem)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)
