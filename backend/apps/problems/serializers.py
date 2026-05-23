from rest_framework import serializers
from .models import Problem, TestCase, StarterCode, Solution

class StarterCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StarterCode
        fields = ['language', 'code']

class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = ['language', 'code', 'explanation']

class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ['id', 'input_data', 'expected_output', 'is_hidden', 'order']

class ProblemListSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_title = serializers.CharField(source='category.title', read_only=True)
    
    class Meta:
        model = Problem
        fields = ['id', 'title', 'slug', 'difficulty', 'category_slug', 'category_title', 'tags', 'has_visualizer', 'order']

class ProblemDetailSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_title = serializers.CharField(source='category.title', read_only=True)
    starter_codes = StarterCodeSerializer(many=True, read_only=True)
    test_cases = serializers.SerializerMethodField()
    
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'slug', 'difficulty', 'description', 'constraints', 'tags',
            'time_complexity', 'space_complexity', 'hints', 'editorial',
            'has_visualizer', 'visualizer_component', 'order', 'category_slug', 'category_title',
            'starter_codes', 'test_cases'
        ]

    def get_test_cases(self, obj):
        # Only return visible test cases to the frontend
        visible_cases = obj.test_cases.filter(is_hidden=False).order_by('order')
        return TestCaseSerializer(visible_cases, many=True).data
