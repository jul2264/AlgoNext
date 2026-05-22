from rest_framework import serializers
from .models import Level, Chapter, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug', 'order']

class ChapterSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Chapter
        fields = ['id', 'title', 'description', 'order', 'icon', 'categories']

class LevelSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    
    class Meta:
        model = Level
        fields = ['id', 'title', 'description', 'order', 'icon', 'badge_name', 'chapters']

class LevelListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'title', 'description', 'order', 'icon', 'badge_name']
