import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Save, 
  ArrowLeft, 
  Edit3, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({
    username: '',
    email: ''
  });

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.getProfile();
      if (response.success) {
        const userData = response.data;
        setProfileData({
          username: userData.username,
          email: userData.email
        });
        setOriginalData({
          username: userData.username,
          email: userData.email
        });
      }
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Check if there are any changes
      if (profileData.username === originalData.username) {
        setError('No changes to save');
        return;
      }

      const response = await authAPI.updateProfile({
        username: profileData.username
      });

      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setOriginalData(profileData);
        
        // Update the user context with new data
        await updateUser();
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.errors?.username?.[0] || error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
          <span className="text-xl text-gray-300">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl">
          
          {/* Profile Header */}
          <div className="flex items-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mr-6 shadow-lg">
              {profileData.username?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">User Profile</h2>
              <p className="text-gray-400">Manage your account information</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start">
              <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <User className="h-4 w-4 inline mr-2" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                    isEditing 
                      ? 'border-blue-500/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                      : 'border-gray-600/50 cursor-not-allowed'
                  }`}
                  placeholder="Enter your username"
                />
                {isEditing && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Edit3 className="h-4 w-4 text-blue-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-400 mt-2">This is your display name and can be updated</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-gray-400 cursor-not-allowed"
                placeholder="Email address"
              />
              <p className="text-xs text-gray-500 mt-2">Email address cannot be changed</p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700/50">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || profileData.username === originalData.username}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
