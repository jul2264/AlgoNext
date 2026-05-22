from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassViewSet, AssignmentViewSet

app_name = 'faculty'

router = DefaultRouter()
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
]
