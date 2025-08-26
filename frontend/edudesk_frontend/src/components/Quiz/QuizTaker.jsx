import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { quizAPI } from '../../api';

const QuizTaker = ({ quiz, onQuizSubmit, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.time_limit); // Fixed: time_limit is already in seconds
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  
  const timerRef = useRef(null);
  const saveIntervalRef = useRef(null);

  // Initialize quiz session on component mount
  useEffect(() => {
    if (!sessionInitialized) {
      initializeQuizSession();
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [sessionInitialized]);

  // Initialize or resume quiz session
  const initializeQuizSession = async () => {
    if (sessionInitialized) return; // Prevent multiple calls
    
    try {
      setSessionInitialized(true);
      const response = await quizAPI.startQuizSession(quiz.id);
      if (response.success) {
        setSessionId(response.session_id);
        setTimeElapsed(response.time_elapsed || 0);
        setTimeRemaining(response.time_remaining);
        setAnswers(response.current_answers || {});
        setIsLoading(false);
        
        // Start timer and auto-save
        startTimer();
        startAutoSave();
      }
    } catch (error) {
      console.error('Error initializing quiz session:', error);
      setSessionInitialized(false); // Reset on error to allow retry
      setIsLoading(false);
    }
  };

  // Start the timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newElapsed = prev + 1;
        const newRemaining = Math.max(0, quiz.time_limit - newElapsed); // Fixed: time_limit is already in seconds
        setTimeRemaining(newRemaining);
        
        // Auto-submit if time is up
        if (newRemaining <= 0) {
          handleTimeUp();
        }
        
        return newElapsed;
      });
    }, 1000);
  };

  // Auto-save progress every 10 seconds
  const startAutoSave = () => {
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    
    saveIntervalRef.current = setInterval(() => {
      saveQuizProgress();
    }, 10000); // Save every 10 seconds
  };

  // Save current progress to backend
  const saveQuizProgress = async () => {
    if (!sessionId) return;
    
    try {
      await quizAPI.updateQuizSession(sessionId, {
        time_elapsed: timeElapsed,
        current_answers: answers
      });
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  // Handle time up scenario
  const handleTimeUp = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    
    // Auto-submit the quiz
    await handleSubmitQuiz(true);
  };

  // Handle browser tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - save progress immediately
        saveQuizProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, timeElapsed, answers]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      saveQuizProgress();
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be saved.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, timeElapsed, answers]);

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = async (questionId, answer) => {
    // Update local state immediately
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: answer
      };
      return newAnswers;
    });

    // Save answer immediately to database
    if (sessionId) {
      try {
        await quizAPI.saveAnswerImmediately(sessionId, questionId, answer);
      } catch (error) {
        console.error('Error saving answer immediately:', error);
        // Still update local state even if save fails
        // The periodic auto-save will pick it up later
      }
    }
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Jump to specific question
  const jumpToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  // Submit quiz
  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      console.log('=== FRONTEND QUIZ SUBMISSION DEBUG ===');
      console.log('SessionId:', sessionId);
      console.log('Answers:', answers);
      console.log('isAutoSubmit:', isAutoSubmit);
      
      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      
      if (!sessionId) {
        throw new Error('No active quiz session');
      }

      // Complete the quiz session
      console.log('Calling completeQuizSession API...');
      const response = await quizAPI.completeQuizSession(sessionId, {
        answers: answers
      });
      
      console.log('API response received:', response);
      
      if (response && response.success) {
        console.log('Quiz submitted successfully! Calling onQuizSubmit callback...');
        const resultData = {
          ...response,
          isAutoSubmit,
          // Ensure we have the required fields for QuizResults component
          score: response.score || 0,
          total_questions: response.total_questions || quiz.questions.length,
          attempted_questions: response.attempted_questions || Object.keys(answers).filter(key => answers[key]).length,
          percentage: response.percentage || 0, // Fixed: backend returns 'percentage' not 'percentage_score'
          time_taken: response.time_taken || timeElapsed
        };
        console.log('Calling onQuizSubmit with data:', resultData);
        onQuizSubmit(resultData);
      } else {
        throw new Error(response?.message || 'Quiz submission failed - no success response');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      if (!isAutoSubmit) {
        const errorMessage = error.message || error.toString();
        alert(`Failed to submit quiz: ${errorMessage}. Please try again.`);
      }
    } finally {
      setSubmitting(false);
      setShowSubmitConfirmation(false);
    }
  };

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  // Warning color for low time
  const timeWarning = timeRemaining <= 300; // 5 minutes
  const timeCritical = timeRemaining <= 60; // 1 minute

  // Show loading state while initializing session
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Initializing Quiz Session</h3>
          <p className="text-gray-400">Please wait while we prepare your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
            <div className="flex items-center text-sm text-gray-300 space-x-4">
              <span>Difficulty: <span className="capitalize font-medium text-blue-400">{quiz.difficulty}</span></span>
              <span>Questions: {quiz.questions.length}</span>
              <span>Answered: <span className="text-green-400">{answeredQuestions}</span>/{quiz.questions.length}</span>
            </div>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center px-4 py-2 rounded-lg ${
            timeCritical ? 'bg-red-900 text-red-200 border border-red-700' : 
            timeWarning ? 'bg-yellow-900 text-yellow-200 border border-yellow-700' : 
            'bg-blue-900 text-blue-200 border border-blue-700'
          }`}>
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-mono text-lg font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Question Navigation Sidebar */}
        <div className="col-span-3">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-white mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => jumpToQuestion(index)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-all duration-200 ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white shadow-lg'
                      : answers[quiz.questions[index].id]
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2 text-xs text-gray-300">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-600 rounded mr-2"></div>
                <span>Not answered</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitConfirmation(true)}
              className="w-full mt-6 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors duration-200 flex items-center justify-center shadow-lg border border-green-500"
              disabled={submitting}
            >
              <Flag className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="col-span-9">
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === quiz.questions.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <p className="text-lg text-white leading-relaxed">
                {currentQuestionData.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option) => (
                <label
                  key={option.option_letter}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    answers[currentQuestionData.id] === option.option_letter
                      ? 'border-blue-500 bg-blue-900/20 shadow-lg'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name={`question-${currentQuestionData.id}`}
                      value={option.option_letter}
                      checked={answers[currentQuestionData.id] === option.option_letter}
                      onChange={() => handleAnswerSelect(currentQuestionData.id, option.option_letter)}
                      className="mt-1 mr-3 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-blue-400 mr-2">
                        {option.option_letter}.
                      </span>
                      <span className="text-gray-200">
                        {option.option_text}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitConfirmation(true)}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-200 shadow-lg border border-green-500"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                  <Flag className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 shadow-lg border border-blue-500"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-white">Submit Quiz?</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              </p>
              
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Answered:</span>
                    <span className="font-medium ml-2 text-white">{answeredQuestions}/{quiz.questions.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Time remaining:</span>
                    <span className="font-medium ml-2 text-white">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
              </div>
              
              {answeredQuestions < quiz.questions.length && (
                <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    You have {quiz.questions.length - answeredQuestions} unanswered questions.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 border border-green-500 shadow-lg"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
