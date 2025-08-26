from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'original_filename', 'file_size_mb', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'original_filename', 'user__username', 'user__email']
    readonly_fields = ['id', 'file_size', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'user', 'original_filename', 'file', 'description')
        }),
        ('Metadata', {
            'fields': ('file_size',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related('user')
