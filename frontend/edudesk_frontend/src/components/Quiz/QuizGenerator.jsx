import React, { useState, useEffect } from 'react';
import { Brain, FileText, Clock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { documentAPI, quizAPI } from '../../api';

const QuizGenerator = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);
  const [error, setError] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      setError('Failed to load documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setShowDifficultySelector(true);
    setError('');
  };

  const generateQuiz = async () => {
    if (!selectedDocument) return;

    try {
      setGenerating(true);
      setError('');

      const requestData = {
        document_id: selectedDocument.id,
        difficulty: difficulty,
        title: `Quiz - ${selectedDocument.title}`
      };

      const response = await quizAPI.generateQuiz(requestData);
      
      if (response.success) {
        // Quiz generated successfully - you can navigate to the quiz or show success
        console.log('Quiz generated:', response.data);
        
        // Reset form
        setSelectedDocument(null);
        setShowDifficultySelector(false);
        setDifficulty('medium');
        
        // Show success message or navigate to quiz
        alert('Quiz generated successfully! You can find it in your quiz list.');
      }
    } catch (error) {
      setError(error.message || 'Failed to generate quiz');
      console.error('Error generating quiz:', error);
    } finally {
      setGenerating(false);
    }
  };

  const difficultyOptions = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Basic understanding and recall questions',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgLight: 'bg-green-50'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Analysis and application questions',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50'
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Critical thinking and synthesis questions',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgLight: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">AI Quiz Generator</h2>
              <p className="text-blue-100 text-lg">
                Generate intelligent quizzes from your uploaded documents using AI
              </p>
            </div>
          </div>
          <div className="flex items-center text-blue-200 bg-white/10 rounded-xl p-4">
            <Sparkles className="h-5 w-5 mr-3" />
            <span className="font-medium">10 MCQ questions • 4 options each • 30 minutes duration</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="bg-red-500/20 p-2 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Document Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
          <div className="flex items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Select Document</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
              <span className="ml-4 text-xl text-gray-300">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-700/50 p-6 rounded-2xl inline-block mb-6">
                <FileText className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-gray-300 mb-3">No documents uploaded yet</h4>
              <p className="text-gray-400">Upload some PDF documents first to generate quizzes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  onClick={() => handleDocumentSelect(document)}
                  className={`relative border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedDocument?.id === document.id
                      ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-500/10 shadow-2xl shadow-blue-500/25'
                      : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      selectedDocument?.id === document.id ? 'bg-blue-500/20' : 'bg-gray-600/30'
                    }`}>
                      <FileText className={`h-8 w-8 ${
                        selectedDocument?.id === document.id ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    {selectedDocument?.id === document.id && (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-white mb-3 text-lg line-clamp-2">
                    {document.title}
                  </h4>
                  <p className="text-gray-300 mb-3 text-sm">
                    {document.original_filename}
                  </p>
                  <div className="flex items-center text-xs text-gray-400 bg-gray-800/50 rounded-lg p-2">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(document.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Difficulty Selection */}
        {showDifficultySelector && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold mr-4 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-white">Choose Difficulty</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {difficultyOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setDifficulty(option.value)}
                  className={`relative border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    difficulty === option.value
                      ? `border-${option.value === 'easy' ? 'emerald' : option.value === 'medium' ? 'yellow' : 'red'}-500/50 bg-gradient-to-br from-${option.value === 'easy' ? 'emerald' : option.value === 'medium' ? 'yellow' : 'red'}-500/10 to-${option.value === 'easy' ? 'emerald' : option.value === 'medium' ? 'yellow' : 'red'}-600/10 shadow-2xl shadow-${option.value === 'easy' ? 'emerald' : option.value === 'medium' ? 'yellow' : 'red'}-500/25`
                      : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-6 h-6 rounded-full ${option.color} shadow-lg`}></div>
                    {difficulty === option.value && (
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h4 className={`font-bold text-xl mb-3 ${
                    difficulty === option.value 
                      ? option.value === 'easy' ? 'text-emerald-400' : option.value === 'medium' ? 'text-yellow-400' : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {option.label}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedDocument && showDifficultySelector && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Generate</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">Document:</span>
                    <span className="font-semibold text-blue-400">{selectedDocument.title}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">Difficulty:</span>
                    <span className="font-semibold text-purple-400 capitalize">{difficulty}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={generateQuiz}
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 hover:scale-105 font-semibold text-lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white mr-3"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Brain className="h-6 w-6 mr-3" />
                    Generate Quiz
                    <ChevronRight className="h-6 w-6 ml-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
