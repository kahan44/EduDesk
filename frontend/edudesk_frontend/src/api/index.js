import API from './axios';

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login/', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: async (refreshToken) => {
    try {
      const response = await API.post('/auth/logout/', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await API.patch('/auth/profile/', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await API.put('/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if email exists
  checkEmail: async (email) => {
    try {
      const response = await API.post('/auth/check-email/', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if username exists
  checkUsername: async (username) => {
    try {
      const response = await API.post('/auth/check-username/', { username });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await API.get('/auth/dashboard-stats/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await API.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Document API calls
export const documentAPI = {
  // Upload a new document
  uploadDocument: async (formData) => {
    try {
      const response = await API.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all user documents
  getDocuments: async () => {
    try {
      const response = await API.get('/documents/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific document
  getDocument: async (documentId) => {
    try {
      const response = await API.get(`/documents/${documentId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update document
  updateDocument: async (documentId, data) => {
    try {
      const response = await API.patch(`/documents/${documentId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      const response = await API.delete(`/documents/${documentId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Quiz API calls
export const quizAPI = {
  // Generate a new quiz from a document
  generateQuiz: async (requestData) => {
    try {
      const response = await API.post('/quizzes/generate/', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all quizzes for the user
  getQuizzes: async () => {
    try {
      const response = await API.get('/quizzes/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific quiz details
  getQuizDetails: async (quizId) => {
    try {
      const response = await API.get(`/quizzes/${quizId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit quiz answers
  submitQuiz: async (submissionData) => {
    try {
      const response = await API.post('/quizzes/submit/', submissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get quiz attempts history
  getQuizAttempts: async () => {
    try {
      const response = await API.get('/quizzes/attempts/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get quiz statistics
  getQuizStats: async () => {
    try {
      const response = await API.get('/quizzes/stats/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a quiz
  deleteQuiz: async (quizId) => {
    try {
      const response = await API.delete(`/quizzes/${quizId}/delete/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Quiz Session Management
  // Start a new quiz session (or resume existing one)
  startQuizSession: async (quizId) => {
    try {
      const response = await API.post(`/quizzes/${quizId}/start-session/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user has an active session for a quiz
  checkActiveSession: async (quizId) => {
    try {
      const response = await API.get(`/quizzes/${quizId}/check-session/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current quiz session status
  getQuizSession: async (sessionId) => {
    try {
      const response = await API.get(`/quizzes/session/${sessionId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update quiz session progress (auto-save)
  updateQuizSession: async (sessionId, progressData) => {
    try {
      const response = await API.post(`/quizzes/session/${sessionId}/update/`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Save answer immediately when user selects an option
  saveAnswerImmediately: async (sessionId, questionId, selectedOption) => {
    try {
      const response = await API.post(`/quizzes/session/${sessionId}/save-answer/`, {
        question_id: questionId,
        selected_option: selectedOption
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complete quiz session and submit final answers
  completeQuizSession: async (sessionId, finalData) => {
    try {
      console.log('=== API CALL DEBUG ===');
      console.log('URL:', `/quizzes/session/${sessionId}/complete/`);
      console.log('Data being sent:', finalData);
      
      const response = await API.post(`/quizzes/session/${sessionId}/complete/`, finalData);
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('API Error in completeQuizSession:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // Provide more detailed error information
      const errorData = error.response?.data || { message: error.message };
      throw errorData;
    }
  },

  // Check if user has any active quiz session
  checkAnyActiveSession: async () => {
    try {
      const response = await API.get('/quizzes/check-active-session/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Analytics API calls
export const analyticsAPI = {
  // Get quiz attempts analytics (grouped by quiz)
  getQuizAttemptsAnalytics: async () => {
    try {
      const response = await API.get('/analytics/quiz-attempts/');
      return response.data;
    } catch (error) {
      
      throw error.response?.data || error.message;
    }
  },
  
  // Get detailed analytics for a specific quiz
  getDetailedQuizAnalytics: async (quizId) => {
    try {
      const response = await API.get(`/analytics/quiz/${quizId}/detailed/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Get overall analytics summary
  getOverallAnalytics: async () => {
    try {
      const response = await API.get('/analytics/overall/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Chatbot API calls
export const chatbotAPI = {
  // Get all chat sessions
  getSessions: async () => {
    try {
      const response = await API.get('/chatbot/sessions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get specific chat session with messages
  getSession: async (sessionId) => {
    try {
      const response = await API.get(`/chatbot/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new chat session
  createSession: async () => {
    try {
      const response = await API.post('/chatbot/sessions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send message and get AI response
  sendMessage: async (message, sessionId = null) => {
    try {
      const payload = { message };
      if (sessionId) {
        payload.session_id = sessionId;
      }
      const response = await API.post('/chatbot/send-message/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update session (e.g., rename)
  updateSession: async (sessionId, data) => {
    try {
      const response = await API.patch(`/chatbot/sessions/${sessionId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const response = await API.delete(`/chatbot/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get chat statistics
  getStats: async () => {
    try {
      const response = await API.get('/chatbot/stats/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};