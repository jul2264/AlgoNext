from rest_framework import serializers
from .models import UserSkillProfile, DifficultyRecommendation

class UserSkillProfileSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_title = serializers.CharField(source='category.title', read_only=True)
    
    class Meta:
        model = UserSkillProfile
        fields = [
            'id', 'category_slug', 'category_title', 'skill_score',
            'problems_attempted', 'problems_solved', 'avg_attempts_to_solve',
            'last_attempt_date'
        ]

class DifficultyRecommendationSerializer(serializers.ModelSerializer):
    problem_slug = serializers.CharField(source='problem.slug', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    
    class Meta:
        model = DifficultyRecommendation
        fields = ['id', 'problem_slug', 'problem_title', 'recommended_difficulty', 'reason']
