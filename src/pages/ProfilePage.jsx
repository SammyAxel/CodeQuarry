import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Camera, ArrowLeft, Save, Eye, EyeOff,
  Check, X, Calendar, Shield, Gem
} from 'lucide-react';
import { getCurrentUser, updateProfile, changePassword } from '../utils/userApi';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export const ProfilePage = ({ onBack }) => {
  const { currentUser, login } = useUser();
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile editing
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  
  // Password changing
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const data = await getCurrentUser();
        setUserData(data);
        setDisplayName(data.user.displayName || data.user.username);
        setAvatarUrl(data.user.avatarUrl || '');
        setAvatarPreview(data.user.avatarUrl || null);
      } catch (err) {
        console.error('Failed to load user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    
    try {
      const result = await updateProfile({ displayName, avatarUrl });
      setUserData(prev => ({ ...prev, user: result.user }));
      // Update context
      login({ ...currentUser, displayName, avatarUrl });
      setIsEditingProfile(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setProfileMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result;
        setAvatarPreview(dataUrl);
        setAvatarUrl(dataUrl);
        
        // Auto-save avatar
        setProfileSaving(true);
        try {
          const result = await updateProfile({ displayName, avatarUrl: dataUrl });
          setUserData(prev => ({ ...prev, user: result.user }));
          login({ ...currentUser, displayName, avatarUrl: dataUrl });
          setProfileMessage({ type: 'success', text: 'Profile picture updated!' });
        } catch (err) {
          setProfileMessage({ type: 'error', text: err.message || 'Failed to update avatar' });
          // Revert on error
          setAvatarPreview(userData?.user?.avatarUrl || null);
          setAvatarUrl(userData?.user?.avatarUrl || '');
        } finally {
          setProfileSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: "Passwords don't match" });
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    
    setPasswordSaving(true);
    setPasswordMessage(null);
    
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] flex items-center justify-center">
        <div className="animate-pulse text-purple-400 text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  const user = userData?.user;
  const stats = userData?.stats;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.backToHome')}
        </button>

        {/* Profile Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-8 text-center">
            <div className="relative inline-block">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black text-white">
                  {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-gray-400" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h1 className="text-2xl font-black text-white mt-4">
              {user?.displayName || user?.username}
            </h1>
            <p className="text-gray-400">@{user?.username}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 text-center border-r border-gray-800">
              <div className="text-2xl font-bold text-purple-400">{stats?.total_modules_completed || 0}</div>
              <div className="text-xs text-gray-500">Modules</div>
            </div>
            <div className="p-4 text-center border-r border-gray-800">
              <div className="text-2xl font-bold text-orange-400">{stats?.current_streak_days || 0}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{stats?.total_courses_completed || 0}</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-6">
            {/* Display Name */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('profile.displayName')}
              </label>
              {isEditingProfile ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {t('profile.save')}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false);
                      setDisplayName(user?.displayName || user?.username);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-white">{user?.displayName || user?.username}</span>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {t('profile.edit')}
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('profile.email')}
              </label>
              <div className="flex items-center justify-between">
                <span className="text-white">{user?.email}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {t('profile.verified')}
                </span>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Gem className="w-4 h-4" />
                {t('profile.username')}
              </label>
              <span className="text-white">@{user?.username}</span>
            </div>

            {/* Member Since */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('profile.memberSince')}
              </label>
              <span className="text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </span>
            </div>

            {/* Profile Message */}
            {profileMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                profileMessage.type === 'success' 
                  ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-400'
                  : 'bg-red-900/30 border border-red-500/50 text-red-400'
              }`}>
                {profileMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {profileMessage.text}
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-800 p-6">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span className="font-bold">{t('profile.changePassword')}</span>
            </button>

            {showPasswordSection && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('profile.currentPassword')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 pr-10 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('profile.newPassword')}</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t('profile.confirmNewPassword')}</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">Passwords don't match</p>
                  )}
                </div>

                {/* Password Message */}
                {passwordMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-400'
                      : 'bg-red-900/30 border border-red-500/50 text-red-400'
                  }`}>
                    {passwordMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {passwordMessage.text}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={passwordSaving || newPassword !== confirmPassword}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {passwordSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    {t('profile.updatePassword')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMessage(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
