import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Users,
  MessageSquare,
  ChevronDown,
  Menu,
  X,
  Upload,
  Brain,
  BarChart3,
  MessageCircle,
  Plus,
  FileText,
  RefreshCw,
  Target,
  CheckCircle,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documentAPI, quizAPI, analyticsAPI } from '../../api';
import { DocumentUpload, DocumentList } from '../../components/Documents';
import { QuizGenerator, QuizList, QuizTaker, QuizResults } from '../../components/Quiz';
import { Analytics } from '../../components/Analytics';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quiz-related states
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizMode, setQuizMode] = useState('list'); // 'list', 'generator', 'taking', 'results'
  const [quizResults, setQuizResults] = useState(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch documents data
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle successful document upload
  const handleDocumentUpload = (newDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
    setShowUploadModal(false);
  };

  // Handle document update
  const handleDocumentUpdate = (updatedDocument) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
    );
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId) => {
    // Remove from local state immediately for instant UI feedback
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    // Refresh the document list from server to ensure accuracy
    await fetchDocuments();
    
  };

  // Quiz handler functions
  const handleStartQuiz = async (quiz) => {
    try {
      // Fetch full quiz details with questions
      const response = await quizAPI.getQuizDetails(quiz.id);
      if (response.success) {
        setCurrentQuiz(response.data);
        setQuizMode('taking');
        setActiveTab('quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz. Please try again.');
    }
  };

  const handleQuizSubmit = (results) => {
    setQuizResults(results);
    setQuizMode('results');
  };

  const handleRetakeQuiz = () => {
    setQuizMode('taking');
    setQuizResults(null);
  };

  const handleBackToDashboard = () => {
    setActiveTab('overview');
    setQuizMode('list');
    setCurrentQuiz(null);
    setQuizResults(null);
  };

  const handleViewResults = (attempt) => {
    // In a real implementation, you'd fetch the detailed results
    setQuizResults(attempt);
    setQuizMode('results');
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`w-64 bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 lg:z-auto flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">EduDesk</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 flex-1 overflow-y-auto">
          <div className="px-6 mb-8">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-white font-medium">
                  {user?.username}
                </p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 px-4">
            <button 
              onClick={() => setActiveTab('documents')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'documents' 
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FileText className="h-5 w-5 mr-3" />
              My Documents
            </button>
            <button 
              onClick={() => {
                setActiveTab('quiz');
                setQuizMode('generator');
              }}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'quiz' && quizMode === 'generator'
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Brain className="h-5 w-5 mr-3" />
              AI Quiz Generator
            </button>
            <button 
              onClick={() => {
                setActiveTab('quiz');
                setQuizMode('list');
              }}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'quiz' && quizMode === 'list'
                  ? 'text-white bg-blue-600' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Award className="h-5 w-5 mr-3" />
              My Quizzes
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center w-full px-4 py-2 rounded-lg ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Analytics
            </button>
            <button 
              onClick={() => navigate('/chatbot')}
              className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Edu AI
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white font-medium">
                        {user?.username}
                      </p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {activeTab === 'documents' && (
            <div className="space-y-8 min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6 -m-6">
              <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Section - Matching QuizGenerator Style */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="bg-white/20 p-3 rounded-xl mr-4">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">My Documents</h2>
                      <p className="text-blue-100 text-lg">
                        Manage your uploaded PDF documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-200 bg-white/10 rounded-xl p-4">
                      <FileText className="h-5 w-5 mr-3" />
                      <span className="font-medium">PDF Support • AI Analysis • Quiz Generation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={fetchDocuments}
                        className="flex items-center px-4 py-2 bg-white/20 text-white hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm"
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center px-6 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-medium shadow-lg"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </button>
                    </div>
                  </div>
                </div>
                

                {/* Documents List */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mr-4 shadow-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Document Library</h3>
                  </div>
                  <DocumentList
                    documents={documents}
                    loading={loading}
                    onDocumentUpdated={handleDocumentUpdate}
                    onDocumentDeleted={handleDocumentDelete}
                    onRefresh={fetchDocuments}
                  />
                </div>

              </div>
            </div>
          )}

          {/* Quiz Sections */}
          {activeTab === 'quiz' && (
            <>
              {quizMode === 'generator' && (
                <div className="space-y-8">
                  <QuizGenerator />
                </div>
              )}

              {quizMode === 'list' && (
                <div className="space-y-8">
                  <QuizList 
                    onStartQuiz={handleStartQuiz}
                    onViewResults={handleViewResults}
                  />
                </div>
              )}

              {quizMode === 'taking' && currentQuiz && (
                <div className="space-y-8">
                  <QuizTaker
                    quiz={currentQuiz}
                    onQuizSubmit={handleQuizSubmit}
                    onBack={() => {
                      setQuizMode('list');
                      setCurrentQuiz(null);
                    }}
                  />
                </div>
              )}

              {quizMode === 'results' && quizResults && (
                <div className="space-y-8">
                  <QuizResults
                    results={quizResults}
                    quiz={currentQuiz}
                    onRetakeQuiz={handleRetakeQuiz}
                    onBackToDashboard={handleBackToDashboard}
                  />
                </div>
              )}
            </>
          )}

          {/* Analytics Section */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <Analytics />
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUpload
          onUploadSuccess={handleDocumentUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
