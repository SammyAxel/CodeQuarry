import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, AlertTriangle, Clock, User, Code, 
  Download, Trash2, RefreshCw, Filter, X,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

/**
 * Security Dashboard Component
 * Displays security events logged during the session
 * Allows filtering, exporting, and clearing logs
 */
export const SecurityDashboard = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load logs from sessionStorage
  const loadLogs = () => {
    try {
      const storedLogs = sessionStorage.getItem('security_logs');
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.error('Failed to load security logs:', e);
      setLogs([]);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Refresh logs every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // Event categories for filtering
  const categories = {
    all: { label: 'All Events', icon: Shield },
    auth: { label: 'Authentication', icon: User, events: ['user_login', 'admin_login_success', 'mod_login_success', 'admin_login_failed', 'user_logout', 'admin_session_started'] },
    session: { label: 'Session', icon: Clock, events: ['session_warning_shown', 'session_extended', 'session_timeout'] },
    code: { label: 'Code Execution', icon: Code, events: ['code_execution_rate_limited', 'code_execution_timeout', 'worker_timeout', 'worker_initialized', 'worker_error'] },
    csrf: { label: 'CSRF/Forms', icon: AlertTriangle, events: ['course_save_csrf_failed', 'delete_draft_csrf_failed', 'course_save_success', 'draft_deleted'] },
    error: { label: 'Errors', icon: XCircle, events: ['application_error', 'worker_init_failed'] },
  };

  // Filter logs based on category and search
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Filter by category
    if (filter !== 'all' && categories[filter]?.events) {
      result = result.filter(log => categories[filter].events.includes(log.event));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.event?.toLowerCase().includes(query) ||
        JSON.stringify(log.data)?.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs, filter, searchQuery]);

  // Get event icon and color
  const getEventStyle = (event) => {
    if (event.includes('success') || event.includes('login') && !event.includes('failed')) {
      return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/20' };
    }
    if (event.includes('failed') || event.includes('error') || event.includes('timeout')) {
      return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-600/20' };
    }
    if (event.includes('warning') || event.includes('csrf')) {
      return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-600/20' };
    }
    return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-600/20' };
  };

  // Export logs as JSON
  const handleExport = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all logs
  const handleClear = () => {
    if (confirm('Are you sure you want to clear all security logs?')) {
      sessionStorage.removeItem('security_logs');
      setLogs([]);
    }
  };

  // Stats summary
  const stats = useMemo(() => ({
    total: logs.length,
    errors: logs.filter(l => l.event?.includes('failed') || l.event?.includes('error')).length,
    warnings: logs.filter(l => l.event?.includes('warning') || l.event?.includes('csrf')).length,
    success: logs.filter(l => l.event?.includes('success') || l.event?.includes('login')).length,
  }), [logs]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-purple-600/50 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Security Dashboard</h2>
              <p className="text-xs text-gray-500">Session security events and monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-800">
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Events</p>
          </div>
          <div className="bg-green-600/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.success}</p>
            <p className="text-xs text-gray-500">Successful</p>
          </div>
          <div className="bg-yellow-600/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.warnings}</p>
            <p className="text-xs text-gray-500">Warnings</p>
          </div>
          <div className="bg-red-600/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
            <p className="text-xs text-gray-500">Errors</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-800">
          {/* Category Filter */}
          <div className="flex gap-2">
            {Object.entries(categories).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  filter === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-48 px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Actions */}
          <button
            onClick={loadLogs}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded transition-colors"
            title="Export JSON"
          >
            <Download className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={handleClear}
            className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No security events recorded yet.</p>
              <p className="text-xs text-gray-600 mt-1">Events will appear as you use the application.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log, idx) => {
                const style = getEventStyle(log.event);
                const Icon = style.icon;
                
                return (
                  <div
                    key={`${log.timestamp}-${idx}`}
                    className={`${style.bg} border border-gray-800 rounded-lg p-3`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${style.color} mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-bold text-sm ${style.color}`}>
                            {log.event?.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {log.data && Object.keys(log.data).length > 0 && (
                          <div className="text-xs text-gray-400 font-mono bg-gray-900/50 rounded p-2 mt-1 overflow-x-auto">
                            {Object.entries(log.data)
                              .filter(([key]) => key !== 'timestamp')
                              .map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-500">{key}:</span>{' '}
                                  <span className="text-gray-300">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            Showing {filteredLogs.length} of {logs.length} events • 
            Logs are stored in browser session storage and cleared on browser close
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
