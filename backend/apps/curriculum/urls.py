from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LevelViewSet, ChapterViewSet, CategoryViewSet

app_name = 'curriculum'

router = DefaultRouter()
router.register(r'levels', LevelViewSet, basename='level')
router.register(r'chapters', ChapterViewSet, basename='chapter')
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]
