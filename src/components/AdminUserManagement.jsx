import { useState, useEffect } from 'react';
import { X, Crown, User, Mail, Calendar, Clock, Gem, Shield, Trash2, RotateCcw, Settings } from 'lucide-react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'user'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // User detail modal
  const [editingGems, setEditingGems] = useState(false);
  const [gemInput, setGemInput] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'x-user-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-token': token
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      alert('✅ User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleChangeRole = async (userId, newRole, username, currentRole) => {
    if (!confirm(`Change "${username}" role from ${currentRole} to ${newRole}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      alert('✅ Role updated successfully');
      setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      fetchUsers();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleResetUserProgress = async (userId, username) => {
    if (!confirm(`⚠️ Reset ALL progress for user "${username}"?\n\nThis will delete:\n- All completed modules\n- All saved code\n- All course progress\n- All stats\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/reset-progress`, {
        method: 'POST',
        headers: {
          'x-user-token': token
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset progress');
      }

      alert('✅ User progress reset successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleResetCourseProgress = async (userId, username) => {
    const courseId = prompt(`Enter course ID to reset for "${username}":\n\nExamples:\n- js-101\n- py-101\n- c-101`);
    
    if (!courseId || !courseId.trim()) {
      return;
    }

    if (!confirm(`Reset progress for course "${courseId}" for user "${username}"?\n\nThis will delete:\n- All completed modules in this course\n- All saved code for this course\n- Course stats\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/reset-course/${courseId.trim()}`, {
        method: 'POST',
        headers: {
          'x-user-token': token
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset course progress');
      }

      alert(`✅ Course "${courseId}" progress reset successfully`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleEditGemsClick = () => {
    setEditingGems(true);
    setGemInput((selectedUser.total_gems || 0).toString());
  };

  const handleSaveGems = async () => {
    if (!selectedUser) return;

    const amount = parseInt(gemInput, 10);
    if (isNaN(amount) || amount < 0) {
      alert('❌ Please enter a valid non-negative number');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/gems`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-token': token
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update gems');
      }

      alert(`✅ Updated gems to ${amount}`);
      setEditingGems(false);
      setGemInput('');
      setSelectedUser({ ...selectedUser, total_gems: amount });
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400">❌ {error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            User Management
          </h1>
          <p className="text-gray-400">Manage users, roles, and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <p className="text-blue-200 text-sm font-medium mb-1">Total Users</p>
            <p className="text-4xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-purple-300" />
              <p className="text-purple-200 text-sm font-medium">Admins</p>
            </div>
            <p className="text-4xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-orange-300" />
              <p className="text-orange-200 text-sm font-medium">Moderators</p>
            </div>
            <p className="text-4xl font-bold text-white">{users.filter(u => u.role === 'mod').length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-green-300" />
              <p className="text-green-200 text-sm font-medium">Regular Users</p>
            </div>
            <p className="text-4xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'admin' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
              </button>
              <button
                onClick={() => setFilter('mod')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'mod' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                Mods ({users.filter(u => u.role === 'mod').length})
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'user' 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                Users ({users.filter(u => u.role === 'user').length})
              </button>
            </div>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer group"
            >
              {/* User Avatar & Info */}
              <div className="flex items-start gap-4 mb-4">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="w-16 h-16 rounded-full ring-2 ring-white/20 group-hover:ring-blue-500/50 transition"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/20 group-hover:ring-blue-500/50 transition">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-300 transition">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{user.display_name || 'No display name'}</p>
                  
                  {/* Role Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50' 
                        : user.role === 'mod'
                        ? 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
                        : 'bg-green-600/30 text-green-200 border border-green-500/50'
                    }`}>
                      {user.role === 'admin' ? <Crown className="w-3 h-3" /> : user.role === 'mod' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'admin' ? 'Admin' : user.role === 'mod' ? 'Mod' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Gems</p>
                  <p className="text-lg font-bold text-yellow-400 flex items-center gap-1">
                    <Gem className="w-4 h-4" />
                    {user.total_gems || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Last Active</p>
                  <p className="text-sm font-semibold text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateShort(user.last_login_at)}
                  </p>
                </div>
              </div>

              {/* Click hint */}
              <div className="mt-4 text-center">
                <span className="text-xs text-gray-500 group-hover:text-blue-400 transition">
                  Click to manage →
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-300 mb-2">No users found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Count */}
        {filteredUsers.length > 0 && (
          <div className="text-center text-gray-400 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* User Detail Modal */}
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
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Role</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedUser.role === 'admin' 
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50' 
                      : selectedUser.role === 'mod'
                      ? 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
                      : 'bg-green-600/30 text-green-200 border border-green-500/50'
                  }`}>
                    {selectedUser.role === 'admin' ? <Crown className="w-4 h-4" /> : selectedUser.role === 'mod' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'mod' ? 'Moderator' : 'User'}
                  </span>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Gem className="w-4 h-4" />
                    <span className="text-sm">Gems Balance</span>
                  </div>
                  {editingGems ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        value={gemInput}
                        onChange={(e) => setGemInput(e.target.value)}
                        className="w-24 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveGems}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingGems(false)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEditGemsClick}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-bold transition group"
                    >
                      <Gem className="w-5 h-5" />
                      {selectedUser.total_gems || 0}
                      <Settings className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Last Login</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.last_login_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  User Actions
                </h3>
                
                <div className="space-y-4">
                  {/* Role Change Buttons */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Change Role</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedUser.role !== 'user' && (
                        <button
                          onClick={() => handleChangeRole(selectedUser.id, 'user', selectedUser.username, selectedUser.role)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-sm"
                        >
                          <User className="w-4 h-4" />
                          User
                        </button>
                      )}
                      {selectedUser.role !== 'mod' && (
                        <button
                          onClick={() => handleChangeRole(selectedUser.id, 'mod', selectedUser.username, selectedUser.role)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Mod
                        </button>
                      )}
                      {selectedUser.role !== 'admin' && (
                        <button
                          onClick={() => handleChangeRole(selectedUser.id, 'admin', selectedUser.username, selectedUser.role)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition text-sm"
                        >
                          <Crown className="w-4 h-4" />
                          Admin
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Other Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Other Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          handleResetCourseProgress(selectedUser.id, selectedUser.username);
                          setSelectedUser(null);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Course Progress
                      </button>

                  <button
                    onClick={() => {
                      handleResetUserProgress(selectedUser.id, selectedUser.username);
                      setSelectedUser(null);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 hover:bg-red-800 rounded-lg font-semibold transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Progress
                  </button>

                      <button
                        onClick={() => {
                          handleDeleteUser(selectedUser.id, selectedUser.username);
                          setSelectedUser(null);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
