import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  BarChart3,
  Target,
  Award,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { analyticsAPI } from '../../api';

const DetailedAnalytics = ({ quiz, onBack }) => {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [quiz.quiz.id]);

  // Reset question index when attempt changes
  useEffect(() => {
    setSelectedQuestionIndex(0);
  }, [selectedAttempt]);

  const fetchDetailedAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await analyticsAPI.getDetailedQuizAnalytics(quiz.quiz.id);
      
      if (response.success) {
        setDetailedData(response.data);
        // Select the latest attempt by default
        if (response.data.attempts.length > 0) {
          const latestAttempt = response.data.attempts[0];
          setSelectedAttempt({
            ...latestAttempt, 
            attemptNumber: response.data.attempts.length
          });
        }
      }
    } catch (error) {
      setError('Failed to load detailed analytics');
      console.error('Error fetching detailed analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
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

  const getAnswerStatus = (questionId, userAnswer, correctAnswer) => {
    if (!userAnswer) {
      return { status: 'unanswered', icon: AlertCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    }
    
    if (userAnswer === correctAnswer) {
      return { status: 'correct', icon: CheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
    }
    
    return { status: 'incorrect', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
            <span className="ml-4 text-xl text-gray-300">Loading detailed analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Analytics
          </button>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="bg-red-500/20 p-3 rounded-lg mr-4">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Error Loading Detailed Analytics</h3>
                <p className="text-red-300 mb-6">{error}</p>
                <button
                  onClick={fetchDetailedAnalytics}
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

  if (!detailedData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Analytics
          </button>
          
          <button
            onClick={fetchDetailedAnalytics}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-white/25 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{detailedData.quiz.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(detailedData.quiz.difficulty)}`}>
                  {detailedData.quiz.difficulty}
                </span>
                <span className="text-blue-200 bg-white/20 px-3 py-1 rounded-full text-sm">
                  {detailedData.quiz.total_questions} questions
                </span>
                <span className="text-blue-200 bg-white/20 px-3 py-1 rounded-full text-sm">
                  {Math.floor(detailedData.quiz.time_limit / 60)} minutes
                </span>
              </div>
              <p className="text-blue-100">
                Created {new Date(detailedData.quiz.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
            <div className="bg-blue-500/20 p-3 rounded-lg w-fit mx-auto mb-4">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{detailedData.stats.total_attempts}</div>
            <div className="text-sm text-gray-400">Total Attempts</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
            <div className="bg-emerald-500/20 p-3 rounded-lg w-fit mx-auto mb-4">
              <Award className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mb-1">{detailedData.stats.best_score}%</div>
            <div className="text-sm text-gray-400">Best Score</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
            <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{detailedData.stats.average_score}%</div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
        </div>

        {/* Attempts History */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Attempt History</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detailedData.attempts.map((attempt, index) => {
              const attemptNumber = detailedData.attempts.length - index;
              return (
                <div
                  key={attempt.id}
                  onClick={() => setSelectedAttempt({...attempt, attemptNumber})}
                  className={`cursor-pointer rounded-xl border p-6 transition-all duration-300 hover:scale-105 ${
                    selectedAttempt?.id === attempt.id
                      ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-2xl shadow-blue-500/25'
                      : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">Attempt #{attemptNumber}</span>
                  <span className={`text-2xl font-bold ${
                    attempt.percentage_score >= 80 ? 'text-emerald-400' :
                    attempt.percentage_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {attempt.percentage_score}%
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                    <span>{attempt.score}/{attempt.total_questions} correct</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-blue-400" />
                    <span>{attempt.attempted_questions} attempted</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-400" />
                    <span>{formatTime(attempt.time_taken)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Question-by-Question Analysis */}
        {selectedAttempt && detailedData.questions.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Question Analysis - Attempt #{selectedAttempt.attemptNumber}
              </h2>
              <div className="text-sm text-gray-400">
                {selectedQuestionIndex + 1} of {detailedData.questions.length} questions
              </div>
            </div>

            {/* Question Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Navigate Questions</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                    disabled={selectedQuestionIndex === 0}
                    className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setSelectedQuestionIndex(Math.min(detailedData.questions.length - 1, selectedQuestionIndex + 1))}
                    disabled={selectedQuestionIndex === detailedData.questions.length - 1}
                    className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
              
              {/* Question Numbers Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                {detailedData.questions.map((question, index) => {
                  const userAnswer = selectedAttempt.answers[question.id];
                  const answerStatus = getAnswerStatus(question.id, userAnswer, question.correct_answer);
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-110 ${
                        selectedQuestionIndex === index
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : answerStatus.status === 'correct'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : answerStatus.status === 'incorrect'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                      }`}
                    >
                      {question.question_number}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Question Display */}
            {(() => {
              const currentQuestion = detailedData.questions[selectedQuestionIndex];
              if (!currentQuestion) return null;
              
              const userAnswer = selectedAttempt.answers[currentQuestion.id];
              const answerStatus = getAnswerStatus(currentQuestion.id, userAnswer, currentQuestion.correct_answer);
              const StatusIcon = answerStatus.icon;
              
              return (
                <div 
                  className={`rounded-xl border p-8 ${answerStatus.bgColor} ${
                    answerStatus.status === 'correct' ? 'border-emerald-500/30' :
                    answerStatus.status === 'incorrect' ? 'border-red-500/30' : 'border-gray-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <span className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-full text-lg font-bold mr-4">
                          Question {currentQuestion.question_number}
                        </span>
                        <div className="flex items-center">
                          <StatusIcon className={`h-6 w-6 ${answerStatus.color} mr-2`} />
                          <span className={`font-bold text-lg ${answerStatus.color} capitalize`}>
                            {answerStatus.status}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
                        {currentQuestion.question_text}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.letter}
                        className={`p-6 rounded-xl border transition-all duration-300 ${
                          option.is_correct 
                            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' 
                            : userAnswer === option.letter && !option.is_correct
                              ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20'
                              : 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/30'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${
                            option.is_correct 
                              ? 'bg-emerald-500 text-white shadow-lg' 
                              : userAnswer === option.letter && !option.is_correct
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-600 text-gray-300'
                          }`}>
                            {option.letter}
                          </span>
                          <span className={`flex-1 text-lg ${
                            option.is_correct ? 'text-emerald-300 font-medium' :
                            userAnswer === option.letter && !option.is_correct ? 'text-red-300 font-medium' : 'text-gray-300'
                          }`}>
                            {option.text}
                          </span>
                          {option.is_correct && (
                            <CheckCircle className="h-6 w-6 text-emerald-400 ml-4" />
                          )}
                          {userAnswer === option.letter && !option.is_correct && (
                            <XCircle className="h-6 w-6 text-red-400 ml-4" />
                          )}
                          {userAnswer === option.letter && (
                            <div className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                              Your Answer
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Answer Summary */}
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600/50 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                        <div className={`text-lg font-bold ${
                          userAnswer ? (userAnswer === currentQuestion.correct_answer ? 'text-emerald-400' : 'text-red-400') : 'text-gray-400'
                        }`}>
                          {userAnswer || 'Not Answered'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                        <div className="text-lg font-bold text-emerald-400">
                          {currentQuestion.correct_answer}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Result</div>
                        <div className={`text-lg font-bold ${answerStatus.color}`}>
                          {answerStatus.status === 'correct' ? '+1 Point' : 
                           answerStatus.status === 'incorrect' ? '0 Points' : 'Skipped'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {currentQuestion.explanation && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/30">
                      <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Explanation
                      </h4>
                      <p className="text-gray-200 text-lg leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Question Navigation Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                disabled={selectedQuestionIndex === 0}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Previous Question
              </button>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Progress</div>
                <div className="text-lg font-bold text-white">
                  {selectedQuestionIndex + 1} / {detailedData.questions.length}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedQuestionIndex(Math.min(detailedData.questions.length - 1, selectedQuestionIndex + 1))}
                disabled={selectedQuestionIndex === detailedData.questions.length - 1}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                Next Question
                <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedAnalytics;
