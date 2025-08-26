from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user registration
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'confirm_password')
        extra_kwargs = {
            'username': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        # Remove confirm_password from validated_data
        validated_data.pop('confirm_password', None)
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Simplified serializer for user login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Authenticate using email instead of username
            user = authenticate(
                request=self.context.get('request'),
                username=email,  # Django auth uses username field, but we pass email
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".'
            )


class UserSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user details
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    Only allows updating username, email is read-only
    """
    class Meta:
        model = User
        fields = ('username',)
        
    def validate_username(self, value):
        """
        Check that the username is not already taken by another user
        """
        user = self.instance
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
