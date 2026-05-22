from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProgressViewSet, UserSummaryView

app_name = 'progress'

router = DefaultRouter()
router.register(r'problems', UserProgressViewSet, basename='problem-progress')

urlpatterns = [
    path('summary/', UserSummaryView.as_view(), name='summary'),
    path('', include(router.urls)),
]
