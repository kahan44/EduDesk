import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ArrowLeft,
  Bot,
  User,
  Loader,
  Brain,
  Sparkles,
  MessageCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatbotAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const EduAIChatbot = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isNewChat, setIsNewChat] = useState(false); // New state for new chat mode

  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    
    // Add window focus event to refresh sessions when user returns to tab
    const handleWindowFocus = () => {
      fetchSessions();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    // Auto-select the first session if no session is selected, sessions exist, and not in new chat mode
    if (!currentSession && sessions.length > 0 && !isNewChat) {
      const latestSession = sessions[0];
      fetchSessionMessages(latestSession.id);
    }
  }, [sessions, currentSession, isNewChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      setError('');
      
      // Try to load from localStorage first for instant UI update
      const cachedSessions = localStorage.getItem(`chatbot_sessions_${user?.id}`);
      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions);
        setSessions(parsed);
      }
      
      const response = await chatbotAPI.getSessions();
      
      // The API returns the sessions array directly, not wrapped in a success object
      if (Array.isArray(response)) {
        setSessions(response);
        
        // Cache sessions in localStorage with user-specific key
        if (user?.id) {
          localStorage.setItem(`chatbot_sessions_${user.id}`, JSON.stringify(response));
        }
        
        // If we had a current session before, try to maintain it
        if (currentSession) {
          const existingSession = response.find(s => s.id === currentSession.id);
          if (existingSession) {
            setCurrentSession(existingSession);
          }
        }
      } else {
        setError('Failed to load chat sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load chat sessions');
      
      // On error, try to use cached data
      const cachedSessions = localStorage.getItem(`chatbot_sessions_${user?.id}`);
      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions);
        setSessions(parsed);
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      const response = await chatbotAPI.getSession(sessionId);
      if (response.success) {
        setCurrentSession(response.data);
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setError('');
      // Set up new chat state - show input interface without backend session
      setCurrentSession(null);
      setMessages([]);
      setIsNewChat(true); // Enable new chat mode
      
      // Clear any input that might be there
      setInputMessage('');
      
      // This will trigger a new session creation when first message is sent
    } catch (error) {
      setError('Failed to create new chat');
      console.error('Error creating session:', error);
    }
  };

  const handleSessionClick = (session) => {
    if (session.id === currentSession?.id) return;
    setError(''); // Clear any previous errors
    setIsNewChat(false); // Exit new chat mode
    fetchSessionMessages(session.id);
  };

  const refreshCurrentSession = async () => {
    if (currentSession) {
      try {
        const response = await chatbotAPI.getSession(currentSession.id);
        if (response.success) {
          setMessages(response.data.messages || []);
          setCurrentSession(response.data);
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setError('');

    try {
      const response = await chatbotAPI.sendMessage(userMessage, currentSession?.id);
      
      if (response.success) {
        const { user_message, ai_response, session_id, session_title } = response.data;
        
        // Update messages
        setMessages(prev => [...prev, user_message, ai_response]);
        
        // Exit new chat mode since we now have a real session
        setIsNewChat(false);
        
        // Update or set current session
        if (!currentSession || currentSession.id !== session_id) {
          const newSession = {
            id: session_id,
            title: session_title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            message_count: 2,
            is_active: true
          };
          setCurrentSession(newSession);
          
          // Update sessions list - add new session or update existing
          setSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === session_id);
            if (existingIndex >= 0) {
              // Update existing session
              const updated = [...prev];
              updated[existingIndex] = { ...updated[existingIndex], ...newSession };
              
              // Update localStorage
              if (user?.id) {
                localStorage.setItem(`chatbot_sessions_${user.id}`, JSON.stringify(updated));
              }
              
              return updated;
            } else {
              // Add new session at the beginning
              const updated = [newSession, ...prev];
              
              // Update localStorage
              if (user?.id) {
                localStorage.setItem(`chatbot_sessions_${user.id}`, JSON.stringify(updated));
              }
              
              return updated;
            }
          });
        } else {
          // Update existing session in list with potential title update
          setSessions(prev => {
            const updated = prev.map(s => 
              s.id === session_id 
                ? { 
                    ...s, 
                    title: session_title || s.title, // Update title if provided
                    updated_at: new Date().toISOString(), 
                    message_count: s.message_count + 2 
                  }
                : s
            );
            
            // Update localStorage
            if (user?.id) {
              localStorage.setItem(`chatbot_sessions_${user.id}`, JSON.stringify(updated));
            }
            
            return updated;
          });
          
          // Update current session with potential title update
          setCurrentSession(prev => ({
            ...prev,
            title: session_title || prev.title, // Update title if provided
            updated_at: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
      // Add the user message back to input if sending failed
      setInputMessage(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      setError('');
      const response = await chatbotAPI.deleteSession(sessionId);
      
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // Update localStorage
      if (user?.id) {
        localStorage.setItem(`chatbot_sessions_${user.id}`, JSON.stringify(updatedSessions));
      }
      
      if (currentSession?.id === sessionId) {
        // If deleting current session, select the first remaining session or clear
        if (updatedSessions.length > 0) {
          fetchSessionMessages(updatedSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
          setIsNewChat(false);
        }
      }
    } catch (error) {
      setError('Failed to delete chat');
      console.error('Error deleting session:', error);
      
      // Don't update UI if API call failed
      // The session should remain in the list
    }
  };

  const startEditingTitle = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveTitle = async (sessionId) => {
    if (!editingTitle.trim()) return;

    try {
      const response = await chatbotAPI.updateSession(sessionId, { title: editingTitle.trim() });
      if (response.success) {
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
        ));
        if (currentSession?.id === sessionId) {
          setCurrentSession(prev => ({ ...prev, title: editingTitle.trim() }));
        }
      }
    } catch (error) {
      setError('Failed to update title');
      console.error('Error updating title:', error);
    } finally {
      setEditingSessionId(null);
      setEditingTitle('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col overflow-hidden lg:relative lg:block ${showSidebar ? 'fixed lg:static' : 'hidden lg:flex'} z-50 lg:z-auto h-full`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            
            <button
              onClick={fetchSessions}
              disabled={sessionsLoading}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/30"
              title="Refresh sessions"
            >
              <RefreshCw className={`h-4 w-4 ${sessionsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mr-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edu AI</h2>
              <p className="text-gray-400 text-sm">Your Learning Assistant</p>
            </div>
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 text-blue-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading chats...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button
                onClick={fetchSessions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No chats yet</p>
              <p className="text-gray-500 text-sm">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={`group cursor-pointer rounded-xl p-4 transition-all duration-300 ${
                    currentSession?.id === session.id
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-gray-700/30 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => saveTitle(session.id)}
                          onKeyPress={(e) => e.key === 'Enter' && saveTitle(session.id)}
                          className="w-full bg-transparent text-white font-medium text-sm border-b border-blue-500 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-white font-medium text-sm truncate">{session.title}</h3>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(session.updated_at)}</span>
                        <span className="mx-2">•</span>
                        <span>{session.message_count} messages</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditingTitle(session, e)}
                        className="p-1 text-gray-400 hover:text-white rounded"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Chat Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden mr-4 p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-xl mr-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {currentSession ? currentSession.title : isNewChat ? 'New Chat' : 'Edu AI Assistant'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {currentSession || isNewChat ? 'Ask me anything about your studies!' : 'Start a new conversation to begin learning!'}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:block p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {!currentSession && !isNewChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to Edu AI!</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                  Your intelligent learning companion. Ask me questions about any subject, 
                  get study help, or explore new topics together!
                </p>
                <button
                  onClick={createNewSession}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg"
                >
                  Start Learning
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <Loader className="h-8 w-8 text-blue-400 animate-spin" />
                <span className="text-xl text-gray-300">Loading conversation...</span>
              </div>
            </div>
          ) : (currentSession || isNewChat) && (
            <div className="max-w-4xl mx-auto space-y-6">
              {isNewChat && messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Learn!</h3>
                  <p className="text-gray-400 text-sm">Type your question below to start our conversation.</p>
                </div>
              )}
              
              {messages.filter(message => message && message.message_type && message.content).map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex items-start space-x-4 ${
                    message.message_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.message_type === 'ai' && (
                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-2 rounded-full flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-3xl p-4 rounded-2xl ${
                      message.message_type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.message_type === 'user' && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isSending && (
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-2 rounded-full flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 text-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {(currentSession || isNewChat) && (
          <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-6 sticky bottom-0 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={isSending}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSending ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <span>Press Enter to send • Shift + Enter for new line</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}
    </div>
  );
};

export default EduAIChatbot;
