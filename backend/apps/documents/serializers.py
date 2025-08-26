from rest_framework import serializers
from .models import Document
import os

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model"""
    file_size_mb = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'original_filename', 'file', 'file_size', 
            'file_size_mb', 'description', 'created_at', 'updated_at',
            'user_username'
        ]
        read_only_fields = ['id', 'file_size', 'created_at', 'updated_at', 'user_username']

class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading documents"""
    file = serializers.FileField()
    
    class Meta:
        model = Document
        fields = ['title', 'file', 'description']
    
    def validate_file(self, value):
        """Validate uploaded file"""
        # Check file extension
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are allowed.")
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB.")
        
        return value
    
    def create(self, validated_data):
        """Create document with user and file metadata"""
        file = validated_data['file']
        validated_data['original_filename'] = file.name
        validated_data['file_size'] = file.size
        validated_data['user'] = self.context['request'].user
        
        return super().create(validated_data)

class DocumentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing documents"""
    file_size_mb = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'original_filename', 'file_size_mb', 
            'description', 'created_at', 'file_url'
        ]
    
    def get_file_url(self, obj):
        """Get file URL"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
