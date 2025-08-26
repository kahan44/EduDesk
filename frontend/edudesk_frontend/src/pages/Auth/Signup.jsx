import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  // Simplified form validation rules
  const validationRules = {
    username: {
      required: { message: 'Username is required' },
      minLength: { value: 3, message: 'Username must be at least 3 characters' },
      pattern: {
        value: /^[a-zA-Z0-9_]+$/,
        message: 'Username can only contain letters, numbers, and underscores'
      }
    },
    email: {
      required: { message: 'Email is required' },
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    password: {
      required: { message: 'Password is required' },
      minLength: { value: 8, message: 'Password must be at least 8 characters' }
    },
    confirm_password: {
      required: { message: 'Please confirm your password' },
      custom: (value, values) => {
        if (value !== values.password) {
          return 'Passwords do not match';
        }
        return null;
      }
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
      username: '',
      email: '',
      password: '',
      confirm_password: ''
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
    
    const result = await register(formData);
    
    if (result.success) {
      // Navigate immediately after successful registration
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
        // Handle validation errors from backend
        const errorMessages = Object.values(error.errors).flat();
        return errorMessages.join(', ');
      } else if (error.message) {
        return error.message;
      }
    }
    return null;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    };
  };

  const passwordStrength = getPasswordStrength(values.password);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Back to Home */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">EduDesk</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Join EduDesk
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Create your account and start learning with AI
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
            {/* Username */}
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                    errors.username && touched.username
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm`}
                  placeholder="Username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
              </div>
              {errors.username && touched.username && (
                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
              )}
            </div>

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
                  autoComplete="new-password"
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
              
              {/* Password Strength Indicator */}
              {values.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
              
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                    errors.confirm_password && touched.confirm_password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : values.confirm_password && values.password === values.confirm_password
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } placeholder-gray-400 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm`}
                  placeholder="Confirm Password"
                  value={values.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                  {values.confirm_password && values.password === values.confirm_password && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white disabled:opacity-50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirm_password && touched.confirm_password && (
                <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <div>
              <span className="text-gray-400">Already have an account? </span>
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Sign in here
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

export default Signup;
