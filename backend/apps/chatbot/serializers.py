from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'is_active', 'messages', 'message_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing chat sessions"""
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'is_active', 'message_count', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content[:100] + '...' if len(last_message.content) > 100 else last_message.content,
                'message_type': last_message.message_type,
                'timestamp': last_message.timestamp
            }
        return None


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending messages"""
    message = serializers.CharField(max_length=2000)
    session_id = serializers.IntegerField(required=False)
    
    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()
