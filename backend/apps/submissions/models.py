from django.db import models
from common.base_models import TimeStampedModel


class Submission(TimeStampedModel):
    """A code submission for a problem by a user."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        ACCEPTED = 'accepted', 'Accepted'
        WRONG_ANSWER = 'wrong_answer', 'Wrong Answer'
        TLE = 'time_limit_exceeded', 'Time Limit Exceeded'
        MLE = 'memory_limit_exceeded', 'Memory Limit Exceeded'
        RUNTIME_ERROR = 'runtime_error', 'Runtime Error'
        COMPILATION_ERROR = 'compilation_error', 'Compilation Error'

    user = models.ForeignKey(
        'users.User', related_name='submissions', on_delete=models.CASCADE
    )
    problem = models.ForeignKey(
        'problems.Problem', related_name='submissions', on_delete=models.CASCADE
    )
    code = models.TextField()
    language = models.CharField(max_length=20)
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING
    )
    stdout = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    execution_time_ms = models.FloatField(null=True, blank=True)
    memory_used_kb = models.IntegerField(null=True, blank=True)
    test_cases_passed = models.IntegerField(default=0)
    test_cases_total = models.IntegerField(default=0)
    judge0_token = models.CharField(max_length=100, blank=True)

    class Meta(TimeStampedModel.Meta):
        db_table = 'submissions'

    def __str__(self):
        return f"{self.user} → {self.problem} [{self.status}]"
