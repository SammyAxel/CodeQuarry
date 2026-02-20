/**
 * BootcampManagePage - Admin page for creating/managing bootcamp sessions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Calendar, Clock, Users, Trash2, 
  Radio, Square, Edit3, Save, X, Tag, MonitorPlay 
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { 
  fetchSessions, createSession, updateSession, deleteSession, 
  goLive, endSession, fetchSessionEnrollments 
} from '../api/bootcampApi';

export default function BootcampManagePage() {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewEnrollments, setViewEnrollments] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  // Create form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 75,
    maxParticipants: 50,
    tags: ''
  });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/bootcamp');
      return;
    }
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await createSession(sessionData);
      setShowCreate(false);
      setForm({ title: '', description: '', scheduledAt: '', durationMinutes: 75, maxParticipants: 50, tags: '' });
      loadSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (sessionId) => {
    try {
      const sessionData = {
        ...form,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
      };
      await updateSession(sessionId, sessionData);
      setEditingId(null);
      loadSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      await deleteSession(sessionId);
      loadSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoLive = async (sessionId) => {
    try {
      await goLive(sessionId);
      loadSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!confirm('End this session?')) return;
    try {
      await endSession(sessionId);
      loadSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewEnrollments = async (sessionId) => {
    try {
      const data = await fetchSessionEnrollments(sessionId);
      setEnrollments(data);
      setViewEnrollments(sessionId);
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (session) => {
    setEditingId(session.id);
    setForm({
      title: session.title,
      description: session.description || '',
      scheduledAt: new Date(session.scheduledAt).toISOString().slice(0, 16),
      durationMinutes: session.durationMinutes,
      maxParticipants: session.maxParticipants,
      tags: session.tags?.join(', ') || ''
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/bootcamp')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black">Manage Bootcamp Sessions</h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 mb-6 space-y-4">
            <h2 className="text-lg font-bold mb-2">Create New Session</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 font-bold mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="e.g. JavaScript Fundamentals - Session 1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 font-bold mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 h-20 resize-none"
                  placeholder="What will this session cover?"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  min={15}
                  max={180}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Max Participants</label>
                <input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  min={1}
                  max={200}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold mb-1 block">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  placeholder="javascript, beginner, web"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors">
                Create Session
              </button>
            </div>
          </form>
        )}

        {/* Sessions List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MonitorPlay className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div className="font-bold">No sessions created yet</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
                {editingId === session.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="number"
                        value={form.durationMinutes}
                        onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="number"
                        value={form.maxParticipants}
                        onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-gray-400 text-sm font-bold"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleUpdate(session.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{session.title}</h3>
                          {session.status === 'live' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                              <Radio className="w-3 h-3 animate-pulse" /> LIVE
                            </span>
                          )}
                          {session.status === 'scheduled' && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">Scheduled</span>
                          )}
                          {session.status === 'ended' && (
                            <span className="px-2 py-0.5 bg-gray-600/20 text-gray-400 rounded-full text-xs font-bold">Ended</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(session.scheduledAt)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.durationMinutes} min</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {session.enrollmentCount || 0}/{session.maxParticipants}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => handleGoLive(session.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Radio className="w-3.5 h-3.5" /> Go Live
                          </button>
                        )}
                        {session.status === 'live' && (
                          <>
                            <button
                              onClick={() => navigate(`/bootcamp/classroom/${session.id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold transition-colors"
                            >
                              <MonitorPlay className="w-3.5 h-3.5" /> Enter Class
                            </button>
                            <button
                              onClick={() => handleEndSession(session.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Square className="w-3.5 h-3.5" /> End
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewEnrollments(session.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-400 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" /> Students
                        </button>
                        <button onClick={() => startEdit(session)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(session.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enrollments Modal */}
        {viewEnrollments && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setViewEnrollments(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Enrolled Students</h3>
                <button onClick={() => setViewEnrollments(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {enrollments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No enrollments yet</div>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{e.displayName || e.username}</span>
                        <span className="text-xs text-gray-500">@{e.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.attended && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">ATTENDED</span>
                        )}
                        <span className="text-xs text-gray-600">
                          {new Date(e.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
