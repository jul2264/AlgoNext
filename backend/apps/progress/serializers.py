from rest_framework import serializers
from .models import UserProgress, UserStreak, UserXP, Badge, UserBadge, DailyActivity

class UserProgressSerializer(serializers.ModelSerializer):
    problem_slug = serializers.CharField(source='problem.slug', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'problem_slug', 'problem_title', 'status', 'attempts', 'solved_at', 'updated_at']

class UserStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStreak
        fields = ['current_streak', 'longest_streak', 'last_activity_date']

class UserXPSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserXP
        fields = ['total_xp', 'level']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['badge', 'earned_at']

class DailyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivity
        fields = ['date', 'problems_solved', 'time_spent_minutes']
