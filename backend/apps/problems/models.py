from django.db import models
from common.base_models import TimeStampedModel


class Problem(TimeStampedModel):
    """An algorithm/data structure problem for students to solve."""

    class Difficulty(models.TextChoices):
        EASY = 'easy', 'Easy'
        MEDIUM = 'medium', 'Medium'
        HARD = 'hard', 'Hard'

    category = models.ForeignKey(
        'curriculum.Category', related_name='problems', on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices)
    description = models.TextField()  # Markdown content
    constraints = models.JSONField(default=list)
    tags = models.JSONField(default=list)
    time_complexity = models.CharField(max_length=50, blank=True)
    space_complexity = models.CharField(max_length=50, blank=True)
    hints = models.JSONField(default=list)  # 3-tier hints
    editorial = models.TextField(blank=True)
    has_visualizer = models.BooleanField(default=False)
    visualizer_component = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'users.User', null=True, blank=True, on_delete=models.SET_NULL
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'problems'
        ordering = ['order', 'difficulty']

    def __str__(self):
        return f"[{self.difficulty}] {self.title}"


class TestCase(TimeStampedModel):
    """Test case for a problem with input/output pairs."""
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta(TimeStampedModel.Meta):
        db_table = 'test_cases'
        ordering = ['order']


class StarterCode(TimeStampedModel):
    """Starter code template for a problem in a specific language."""
    LANGUAGE_CHOICES = [
        ('python', 'Python'),
        ('cpp', 'C++'),
        ('java', 'Java'),
    ]

    problem = models.ForeignKey(Problem, related_name='starter_codes', on_delete=models.CASCADE)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    code = models.TextField()

    class Meta(TimeStampedModel.Meta):
        db_table = 'starter_codes'
        unique_together = ['problem', 'language']


class Solution(TimeStampedModel):
    """Reference solution for a problem in a specific language."""
    problem = models.ForeignKey(Problem, related_name='solutions', on_delete=models.CASCADE)
    language = models.CharField(max_length=20, choices=StarterCode.LANGUAGE_CHOICES)
    code = models.TextField()
    explanation = models.TextField(blank=True)

    class Meta(TimeStampedModel.Meta):
        db_table = 'solutions'
        unique_together = ['problem', 'language']
