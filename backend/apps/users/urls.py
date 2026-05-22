from django.urls import path
from .views import CurrentUserView, ClerkWebhookView

app_name = 'users'

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('webhook/', ClerkWebhookView.as_view(), name='clerk-webhook'),
]
