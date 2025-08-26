from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    # Document CRUD operations
    path('', views.DocumentListCreateView.as_view(), name='document-list-create'),
    path('<uuid:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    
    # Document statistics
    path('stats/', views.document_stats, name='document-stats'),
]
