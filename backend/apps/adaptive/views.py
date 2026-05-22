from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import UserSkillProfile, DifficultyRecommendation
from .serializers import UserSkillProfileSerializer, DifficultyRecommendationSerializer
from apps.problems.models import Problem
from apps.curriculum.models import Category

class UserSkillProfileViewSet(viewsets.ReadOnlyModelViewSet):
    """View user skill scores across different categories."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSkillProfileSerializer
    
    def get_queryset(self):
        return UserSkillProfile.objects.filter(user=self.request.user).select_related('category')

class RecommendationView(views.APIView):
    """Get personalized problem recommendations based on skill profile."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Return recent recommendations
        recs = DifficultyRecommendation.objects.filter(
            user=request.user, was_accepted=False
        ).select_related('problem').order_by('-created_at')[:5]
        
        return Response(DifficultyRecommendationSerializer(recs, many=True).data)
        
    def post(self, request):
        """Generate new recommendations. This would interface with the ML engine."""
        # This is a placeholder for the actual adaptive engine logic
        # engine = AdaptiveDifficultyEngine(request.user)
        # new_recs = engine.generate_recommendations()
        
        return Response({'detail': 'Recommendations generation triggered.'}, status=status.HTTP_202_ACCEPTED)
