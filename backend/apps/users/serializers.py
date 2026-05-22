from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'clerk_id', 'email', 'first_name', 'last_name', 'avatar_url', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'clerk_id', 'email', 'role', 'created_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar_url']
