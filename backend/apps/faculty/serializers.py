from rest_framework import serializers
from .models import Class, ClassEnrollment, Assignment
from apps.users.serializers import UserSerializer
from apps.problems.serializers import ProblemListSerializer

class ClassSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    student_count = serializers.IntegerField(source='enrollments.count', read_only=True)
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'description', 'join_code', 'is_active', 'teacher', 'student_count', 'created_at']
        read_only_fields = ['join_code', 'is_active', 'teacher', 'created_at']

class ClassEnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    class_group = ClassSerializer(read_only=True)
    
    class Meta:
        model = ClassEnrollment
        fields = ['id', 'class_group', 'student', 'enrolled_at']

class AssignmentSerializer(serializers.ModelSerializer):
    problems = ProblemListSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='class_group.name', read_only=True)
    
    class Meta:
        model = Assignment
        fields = ['id', 'class_group', 'class_name', 'title', 'description', 'problems', 'due_date', 'is_published', 'created_at']
