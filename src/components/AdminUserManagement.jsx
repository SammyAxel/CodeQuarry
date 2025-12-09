import { useState, useEffect } from 'react';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'admin', 'user'
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleToggleRole = async (userId, currentRole, username) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
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
      fetchUsers(); // Refresh the list
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">👥 User Management</h1>
          <p className="text-gray-300">Manage users, roles, and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-gray-300 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-gray-300 text-sm">Admins</p>
            <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-gray-300 text-sm">Regular Users</p>
            <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'admin' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
              </button>
              <button
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Users ({users.filter(u => u.role === 'user').length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Login</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.display_name || 'No display name'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' 
                          ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50' 
                          : 'bg-green-600/30 text-green-200 border border-green-500/50'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(user.last_login_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role, user.username)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition"
                            title={`Change role to ${user.role === 'admin' ? 'user' : 'admin'}`}
                          >
                            {user.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition"
                            title="Delete user"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleResetCourseProgress(user.id, user.username)}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs transition"
                            title="Reset progress for specific course"
                          >
                            🔄 Reset Course
                          </button>
                          <button
                            onClick={() => handleResetUserProgress(user.id, user.username)}
                            className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-xs transition"
                            title="Reset all progress"
                          >
                            ⚠️ Reset All
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-xl mb-2">🔍 No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Showing count */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
