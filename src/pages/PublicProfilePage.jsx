import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, Clock, Gem, BookOpen, Target, ArrowLeft, Crown } from 'lucide-react';

const PublicProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract userId from URL pathname
  const userId = location.pathname.match(/^\/user\/(\d+)$/)?.[1];
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/user/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-purple-600 to-pink-600';
      case 'mod':
        return 'from-orange-600 to-red-600';
      default:
        return 'from-green-600 to-blue-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5" />;
      case 'mod':
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This user does not exist.'}</p>
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            ← Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.displayName || profile.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (profile.displayName || profile.username).charAt(0).toUpperCase()
                )}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor(profile.role)} text-white text-xs font-bold shadow-lg flex items-center gap-1`}>
                {getRoleIcon(profile.role)}
                {profile.role === 'admin' ? 'Admin' : profile.role === 'mod' ? 'Mod' : 'User'}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-gray-400 text-lg mb-3">@{profile.username}</p>
              
              {/* Custom Role */}
              {profile.customRole && (
                <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 border border-yellow-400/50 mb-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent font-bold text-lg">
                    👑 {profile.customRole}
                  </span>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 mt-3 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Gems */}
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Gem className="w-8 h-8 text-yellow-400" />
              <span className="text-gray-400 font-semibold">Gems</span>
            </div>
            <p className="text-4xl font-bold text-yellow-400">{profile.gems.toLocaleString()}</p>
          </div>

          {/* Modules */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span className="text-gray-400 font-semibold">Modules</span>
            </div>
            <p className="text-4xl font-bold text-blue-400">{profile.modulesCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>

          {/* Courses */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-purple-400" />
              <span className="text-gray-400 font-semibold">Courses</span>
            </div>
            <p className="text-4xl font-bold text-purple-400">{profile.coursesCompleted}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-semibold">{formatDate(profile.joinedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Active</p>
                <p className="font-semibold">{formatDate(profile.lastActive)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
