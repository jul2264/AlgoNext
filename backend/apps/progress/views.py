from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserProgress, UserStreak, UserXP, UserBadge, DailyActivity
from .serializers import (
    UserProgressSerializer, UserStreakSerializer, UserXPSerializer, 
    UserBadgeSerializer, DailyActivitySerializer
)

class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProgressSerializer
    
    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

class UserSummaryView(views.APIView):
    """Returns a high-level summary of user progress, streak, and XP."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get or create streak and XP
        streak, _ = UserStreak.objects.get_or_create(user=user)
        xp, _ = UserXP.objects.get_or_create(user=user)
        
        # Get recent badges
        recent_badges = UserBadge.objects.filter(user=user).select_related('badge').order_by('-earned_at')[:5]
        
        # Get recent activity (last 365 days for GitHub heatmap)
        one_year_ago = timezone.now().date() - timedelta(days=365)
        recent_activity = DailyActivity.objects.filter(user=user, date__gte=one_year_ago).order_by('-date')
        
        # Get solved problems count
        solved_count = UserProgress.objects.filter(user=user, status=UserProgress.Status.SOLVED).count()
        
        return Response({
            'streak': UserStreakSerializer(streak).data,
            'xp': UserXPSerializer(xp).data,
            'solved_count': solved_count,
            'recent_badges': UserBadgeSerializer(recent_badges, many=True).data,
            'recent_activity': DailyActivitySerializer(recent_activity, many=True).data
        })
