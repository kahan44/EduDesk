from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # Chat session endpoints
    path('sessions/', views.ChatSessionListView.as_view(), name='session-list'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='session-detail'),
    
    # Message endpoints
    path('send-message/', views.send_message, name='send-message'),
    
    # Stats endpoint
    path('stats/', views.get_chat_stats, name='chat-stats'),
]
