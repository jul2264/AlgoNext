from django.db import models
from common.base_models import TimeStampedModel

class UserProgress(TimeStampedModel):
    class Status(models.TextChoices):
        NOT_STARTED = 'not_started', 'Not Started'
        ATTEMPTED = 'attempted', 'Attempted'
        SOLVED = 'solved', 'Solved'
    
    user = models.ForeignKey('users.User', related_name='progress', on_delete=models.CASCADE)
    problem = models.ForeignKey('problems.Problem', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    attempts = models.PositiveIntegerField(default=0)
    best_submission = models.ForeignKey(
        'submissions.Submission', null=True, blank=True, on_delete=models.SET_NULL
    )
    solved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'user_progress'
        unique_together = ['user', 'problem']

class UserStreak(TimeStampedModel):
    user = models.OneToOneField('users.User', related_name='streak', on_delete=models.CASCADE)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'user_streaks'

class UserXP(TimeStampedModel):
    user = models.OneToOneField('users.User', related_name='xp', on_delete=models.CASCADE)
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'user_xp'
    
    @staticmethod
    def xp_for_level(level):
        return level * 100  # Simple: 100 XP per level

class Badge(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    criteria = models.JSONField()  # {"type": "problems_solved", "count": 50}
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'badges'
    
    def __str__(self):
        return self.name

class UserBadge(TimeStampedModel):
    user = models.ForeignKey('users.User', related_name='badges', on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'user_badges'
        unique_together = ['user', 'badge']

class DailyActivity(TimeStampedModel):
    user = models.ForeignKey('users.User', related_name='daily_activities', on_delete=models.CASCADE)
    date = models.DateField()
    problems_solved = models.PositiveIntegerField(default=0)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'daily_activities'
        unique_together = ['user', 'date']
