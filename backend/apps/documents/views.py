from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer, DocumentListSerializer

class DocumentListCreateView(generics.ListCreateAPIView):
    """View for listing and creating documents"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return documents for the current user only"""
        return Document.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.request.method == 'POST':
            return DocumentUploadSerializer
        return DocumentListSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle document upload"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            document = serializer.save()
            response_serializer = DocumentSerializer(document, context={'request': request})
            return Response({
                'success': True,
                'message': 'Document uploaded successfully',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Document upload failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        """List user's documents"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'message': 'Documents retrieved successfully',
            'data': serializer.data,
            'count': queryset.count()
        })

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting specific documents"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        """Return documents for the current user only"""
        return Document.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Get document details"""
        try:
            document = self.get_object()
            serializer = self.get_serializer(document)
            return Response({
                'success': True,
                'message': 'Document retrieved successfully',
                'data': serializer.data
            })
        except Http404:
            return Response({
                'success': False,
                'message': 'Document not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def update(self, request, *args, **kwargs):
        """Update document metadata"""
        try:
            document = self.get_object()
            serializer = self.get_serializer(document, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Document updated successfully',
                    'data': serializer.data
                })
            return Response({
                'success': False,
                'message': 'Document update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Http404:
            return Response({
                'success': False,
                'message': 'Document not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def destroy(self, request, *args, **kwargs):
        """Delete document"""
        try:
            document = self.get_object()
            document.delete()
            return Response({
                'success': True,
                'message': 'Document deleted successfully'
            }, status=status.HTTP_200_OK)
        except Http404:
            return Response({
                'success': False,
                'message': 'Document not found'
            }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def document_stats(request):
    """Get document statistics for the user"""
    user_documents = Document.objects.filter(user=request.user)
    
    stats = {
        'total_documents': user_documents.count(),
        'total_size_mb': round(sum(doc.file_size for doc in user_documents) / (1024 * 1024), 2),
        'recent_uploads': user_documents[:5].count()
    }
    
    return Response({
        'success': True,
        'message': 'Document statistics retrieved successfully',
        'data': stats
    })
