import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, BookOpen, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  // Simplified form validation rules
  const validationRules = {
    email: {
      required: { message: 'Email is required' },
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    password: {
      required: { message: 'Password is required' },
      minLength: { value: 1, message: 'Password is required' }
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setIsSubmitting
  } = useForm(
    {
      email: '',
      password: ''
    },
    validationRules
  );

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    
    const result = await login(formData);
    
    if (result.success) {
      // Navigate immediately after successful login
      navigate('/dashboard', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  // Get error message for display
  const getErrorMessage = () => {
    if (error) {
      if (typeof error === 'string') {
        return error;
      } else if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        return errorMessages.join(', ');
      } else if (error.message) {
        return error.message;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Back to Home */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">EduDesk</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Welcome back! Please sign in to continue
          </p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <span className="text-red-300 text-sm">{getErrorMessage()}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <div>
              <span className="text-gray-400">Don't have an account? </span>
              <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
                Sign up here
              </Link>
            </div>
            <div>
              <Link to="/" className="font-medium text-gray-400 hover:text-white transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
