import { useState, useEffect } from 'react';
import { Trophy, Medal, Gem, Book, Target, X, User, Crown, Shield, Calendar, Clock } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('gems'); // 'gems', 'modules', 'courses'
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/leaderboard?sortBy=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setSelectedUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg shadow-gray-400/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50';
    return 'bg-white/5';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getRoleDisplay = (role, customRole) => {
    if (customRole) {
      return { text: customRole, color: 'bg-gradient-to-r from-purple-600 to-pink-600', icon: <Crown className="w-4 h-4" /> };
    }
    if (role === 'admin') return { text: 'Admin', color: 'bg-purple-600/30 border border-purple-500/50', icon: <Crown className="w-4 h-4" /> };
    if (role === 'mod') return { text: 'Moderator', color: 'bg-orange-600/30 border border-orange-500/50', icon: <Shield className="w-4 h-4" /> };
    return { text: 'User', color: 'bg-green-600/30 border border-green-500/50', icon: <User className="w-4 h-4" /> };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400">Compete with fellow miners for the top spot!</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          <button
            onClick={() => setFilter('gems')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'gems' 
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <Gem className="w-4 h-4" />
            Most Gems
          </button>
          <button
            onClick={() => setFilter('modules')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'modules' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <Book className="w-4 h-4" />
            Most Modules
          </button>
          <button
            onClick={() => setFilter('courses')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'courses' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <Target className="w-4 h-4" />
            Most Courses
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const rank = index + 1;
            const roleInfo = getRoleDisplay(user.role, user.custom_role);
            
            return (
              <div
                key={user.id}
                onClick={() => fetchUserProfile(user.id)}
                className={`${getRankBadge(rank)} backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-14 h-14 rounded-full ring-2 ring-white/20 group-hover:ring-blue-500/50 transition"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/20 group-hover:ring-blue-500/50 transition">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-300 transition">
                        {user.username}
                      </h3>
                      {roleInfo && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                          {roleInfo.icon}
                          {roleInfo.text}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{user.display_name || 'No display name'}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Gems</p>
                      <p className="font-bold text-yellow-400 flex items-center gap-1">
                        <Gem className="w-4 h-4" />
                        {user.total_gems || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Modules</p>
                      <p className="font-bold text-blue-400">{user.completed_modules || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Courses</p>
                      <p className="font-bold text-purple-400">{user.completed_courses || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">No rankings yet</p>
            <p className="text-sm text-gray-500">Complete modules to appear on the leaderboard!</p>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
                {selectedUser.avatar_url ? (
                  <img 
                    src={selectedUser.avatar_url} 
                    alt={selectedUser.username}
                    className="w-16 h-16 rounded-full ring-4 ring-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white/30">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUser.username}</h2>
                  <p className="text-blue-100">{selectedUser.display_name || 'No display name'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Role Badge */}
              {(() => {
                const roleInfo = getRoleDisplay(selectedUser.role, selectedUser.custom_role);
                return (
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${roleInfo.color}`}>
                      {roleInfo.icon}
                      {roleInfo.text}
                    </span>
                  </div>
                );
              })()}

              {/* Bio */}
              {selectedUser.bio && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Bio</h3>
                  <p className="text-white">{selectedUser.bio}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <Gem className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Gems</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{selectedUser.total_gems || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-300 mb-2">
                    <Book className="w-5 h-5" />
                    <span className="text-sm font-medium">Modules</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{selectedUser.completed_modules || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 text-purple-300 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Courses</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{selectedUser.completed_courses || 0}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Last Active</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.last_login_at)}</p>
                </div>
              </div>

              {/* View Full Profile Button */}
              <div className="pt-4 border-t border-white/10">
                <a
                  href={`/user/${selectedUser.userId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', `/user/${selectedUser.userId}`);
                    window.location.href = `/user/${selectedUser.userId}`;
                  }}
                  className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold text-center transition shadow-lg"
                >
                  View Full Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
