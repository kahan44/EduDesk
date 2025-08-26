import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
    case AuthActionTypes.REGISTER_START:
    case AuthActionTypes.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
    case AuthActionTypes.REGISTER_FAILURE:
    case AuthActionTypes.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.loading,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to clear auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

  // Load user from token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        dispatch({ type: AuthActionTypes.LOAD_USER_START });
        
        // Try to get fresh user data from API
        const response = await authAPI.getProfile();
        
        if (response.success) {
          dispatch({
            type: AuthActionTypes.LOAD_USER_SUCCESS,
            payload: { user: response.data },
          });
          
          // Update stored user data
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          throw new Error('Failed to load user profile');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // If API call fails, use stored user data
        try {
          const user = JSON.parse(storedUser);
          dispatch({
            type: AuthActionTypes.LOAD_USER_SUCCESS,
            payload: { user },
          });
        } catch (parseError) {
          // If stored data is invalid, clear everything
          clearAuthData();
          dispatch({
            type: AuthActionTypes.LOAD_USER_FAILURE,
            payload: { error: 'Invalid stored user data' },
          });
        }
      }
    } else {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: { loading: false } });
    }
  }, [clearAuthData]);

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.LOGIN_START });
      
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, tokens } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user },
        });
        
        return { success: true, user };
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: { error: errorMessage },
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      // Handle different error formats
      if (error?.errors) {
        if (typeof error.errors === 'object') {
          const errorMessages = Object.values(error.errors).flat();
          errorMessage = errorMessages.join(', ');
        } else {
          errorMessage = error.errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.REGISTER_START });
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, tokens } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: { user },
        });
        
        return { success: true, user };
      } else {
        const errorMessage = response.message || 'Registration failed';
        dispatch({
          type: AuthActionTypes.REGISTER_FAILURE,
          payload: { error: errorMessage },
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      // Handle different error formats
      if (error?.errors) {
        if (typeof error.errors === 'object') {
          const errorMessages = Object.values(error.errors).flat();
          errorMessage = errorMessages.join(', ');
        } else {
          errorMessage = error.errors;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data regardless of API call result
      clearAuthData();
      dispatch({ type: AuthActionTypes.LOGOUT });
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_PROFILE,
          payload: { user: updatedUser },
        });
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.message || error.errors || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Update user function (refresh user data)
  const updateUser = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_PROFILE,
          payload: { user: updatedUser },
        });
        
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Failed to update user data');
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
      return { success: false, error: error.message || 'Failed to update user data' };
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  }, []);

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    clearError,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
