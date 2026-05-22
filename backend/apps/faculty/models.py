from django.db import models
from common.base_models import TimeStampedModel
import secrets
import string

def generate_join_code():
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

class Class(TimeStampedModel):
    teacher = models.ForeignKey('users.User', related_name='taught_classes', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    join_code = models.CharField(max_length=8, unique=True, default=generate_join_code)
    is_active = models.BooleanField(default=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'classes'
        verbose_name_plural = 'classes'
    
    def __str__(self):
        return f"{self.name} ({self.teacher.full_name})"

class ClassEnrollment(TimeStampedModel):
    class_group = models.ForeignKey(Class, related_name='enrollments', on_delete=models.CASCADE)
    student = models.ForeignKey('users.User', related_name='enrollments', on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'class_enrollments'
        unique_together = ['class_group', 'student']

class Assignment(TimeStampedModel):
    class_group = models.ForeignKey(Class, related_name='assignments', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    problems = models.ManyToManyField('problems.Problem', related_name='assignments', blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    
    class Meta(TimeStampedModel.Meta):
        db_table = 'assignments'
    
    def __str__(self):
        return f"{self.title} — {self.class_group.name}"
