from django.db import models
from common.base_models import TimeStampedModel


class Level(TimeStampedModel):
    """Represents a curriculum level (e.g., Beginner, Intermediate, Advanced)."""
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(unique=True)
    icon = models.CharField(max_length=50, blank=True)
    badge_name = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        db_table = 'levels'
        ordering = ['order']

    def __str__(self):
        return f"Level {self.order}: {self.title}"


class Chapter(TimeStampedModel):
    """Represents a chapter within a level."""
    level = models.ForeignKey(Level, related_name='chapters', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField()
    icon = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        db_table = 'chapters'
        ordering = ['order']
        unique_together = ['level', 'order']

    def __str__(self):
        return f"Ch{self.order}: {self.title}"


class Category(TimeStampedModel):
    """Represents a problem category within a chapter (e.g., Arrays, Linked Lists)."""
    chapter = models.ForeignKey(Chapter, related_name='categories', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    order = models.PositiveIntegerField()

    class Meta(TimeStampedModel.Meta):
        db_table = 'categories'
        ordering = ['order']
        unique_together = ['chapter', 'order']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.title
