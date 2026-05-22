from rest_framework import serializers
from .models import Submission

class SubmissionSerializer(serializers.ModelSerializer):
    problem_slug = serializers.CharField(source='problem.slug', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            'id', 'problem', 'problem_slug', 'problem_title', 'code', 'language',
            'status', 'execution_time_ms', 'memory_used_kb', 'test_cases_passed',
            'test_cases_total', 'created_at'
        ]
        read_only_fields = [
            'status', 'execution_time_ms', 'memory_used_kb', 'test_cases_passed',
            'test_cases_total', 'created_at'
        ]

class SubmissionDetailSerializer(SubmissionSerializer):
    class Meta(SubmissionSerializer.Meta):
        fields = SubmissionSerializer.Meta.fields + ['stdout', 'stderr']
