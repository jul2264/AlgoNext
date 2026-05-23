from rest_framework import views, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from svix.webhooks import Webhook, WebhookVerificationError
from .models import User
from .serializers import UserSerializer, UserUpdateSerializer

class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get or update the current authenticated user's profile."""
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # The user is attached to the request by the Clerk auth middleware
        return self.request.user
        
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

class ClerkWebhookView(views.APIView):
    """Webhook to sync users from Clerk when they are created/updated."""
    permission_classes = []  # Handled by Svix webhook signature verification
    
    def post(self, request):
        secret = getattr(settings, 'CLERK_WEBHOOK_SECRET', None)
        if not secret:
            return Response({'error': 'Webhook secret not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        payload = request.body
        headers = request.headers
        
        try:
            wh = Webhook(secret)
            event = wh.verify(payload, headers)
        except WebhookVerificationError:
            return Response({'error': 'Invalid svix signature'}, status=status.HTTP_400_BAD_REQUEST)
            
        evt_type = event.get('type')
        data = event.get('data', {})
        
        if evt_type == 'user.created' or evt_type == 'user.updated':
            email = data.get('email_addresses', [{}])[0].get('email_address', '')
            user, created = User.objects.update_or_create(
                clerk_id=data.get('id'),
                defaults={
                    'email': email,
                    'first_name': data.get('first_name', ''),
                    'last_name': data.get('last_name', ''),
                    'avatar_url': data.get('image_url', ''),
                }
            )
            return Response({'status': 'synced'}, status=status.HTTP_200_OK)
            
        elif evt_type == 'user.deleted':
            User.objects.filter(clerk_id=data.get('id')).update(is_active=False)
            return Response({'status': 'deactivated'}, status=status.HTTP_200_OK)
            
        return Response({'status': 'ignored'}, status=status.HTTP_200_OK)
