import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from apps.users.models import User
import requests

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class that verifies Clerk JWTs.
    """
    
    def get_jwks(self):
        """Fetch the JSON Web Key Set from Clerk."""
        jwks_url = getattr(settings, 'CLERK_JWKS_URL', None)
        if not jwks_url:
            raise exceptions.AuthenticationFailed('Clerk JWKS URL is not configured.')
            
        try:
            response = requests.get(jwks_url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException:
            raise exceptions.AuthenticationFailed('Could not fetch JWKS from Clerk.')

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            # First get the unverified headers to find the kid
            unverified_headers = jwt.get_unverified_header(token)
            kid = unverified_headers.get('kid')
            
            # Fetch JWKS and find the matching key
            jwks = self.get_jwks()
            rsa_key = {}
            for key in jwks.get('keys', []):
                if key['kid'] == kid:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e']
                    }
                    break
                    
            if not rsa_key:
                raise exceptions.AuthenticationFailed('Invalid token key.')
                
            # Convert JWK to PEM public key string
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(rsa_key)
            
            # Verify the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                options={'verify_aud': False} # Customize as needed
            )
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token.')
            
        # Extract Clerk user ID
        clerk_id = payload.get('sub')
        if not clerk_id:
            raise exceptions.AuthenticationFailed('Token payload invalid.')
            
        # Get or create the local user
        try:
            user = User.objects.get(clerk_id=clerk_id)
        except User.DoesNotExist:
            # If the user doesn't exist, we might want to wait for the webhook,
            # or lazily create them here. Lazy creation is safer for API stability.
            user = User.objects.create(
                clerk_id=clerk_id,
                email=payload.get('email', f"{clerk_id}@clerk.local"), # Fallback
                first_name=payload.get('first_name', 'Student')
            )
            
        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled.')
            
        return (user, token)
