from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Problem
from .serializers import ProblemListSerializer, ProblemDetailSerializer

class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows problems to be viewed or searched.
    """
    queryset = Problem.objects.filter(is_published=True).prefetch_related('starter_codes', 'category')
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'category__slug']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['order', 'difficulty', 'created_at']
    ordering = ['order']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProblemListSerializer
        return ProblemDetailSerializer
