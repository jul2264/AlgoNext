from django.db import models
from common.base_models import TimeStampedModel

class UserSkillProfile(TimeStampedModel):
    user = models.ForeignKey('users.User', related_name='skill_profiles', on_delete=models.CASCADE)
    category = models.ForeignKey('curriculum.Category', on_delete=models.CASCADE)
    skill_score = models.FloatField(default=0.5)  # 0.0 (novice) to 1.0 (expert)
    problems_attempted = models.PositiveIntegerField(default=0)
    problems_solved = models.PositiveIntegerField(default=0)
    avg_attempts_to_solve = models.FloatField(default=0)
    last_attempt_date = models.DateTimeField(null=True, blank=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'user_skill_profiles'
        unique_together = ['user', 'category']

class DifficultyRecommendation(TimeStampedModel):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='recommendations')
    problem = models.ForeignKey('problems.Problem', on_delete=models.CASCADE)
    recommended_difficulty = models.CharField(max_length=20)
    reason = models.CharField(max_length=200)
    was_accepted = models.BooleanField(default=False)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'difficulty_recommendations'
