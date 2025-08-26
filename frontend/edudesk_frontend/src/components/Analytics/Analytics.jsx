import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Eye, 
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { analyticsAPI } from '../../api';
import DetailedAnalytics from './DetailedAnalytics';

const Analytics = () => {
  const [quizAnalytics, setQuizAnalytics] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [quizResponse, overallResponse] = await Promise.all([
        analyticsAPI.getQuizAttemptsAnalytics(),
        analyticsAPI.getOverallAnalytics()
      ]);
      
      if (quizResponse.success) {
        setQuizAnalytics(quizResponse.data);
      }
      
      if (overallResponse.success) {
        setOverallStats(overallResponse.data);
      }
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetailed = async (quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailed(true);
  };

  const handleBackToOverview = () => {
    setShowDetailed(false);
    setSelectedQuiz(null);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (showDetailed && selectedQuiz) {
    return (
      <DetailedAnalytics 
        quiz={selectedQuiz} 
        onBack={handleBackToOverview}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
            <span className="ml-4 text-xl text-gray-300">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Error Loading Analytics</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                  onClick={fetchAnalyticsData}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
              <p className="text-blue-100 text-lg">
                Track your progress and improve your performance
              </p>
            </div>
            <button
              onClick={fetchAnalyticsData}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-white/25 flex items-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-blue-400">{overallStats.total_quizzes_taken}</span>
              </div>
              <h3 className="text-white font-semibold">Quizzes Taken</h3>
              <p className="text-gray-400 text-sm">Unique quizzes attempted</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <span className="text-2xl font-bold text-emerald-400">{overallStats.average_score}%</span>
              </div>
              <h3 className="text-white font-semibold">Average Score</h3>
              <p className="text-gray-400 text-sm">Across all attempts</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-yellow-400">{overallStats.best_score}%</span>
                  {overallStats.improvement_trend > 0 && (
                    <ArrowUp className="h-4 w-4 text-emerald-400 ml-1" />
                  )}
                  {overallStats.improvement_trend < 0 && (
                    <ArrowDown className="h-4 w-4 text-red-400 ml-1" />
                  )}
                </div>
              </div>
              <h3 className="text-white font-semibold">Best Score</h3>
              <p className="text-gray-400 text-sm">Personal record</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-purple-400">{formatTime(overallStats.total_time_spent)}</span>
              </div>
              <h3 className="text-white font-semibold">Time Spent</h3>
              <p className="text-gray-400 text-sm">Total study time</p>
            </div>
          </div>
        )}

        {/* Quiz Analytics Cards */}
        {quizAnalytics.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-16 text-center">
            <div className="bg-gray-700/50 p-8 rounded-2xl inline-block mb-8">
              <BarChart3 className="h-20 w-20 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Analytics Data Yet</h3>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
              Complete some quizzes to see your performance analytics and track your progress.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Quiz Performance</h2>
              <p className="text-gray-400">{quizAnalytics.length} quiz{quizAnalytics.length !== 1 ? 'es' : ''} analyzed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizAnalytics.map((quizData) => (
                <div
                  key={quizData.quiz.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105"
                >
                  {/* Quiz Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                      {quizData.quiz.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(quizData.quiz.difficulty)}`}>
                        {quizData.quiz.difficulty}
                      </span>
                      <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                        {quizData.quiz.total_questions} questions
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-400 mb-1">
                        {quizData.stats.best_score}%
                      </div>
                      <div className="text-xs text-gray-400">Best Score</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {quizData.stats.average_score}%
                      </div>
                      <div className="text-xs text-gray-400">Average</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {quizData.stats.total_attempts}
                      </div>
                      <div className="text-xs text-gray-400">Attempts</div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {formatTime(quizData.stats.latest_attempt?.time_taken || 0)}
                      </div>
                      <div className="text-xs text-gray-400">Last Time</div>
                    </div>
                  </div>

                  {/* Latest Attempt */}
                  {quizData.stats.latest_attempt && (
                    <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Latest Attempt</span>
                        <span className="text-sm text-gray-400">
                          {new Date(quizData.stats.latest_attempt.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-white">
                          {quizData.stats.latest_attempt.percentage_score}%
                        </span>
                        <span className="text-sm text-gray-400">
                          {quizData.stats.latest_attempt.score}/{quizData.stats.latest_attempt.total_questions} correct
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewDetailed(quizData)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    <Eye className="h-5 w-5 mr-3" />
                    View Analytics
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
