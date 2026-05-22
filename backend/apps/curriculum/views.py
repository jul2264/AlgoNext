from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Level, Chapter, Category
from .serializers import LevelSerializer, LevelListSerializer, ChapterSerializer, CategorySerializer

class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for Curriculum Levels."""
    permission_classes = [AllowAny]
    queryset = Level.objects.filter(is_published=True).prefetch_related('chapters__categories')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LevelListSerializer
        return LevelSerializer

class ChapterViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for Chapters."""
    permission_classes = [AllowAny]
    queryset = Chapter.objects.filter(is_published=True).prefetch_related('categories')
    serializer_class = ChapterSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for Categories."""
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
