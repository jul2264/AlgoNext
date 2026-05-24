from django.urls import path
from .views import CurrentUserView, ClerkWebhookView, BecomeTeacherView

app_name = 'users'

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('become-teacher/', BecomeTeacherView.as_view(), name='become-teacher'),
    
    # Webhooks
    path('webhook/', ClerkWebhookView.as_view(), name='clerk-webhook'),
]
