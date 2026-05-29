from rest_framework import serializers
from .models import Submission

class SubmissionSerializer(serializers.ModelSerializer):
    problem_slug = serializers.SerializerMethodField()
    problem_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = [
            'id', 'problem', 'problem_slug', 'problem_title', 'code', 'language', 'custom_input',
            'status', 'execution_time_ms', 'memory_used_kb', 'test_cases_passed',
            'test_cases_total', 'created_at'
        ]
        read_only_fields = [
            'status', 'execution_time_ms', 'memory_used_kb', 'test_cases_passed',
            'test_cases_total', 'created_at'
        ]
        extra_kwargs = {
            'problem': {'required': False, 'allow_null': True}
        }

    def get_problem_slug(self, obj):
        return obj.problem.slug if obj.problem else None

    def get_problem_title(self, obj):
        return obj.problem.title if obj.problem else "Playground Run"

class SubmissionDetailSerializer(SubmissionSerializer):
    class Meta(SubmissionSerializer.Meta):
        fields = SubmissionSerializer.Meta.fields + ['stdout', 'stderr']
