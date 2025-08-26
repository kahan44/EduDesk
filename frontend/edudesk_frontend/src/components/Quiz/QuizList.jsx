import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  Calendar, 
  Trophy, 
  Play, 
  Trash2, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { quizAPI } from '../../api';

const QuizList = ({ onStartQuiz, onViewResults }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeSessions, setActiveSessions] = useState({}); // Track active sessions for each quiz

  useEffect(() => {
    fetchQuizzesAndAttempts();
  }, []);

  // Check for active sessions for all quizzes
  const checkActiveSessionsForQuizzes = async (quizzesData) => {
    const sessionsMap = {};
    
    try {
      // Check active sessions for each quiz in parallel
      const sessionChecks = quizzesData.map(async (quiz) => {
        try {
          const response = await quizAPI.checkActiveSession(quiz.id);
          return { quizId: quiz.id, hasActiveSession: response.has_active_session, sessionData: response };
        } catch (error) {
          console.error(`Error checking session for quiz ${quiz.id}:`, error);
          return { quizId: quiz.id, hasActiveSession: false, sessionData: null };
        }
      });

      const results = await Promise.all(sessionChecks);
      
      // Build sessions map
      results.forEach(({ quizId, hasActiveSession, sessionData }) => {
        if (hasActiveSession) {
          sessionsMap[quizId] = sessionData;
        }
      });

      setActiveSessions(sessionsMap);
    } catch (error) {
      console.error('Error checking active sessions:', error);
    }
  };

  const fetchQuizzesAndAttempts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [quizzesResponse, attemptsResponse] = await Promise.all([
        quizAPI.getQuizzes(),
        quizAPI.getQuizAttempts()
      ]);
      
      if (quizzesResponse.success) {
        setQuizzes(quizzesResponse.data);
        // Check for active sessions after quizzes are loaded
        await checkActiveSessionsForQuizzes(quizzesResponse.data);
      }
      
      if (attemptsResponse.success) {
        setAttempts(attemptsResponse.data);
      }
    } catch (error) {
      setError('Failed to load quizzes');
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(quizId);
      const response = await quizAPI.deleteQuiz(quizId);
      
      if (response.success) {
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get best attempt for a quiz
  const getBestAttempt = (quizId) => {
    const quizAttempts = attempts.filter(attempt => attempt.quiz === quizId);
    if (quizAttempts.length === 0) return null;
    
    return quizAttempts.reduce((best, current) => 
      current.percentage_score > best.percentage_score ? current : best
    );
  };

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
          <span className="ml-4 text-xl text-gray-300">Loading quizzes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Error Loading Quizzes</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                  onClick={fetchQuizzesAndAttempts}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-32">
            <div className="bg-gray-700/50 p-8 rounded-2xl inline-block mb-8">
              <Brain className="h-20 w-20 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Quizzes Yet</h3>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
              You haven't generated any quizzes yet. Start by selecting a document and generating your first AI quiz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Quizzes</h2>
              <p className="text-blue-100 text-lg">
                {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} available • Track your progress and improve
              </p>
            </div>
            <button
              onClick={fetchQuizzesAndAttempts}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-white/25"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => {
            const bestAttempt = getBestAttempt(quiz.id);
            const hasAttempts = bestAttempt !== null;
            const hasActiveSession = activeSessions[quiz.id]?.has_active_session || false;

            return (
              <div
                key={quiz.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
              >
                {/* Quiz Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    disabled={deleteLoading === quiz.id}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-300 disabled:opacity-50 p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    {deleteLoading === quiz.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400/30 border-t-red-400"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Quiz Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300 bg-gray-700/30 rounded-lg p-3">
                    <Calendar className="h-5 w-5 mr-3 text-purple-400" />
                    <span className="font-medium">Created {new Date(quiz.created_at).toLocaleDateString()}</span>
                  </div>

                  {quiz.document && (
                    <div className="flex items-center text-gray-300 bg-gray-700/30 rounded-lg p-3">
                      <FileText className="h-5 w-5 mr-3 text-green-400" />
                      <span className="truncate font-medium">{quiz.document.title}</span>
                    </div>
                  )}
                </div>

                {/* Best Attempt */}
                {hasAttempts && (
                  <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-yellow-400 mr-3" />
                        <span className="font-bold text-yellow-400">Best Score</span>
                      </div>
                      <span className="text-2xl font-bold text-emerald-400">
                        {bestAttempt.percentage_score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-yellow-300">
                      <span>{bestAttempt.score}/{bestAttempt.total_questions} correct</span>
                      <span>{formatTime(bestAttempt.time_taken)}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => onStartQuiz(quiz)}
                    className={`w-full py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:scale-105 ${
                      hasActiveSession 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/25'
                    }`}
                  >
                    <Play className="h-5 w-5 mr-3" />
                    {hasActiveSession ? 'Resume Quiz' : hasAttempts ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                  
                  {hasAttempts && (
                    <button
                      onClick={() => onViewResults(bestAttempt)}
                      className="w-full border border-gray-600/50 bg-gray-700/30 text-gray-300 py-3 px-6 rounded-xl hover:bg-gray-600/50 hover:text-white transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-gray-500/25"
                    >
                      <CheckCircle className="h-5 w-5 mr-3" />
                      View Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
