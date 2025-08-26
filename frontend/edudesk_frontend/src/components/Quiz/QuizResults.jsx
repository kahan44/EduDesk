import React from 'react';
import { Trophy, Clock, CheckCircle, Target, BarChart3, Home, RotateCcw } from 'lucide-react';

const QuizResults = ({ results, quiz, onRetakeQuiz, onBackToDashboard }) => {
  const { score, total_questions, attempted_questions, percentage, time_taken } = results;
  
  // Format time taken
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get performance level and styling
  const getPerformanceStyle = (percentage) => {
    if (percentage >= 90) return { 
      level: 'Excellent', 
      color: 'text-emerald-400', 
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20', 
      borderColor: 'border-emerald-500/30',
      icon: '🏆'
    };
    if (percentage >= 80) return { 
      level: 'Very Good', 
      color: 'text-blue-400', 
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20', 
      borderColor: 'border-blue-500/30',
      icon: '🎯'
    };
    if (percentage >= 70) return { 
      level: 'Good', 
      color: 'text-yellow-400', 
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20', 
      borderColor: 'border-yellow-500/30',
      icon: '👍'
    };
    if (percentage >= 60) return { 
      level: 'Fair', 
      color: 'text-orange-400', 
      bgColor: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20', 
      borderColor: 'border-orange-500/30',
      icon: '📈'
    };
    return { 
      level: 'Needs Improvement', 
      color: 'text-red-400', 
      bgColor: 'bg-gradient-to-r from-red-500/20 to-red-600/20', 
      borderColor: 'border-red-500/30',
      icon: '📚'
    };
  };

  const performance = getPerformanceStyle(percentage || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Quiz Completed!</h1>
          <p className="text-xl text-blue-200">{quiz?.title || 'Quiz'}</p>
        </div>

        {/* Main Results Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Performance Banner */}
          <div className={`${performance.bgColor} ${performance.borderColor} border-b border-gray-700/50 px-8 py-8`}>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-4xl">{performance.icon}</span>
              <div className="text-center">
                <div className={`text-3xl font-bold ${performance.color} mb-2`}>
                  {performance.level}
                </div>
                <div className="text-sm text-gray-300 font-medium">Performance Level</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              
              {/* Correct Answers */}
              <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-full mb-4 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-emerald-400 mb-2">{score || 0}</div>
                <div className="text-sm font-medium text-emerald-300">Correct Answers</div>
              </div>

              {/* Attempted Questions */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-4 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-2">{attempted_questions || total_questions || 0}</div>
                <div className="text-sm font-medium text-purple-300">Questions Attempted</div>
              </div>

              {/* Total Questions */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{total_questions || 0}</div>
                <div className="text-sm font-medium text-blue-300">Total Questions</div>
              </div>

              {/* Score Percentage */}
              <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full mb-4 shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">{Math.round(percentage || 0)}%</div>
                <div className="text-sm font-medium text-yellow-300">Score Percentage</div>
              </div>

              {/* Time Taken */}
              <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30 backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full mb-4 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-2">{formatTime(time_taken || 0)}</div>
                <div className="text-sm font-medium text-orange-300">Time Spent</div>
              </div>

            </div>

            {/* Score Summary */}
            <div className="mt-8 p-8 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xl text-gray-200 mb-3 leading-relaxed">
                  You answered <span className="font-bold text-emerald-400">{score || 0}</span> questions correctly 
                  out of <span className="font-bold text-purple-400">{attempted_questions || total_questions || 0}</span> attempted
                  from <span className="font-bold text-blue-400">{total_questions || 0}</span> total questions
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  Completed in {formatTime(time_taken || 0)}
                </div>
              </div>
            </div>

            {/* Analytics Notice */}
            <div className="mt-8 p-8 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-xl text-indigo-300 mb-2">
                    Detailed Analytics Available
                  </div>
                  <div className="text-sm text-indigo-400 leading-relaxed">
                    View comprehensive performance insights and progress tracking on the Analytics page
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
          <button
            onClick={onBackToDashboard}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg"
          >
            <Home className="h-6 w-6 mr-3" />
            Back to Dashboard
          </button>
          <button
            onClick={onRetakeQuiz}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg"
          >
            <RotateCcw className="h-6 w-6 mr-3" />
            Retake Quiz
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuizResults;
