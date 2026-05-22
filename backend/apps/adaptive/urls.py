from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserSkillProfileViewSet, RecommendationView

app_name = 'adaptive'

router = DefaultRouter()
router.register(r'skills', UserSkillProfileViewSet, basename='skill-profile')

urlpatterns = [
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
    path('', include(router.urls)),
]
