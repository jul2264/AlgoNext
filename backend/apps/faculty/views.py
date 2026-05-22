from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Class, ClassEnrollment, Assignment
from .serializers import ClassSerializer, ClassEnrollmentSerializer, AssignmentSerializer

class IsTeacherPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_teacher

class ClassViewSet(viewsets.ModelViewSet):
    """Manage faculty classes."""
    serializer_class = ClassSerializer
    
    def get_permissions(self):
        if self.action in ['join']:
            return [permissions.IsAuthenticated()]
        return [IsTeacherPermission()]
        
    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            return Class.objects.filter(teacher=user)
        # Students can see classes they are enrolled in
        return Class.objects.filter(enrollments__student=user)
        
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)
        
    @action(detail=False, methods=['post'], url_path='join')
    def join(self, request):
        """Student endpoint to join a class using a code."""
        join_code = request.data.get('join_code')
        if not join_code:
            return Response({'detail': 'Join code is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            class_group = Class.objects.get(join_code=join_code, is_active=True)
            enrollment, created = ClassEnrollment.objects.get_or_create(
                class_group=class_group,
                student=request.user
            )
            if created:
                return Response({'detail': 'Successfully joined class.', 'class': ClassSerializer(class_group).data})
            return Response({'detail': 'Already enrolled in this class.'}, status=status.HTTP_200_OK)
        except Class.DoesNotExist:
            return Response({'detail': 'Invalid or inactive join code.'}, status=status.HTTP_404_NOT_FOUND)

class AssignmentViewSet(viewsets.ModelViewSet):
    """Manage assignments for a class."""
    serializer_class = AssignmentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsTeacherPermission()]
        
    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            return Assignment.objects.filter(class_group__teacher=user)
        return Assignment.objects.filter(class_group__enrollments__student=user, is_published=True)
