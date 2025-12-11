import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Camera, ArrowLeft, Save, Eye, EyeOff,
  Check, X, Calendar, Shield, Gem, LogOut, Sparkles
} from 'lucide-react';
import { getCurrentUser, updateProfile, changePassword } from '../utils/userApi';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { COSMETICS } from '../data/cosmetics.js';

export const ProfilePage = ({ onBack }) => {
  const { currentUser, login, logout } = useUser();
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile editing
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bio, setBio] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [bioMessage, setBioMessage] = useState(null);
  
  // Cosmetics
  const [equippedTitle, setEquippedTitle] = useState('');
  const [equippedNameColor, setEquippedNameColor] = useState('');
  const [isEditingCosmetics, setIsEditingCosmetics] = useState(false);
  const [cosmeticsSaving, setCosmeticsSaving] = useState(false);
  const [cosmeticsMessage, setCosmeticsMessage] = useState(null);
  
  // Available cosmetics
  const titles = COSMETICS.titles;
  const nameColors = COSMETICS.nameColors;
  
  // Create color map from nameColors
  const colorMap = nameColors.reduce((map, item) => {
    map[item.id] = item.color || item.id;
    return map;
  }, {});
  
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
        setBio(data.user.bio || '');
        
        // Fetch equipped cosmetics
        const token = localStorage.getItem('userToken');
        const cosmeticsResponse = await fetch('/api/cosmetics/equipped', {
          headers: { 'X-User-Token': token }
        });
        
        if (cosmeticsResponse.ok) {
          const cosmeticsData = await cosmeticsResponse.json();
          if (cosmeticsData.equipped) {
            setEquippedTitle(cosmeticsData.equipped.equipped_title || '');
            setEquippedNameColor(cosmeticsData.equipped.equipped_name_color || '');
          }
        }
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

  const handleSaveBio = async () => {
    if (bio.length > 500) {
      setBioMessage({ type: 'error', text: 'Bio must be 500 characters or less' });
      return;
    }

    setBioSaving(true);
    setBioMessage(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/api/user/bio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ bio })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update bio');
      }

      setUserData(prev => ({ 
        ...prev, 
        user: { ...prev.user, bio } 
      }));
      setIsEditingBio(false);
      setBioMessage({ type: 'success', text: 'Bio updated successfully!' });
    } catch (err) {
      setBioMessage({ type: 'error', text: err.message || 'Failed to update bio' });
    } finally {
      setBioSaving(false);
    }
  };

  const handleSaveCosmetics = async () => {
    setCosmeticsSaving(true);
    setCosmeticsMessage(null);
    
    try {
      const token = localStorage.getItem('userToken');
      
      // Save title
      const titleResponse = await fetch('/api/cosmetics/equip', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': token
        },
        body: JSON.stringify({
          type: 'title',
          cosmeticId: equippedTitle || null
        })
      });

      if (!titleResponse.ok) {
        const data = await titleResponse.json();
        throw new Error(data.error || 'Failed to update title');
      }

      // Save name color
      const colorResponse = await fetch('/api/cosmetics/equip', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Token': token
        },
        body: JSON.stringify({
          type: 'nameColor',
          cosmeticId: equippedNameColor || null
        })
      });

      if (!colorResponse.ok) {
        const data = await colorResponse.json();
        throw new Error(data.error || 'Failed to update name color');
      }

      setIsEditingCosmetics(false);
      setCosmeticsMessage({ type: 'success', text: 'Profile customization updated!' });
    } catch (err) {
      setCosmeticsMessage({ type: 'error', text: err.message || 'Failed to update cosmetics' });
    } finally {
      setCosmeticsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      onBack(); // Go back to home
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

            {/* Bio */}
            <div>
              <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                💬 Bio
              </label>
              {isEditingBio ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    placeholder="Tell us about yourself (max 500 characters)"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none h-24"
                  />
                  <div className="text-xs text-gray-500">{bio.length}/500</div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      disabled={bioSaving}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {bioSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingBio(false);
                        setBio(user?.bio || '');
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <span className="text-white whitespace-pre-wrap break-words">
                    {bio || <span className="text-gray-500 italic">No bio yet...</span>}
                  </span>
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors ml-2 flex-shrink-0"
                  >
                    {t('profile.edit')}
                  </button>
                </div>
              )}
            </div>

            {/* Bio Message */}
            {bioMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                bioMessage.type === 'success' 
                  ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-400'
                  : 'bg-red-900/30 border border-red-500/50 text-red-400'
              }`}>
                {bioMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {bioMessage.text}
              </div>
            )}

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

          {/* Cosmetics Section */}
          <div className="border-t border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">Profile Customization</span>
              </div>
              {!isEditingCosmetics && (
                <button
                  onClick={() => setIsEditingCosmetics(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {t('profile.edit')}
                </button>
              )}
            </div>

            {isEditingCosmetics ? (
              <div className="space-y-4">
                {/* Title Selection */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Title</label>
                  <select
                    value={equippedTitle}
                    onChange={(e) => setEquippedTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  >
                    <option value="">None</option>
                    {titles.map(title => (
                      <option key={title.id} value={title.id}>{title.display || title.name}</option>
                    ))}
                  </select>
                  {equippedTitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      Preview: <span className="text-purple-400">{titles.find(t => t.id === equippedTitle)?.display || titles.find(t => t.id === equippedTitle)?.name}</span> {userData?.user?.displayName || userData?.user?.username}
                    </p>
                  )}
                </div>

                {/* Name Color Selection */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Username Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {nameColors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setEquippedNameColor(color.id)}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          equippedNameColor === color.id 
                            ? 'border-white ring-2 ring-offset-2 ring-offset-gray-900 ring-purple-500' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        style={{ backgroundColor: (colorMap[color.id] || color.color || '#ffffff') + '20' }}
                        title={color.name}
                      >
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: colorMap[color.id] || color.color || '#ffffff' }}></div>
                        <span className="text-xs text-gray-400 text-center">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  {equippedNameColor && (
                    <p className="text-xs text-gray-500 mt-2">
                      Preview: <span style={{ color: colorMap[equippedNameColor] || nameColors.find(c => c.id === equippedNameColor)?.color }}>@{userData?.user?.username}</span>
                    </p>
                  )}
                </div>

                {/* Cosmetics Message */}
                {cosmeticsMessage && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    cosmeticsMessage.type === 'success' 
                      ? 'bg-emerald-900/30 border border-emerald-500/50 text-emerald-400'
                      : 'bg-red-900/30 border border-red-500/50 text-red-400'
                  }`}>
                    {cosmeticsMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {cosmeticsMessage.text}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCosmetics}
                    disabled={cosmeticsSaving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {cosmeticsSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Customization
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingCosmetics(false);
                      // Reload original equipped values from userData
                      // For now, just close - they'll see the saved values
                      setCosmeticsMessage(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  <span className="text-gray-300 font-semibold">Title:</span> {equippedTitle ? titles.find(t => t.id === equippedTitle)?.display || titles.find(t => t.id === equippedTitle)?.name : 'None'}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-gray-300 font-semibold">Username Color:</span> 
                  <span 
                    className="ml-2 font-bold" 
                    style={{ color: colorMap[equippedNameColor] || nameColors.find(c => c.id === equippedNameColor)?.color || '#ffffff' }}
                  >
                    {equippedNameColor ? nameColors.find(c => c.id === equippedNameColor)?.name : 'Default'}
                  </span>
                </p>
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

          {/* Logout Section */}
          <div className="border-t border-gray-800 p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-900/50 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-700/50 hover:border-red-600 rounded-lg font-bold transition-colors"
              title="Logout from your account"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
