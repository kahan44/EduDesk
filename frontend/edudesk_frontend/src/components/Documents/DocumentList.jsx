import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Trash2, 
  Edit, 
  Calendar, 
  Loader
} from 'lucide-react';
import { documentAPI } from '../../api';

const DocumentList = ({ documents, onDocumentUpdated, onDocumentDeleted, loading, onRefresh }) => {
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [refreshing, setRefreshing] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleEdit = (document) => {
    setEditingDocument(document.id);
    setEditForm({
      title: document.title,
      description: document.description || ''
    });
  };

  const handleEditSubmit = async (documentId) => {
    try {
      const response = await documentAPI.updateDocument(documentId, editForm);
      if (response.success) {
        onDocumentUpdated && onDocumentUpdated(response.data);
        setEditingDocument(null);
        setEditForm({ title: '', description: '' });
      }
    } catch (error) {
      console.error('Error updating document:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleEditCancel = () => {
    setEditingDocument(null);
    setEditForm({ title: '', description: '' });
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingDocument(documentId);
    
    try {
      const response = await documentAPI.deleteDocument(documentId);
      if (response.success) {
        // Trigger the same refresh that the refresh button uses
        if (onRefresh) {
          setRefreshing(true);
          await onRefresh();
          setRefreshing(false);
        }
        
        // Also call the deletion callback if provided
        if (onDocumentDeleted) {
          await onDocumentDeleted(documentId);
        }
        
      } else {
        console.error('Delete failed:', response.message);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeletingDocument(null);
    }
  };

  // Auto-refresh effect - removed as onRefresh should handle everything

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <span className="mt-4 text-gray-300 text-lg font-medium">Loading your documents...</span>
        <span className="text-gray-500 text-sm">Please wait a moment</span>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-700/30 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <FileText className="h-12 w-12 text-gray-500" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-300 mb-3">No documents yet</h3>
        <p className="text-gray-500 text-lg mb-6">Upload your first PDF document to get started with AI-powered learning</p>
        <div className="bg-gray-700/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-gray-400 text-sm">💡 Tip: Upload lecture notes, textbooks, or study materials to generate custom quizzes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refreshing Indicator */}
      {refreshing && (
        <div className="flex items-center justify-center py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
          <Loader className="h-4 w-4 animate-spin text-blue-400 mr-2" />
          <span className="text-sm text-blue-400 font-medium">Refreshing document library...</span>
        </div>
      )}
      
      {documents.map((document) => {
        return (
          <div key={document.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl border border-gray-600/30 p-6 hover:border-gray-500/50 transition-all duration-300 hover:shadow-xl group hover:bg-gray-700/40">
            {editingDocument === document.id ? (
              /* Edit Mode */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Document Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter document title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-300 backdrop-blur-sm"
                    placeholder="Add a description for this document..."
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEditSubmit(document.id)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex-1 px-6 py-3 bg-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-300 font-medium border border-gray-500/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-6 flex-1">
                  <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:from-red-500/30 group-hover:to-red-600/30 transition-all duration-300 shadow-lg">
                    <FileText className="h-8 w-8 text-red-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-300 transition-colors duration-300">
                        {document.title}
                      </h3>
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                        PDF
                      </span>
                    </div>
                    
                    <div className="bg-gray-600/30 rounded-lg p-3 mb-4 w-200 border border-gray-500/30">
                      <p className="text-gray-300 text-sm flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        {document.original_filename}
                      </p>
                    </div>
                    
                    {document.description && (
                      <div className="bg-gray-600/20 rounded-lg p-4 mb-4 border border-gray-600/30">
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {document.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400 bg-gray-600/20 px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        <span>Uploaded {formatDate(document.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleEdit(document)}
                    className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-500/30 group/edit shadow-lg"
                    title="Edit document details"
                  >
                    <Edit className="h-5 w-5 group-hover/edit:scale-110 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    disabled={deletingDocument === document.id}
                    className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-500/30 group/delete shadow-lg"
                    title="Delete document"
                  >
                    {deletingDocument === document.id ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5 group-hover/delete:scale-110 transition-transform duration-300" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentList;