from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer, 
    ChatSessionListSerializer, 
    ChatMessageSerializer,
    SendMessageSerializer
)
from .services import GeminiChatbot


class ChatSessionListView(generics.ListCreateAPIView):
    """List all chat sessions for the authenticated user"""
    serializer_class = ChatSessionListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user, is_active=True)
    
    def create(self, request, *args, **kwargs):
        """Create a new chat session"""
        session = ChatSession.objects.create(
            user=request.user,
            title="New Chat"
        )
        
        serializer = ChatSessionListSerializer(session)
        return Response({
            'success': True,
            'message': 'Chat session created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific chat session"""
    serializer_class = ChatSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        session = self.get_object()
        serializer = self.get_serializer(session)
        
        return Response({
            'success': True,
            'message': 'Chat session retrieved successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        session = self.get_object()
        serializer = self.get_serializer(session, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Chat session updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        session = self.get_object()
        
        # Actually delete the session from database (hard delete)
        session.delete()
        
        return Response({
            'success': True,
            'message': 'Chat session deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a message and get AI response"""
    serializer = SendMessageSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Invalid message data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user_message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    
    try:
        # Get or create chat session
        if session_id:
            session = get_object_or_404(ChatSession, id=session_id, user=request.user, is_active=True)
        else:
            # Create new session
            chatbot = GeminiChatbot()
            title = chatbot.generate_conversation_title(user_message)
            session = ChatSession.objects.create(
                user=request.user,
                title=title
            )
        
        # Save user message
        user_msg = ChatMessage.objects.create(
            session=session,
            message_type='user',
            content=user_message
        )
        
        # Get chat history for context
        chat_history = list(session.messages.values('message_type', 'content').order_by('timestamp'))
        
        # Generate AI response
        chatbot = GeminiChatbot()
        ai_response = chatbot.generate_response(user_message, chat_history[:-1])  # Exclude the current message
        
        # Save AI response
        ai_msg = ChatMessage.objects.create(
            session=session,
            message_type='ai',
            content=ai_response
        )
        
        # Update session timestamp
        session.save()
        
        return Response({
            'success': True,
            'message': 'Message sent successfully',
            'data': {
                'session_id': session.id,
                'user_message': ChatMessageSerializer(user_msg).data,
                'ai_response': ChatMessageSerializer(ai_msg).data,
                'session_title': session.title
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error processing message: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_stats(request):
    """Get chat statistics for the user"""
    user_sessions = ChatSession.objects.filter(user=request.user, is_active=True)
    total_sessions = user_sessions.count()
    total_messages = ChatMessage.objects.filter(session__in=user_sessions).count()
    
    return Response({
        'success': True,
        'data': {
            'total_sessions': total_sessions,
            'total_messages': total_messages,
            'recent_sessions': total_sessions  # Could be refined to last 7 days
        }
    }, status=status.HTTP_200_OK)
